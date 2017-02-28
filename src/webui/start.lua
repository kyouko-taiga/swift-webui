local Config  = require "lapis.config".get ()
local Et      = require "etlua"
local Http    = require "webui.jsonhttp".resty
local Mime    = require "mime"
local Model   = require "webui.model"
local gettime = require "socket".gettime
local Redis   = require "resty.redis"
local Yaml    = require "yaml"

local Start = {}

local gitconfig = [[
# This is Git's per-user configuration file.
[user]
  name = <%- name %>
  email = <%- email %>
[push]
  default = simple
[core]
  preloadindex = true
]]

function Start.perform (job)
  local user       = job.data.user
  local repository = job.data.repository
  local redis      = Redis:new ()
  redis:set_timeout (1000) -- 1 sec
  assert (redis:connect (Config.redis.host, Config.redis.port))
  if redis:setnx ("webui-state-" .. tostring (repository.id), "starting") == 0 then
    return
  end
  local user_info = Model.accounts:find {
    id = user.id,
  }
  assert (user_info.email)
  assert (user_info.public_key)
  pcall (function ()
    local info = Model.repositories:find {
      id = repository.id,
    }
    -- Docker image:
    local contents, status = Http {
      url     = repository.contents_url:gsub ("%{%+path%}", ".webui"),
      method  = "GET",
      headers = {
        ["Accept"       ] = "application/vnd.github.v3+json",
        ["Authorization"] = "token " .. tostring (user_info.token),
        ["User-Agent"   ] = Config.application.name,
      },
    }
    if status == 200 then
      assert (contents.encoding == "base64")
      contents = Yaml.load (Mime.unb64 (contents.content))
    else
      contents = {
        image = "swift",
      }
    end
    local image = assert (contents.image)
    -- Volume:
    local user_directory = Config.application.data .. "/" .. user.login
    local data_directory = user_directory .. "/" .. repository.name
    os.mkdir (data_directory)
    os.mkdir (data_directory .. "/.ssh")
    local file
    file = assert (io.open (user_directory .. "/.ssh" .. "/id_rsa.pub", "w"))
    file:write (user_info.public_key)
    file:close ()
    file = assert (io.open (user_directory .. "/.ssh" .. "/id_rsa", "w"))
    file:write (user_info.private_key)
    file:close ()
    file = assert (io.open (user_directory .. "/.gitconfig", "w"))
    file:write (Et.render (gitconfig, {
      name  = user.name,
      email = user_info.email,
    }))
    file:close ()
    -- Service:
    local service, state, _
    service, status = Http {
      url    = "docker:///containers/create",
      method = "POST",
      body   = {
        Enrypoint    = nil,
        Cmd          = {
          repository.full_name,
        },
        Image        = image,
        ExposedPorts = {
          ["8080/tcp"] = {},
        },
        HostConfig   = {
          PublishAllPorts = true,
        },
        Volumes      = {
          ["/data"] = {},
        },
      },
    }
    assert (status == 201, status)
    assert (info:update {
      docker = service.Id,
    })
    _, status = Http {
      method = "POST",
      url    = Et.render ("docker:///containers/<%- id %>/start", {
        id = service.Id,
      }),
      body   = {
        Binds = {
           data_directory .. ":/data",
        },
      },
    }
    assert (status == 204, status)
    local start = gettime ()
    while gettime () - start <= 120 do
      job:heartbeat ()
      state, status = Http {
        method = "GET",
        url    = Et.render ("docker:///containers/<%- id %>/json", {
          id = service.Id,
        }),
      }
      assert (status == 200, status)
      if state.State.Running then
        local data = ((state.NetworkSettings.Ports ["8080/tcp"] or {}) [1] or {})
        if data.HostPort then
          info:update {
            url = Et.render ("ws://<%- host %>:<%- port %>", {
              host = data.HostIp,
              port = data.HostPort,
            }),
          }
          return
        end
      elseif state.State.Dead then
        break
      else
        _G.ngx.sleep (1)
      end
    end
  end)
  redis:del ("webui-state-" .. tostring (repository.id))
  return true
end

return Start
