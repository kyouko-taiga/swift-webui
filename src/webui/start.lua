local Config   = require "lapis.config".get ()
local Database = require "lapis.db"
local Et       = require "etlua"
local Http     = require "webui.jsonhttp".resty
local Mime     = require "mime"
local Model    = require "webui.model"
local Posix    = require "posix"
local Redis    = require "resty.redis"
local Yaml     = require "yaml"
local Client   = require "resty.websocket.client"

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
  mergeoptions = --no-edit
]]

local gitclone = [[
mkdir -p $HOME/.ssh
cp /data/.ssh/* $HOME/.ssh/
chmod 400 $HOME/.ssh/id_rsa
ssh-keyscan -H github.com >> $HOME/.ssh/known_hosts
git clone "git@github.com:<%- owner %>/<%- repository %>.git"
]]

function Start.perform (job)
  local user       = job.data.user
  local repository = job.data.repository
  local redis      = Redis:new ()
  redis:set_timeout (1000) -- 1 sec
  assert (redis:connect (Config.redis.host, Config.redis.port))
  if redis:setnx ("webui-start-" .. tostring (repository.id), "starting") == 0 then
    return
  end
  local user_info = Model.accounts:find {
    id = user.id,
  }
  assert (user_info.email)
  assert (user_info.public_key)
  local info = Model.repositories:find {
    id = repository.id,
  }
  local ok, err = pcall (function ()
    -- Docker image:
    local image
    do
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
      image = assert (contents.image)
    end

    -- Volume:
    local user_directory    = Config.data.inside .. "/" .. user.login
    local data_directory    = user_directory .. "/" .. repository.name
    local outside_directory = Config.data.outside .. "/" .. user.login .. "/" .. repository.name
    Posix.mkdir (user_directory)
    Posix.mkdir (data_directory)
    Posix.mkdir (data_directory .. "/.ssh")
    local file
    file = assert (io.open (data_directory .. "/.ssh" .. "/id_rsa.pub", "w"))
    assert (file:write (user_info.public_key))
    assert (file:close ())
    file = assert (io.open (data_directory .. "/.ssh" .. "/id_rsa", "w"))
    assert (file:write (user_info.private_key))
    assert (file:close ())
    file = assert (io.open (data_directory .. "/.gitconfig", "w"))
    assert (file:write (Et.render (gitconfig, {
      name  = user.name,
      email = user_info.email,
    })))
    assert (file:close ())

    -- Service:
    do
      job:heartbeat ()
      local _
      local service, status = Http {
        url    = Et.render ("http://<%- host %>:<%- port %>/containers/create", {
          host = Config.docker.host,
          port = Config.docker.port,
        }),
        method = "POST",
        body   = {
          Entrypoint   = "/bin/bash",
          Image        = image,
          HostConfig   = {
            PublishAllPorts = true,
            Binds           = { outside_directory .. ":/data" },
          },
          WorkingDir   = "/data",
          OpenStdin    = true,
          AttachStdin  = true,
          AttachStdout = true,
          AttachStderr = true,
          Tty          = false,
        },
      }
      assert (status == 201, status)
      _, status = Http {
        method = "POST",
        url    = Et.render ("http://<%- host %>:<%- port %>/containers/<%- container %>/start", {
          host      = Config.docker.host,
          port      = Config.docker.port,
          container = service.Id,
        }),
      }
      assert (status == 204, status)
      local stdin  = assert (Client:new ())
      local stdout = assert (Client:new ())
      local stderr = assert (Client:new ())
      assert (stderr:connect (Et.render ("ws://<%- host %>:<%- port %>/containers/<%- container %>/attach/ws?<%- type %>=true&stream=true", {
        host      = Config.docker.host,
        port      = Config.docker.port,
        container = service.Id,
        type      = "stderr",
      })))
      assert (stdout:connect (Et.render ("ws://<%- host %>:<%- port %>/containers/<%- container %>/attach/ws?<%- type %>=true&stream=true", {
        host      = Config.docker.host,
        port      = Config.docker.port,
        container = service.Id,
        type      = "stdout",
      })))
      assert (stdin:connect (Et.render ("ws://<%- host %>:<%- port %>/containers/<%- container %>/attach/ws?<%- type %>=true&stream=true", {
        host      = Config.docker.host,
        port      = Config.docker.port,
        container = service.Id,
        type      = "stdin",
      })))
      while true do
        local state, state_status = Http {
          method = "GET",
          url    = Et.render ("http://<%- host %>:<%- port %>/containers/<%- container %>/json", {
            host      = Config.docker.host,
            port      = Config.docker.port,
            container = service.Id,
          }),
        }
        assert (state_status == 200, state_status)
        if state.State.Running then
          break
        end
        assert (not state.State.OOMKilled)
        assert (not state.State.Dead)
        assert (not state.State.Paused)
        _G.ngx.sleep (1)
      end
      assert (stdin:send_text (Et.render (gitclone, {
        owner          = user.login,
        repository     = repository.name,
      })))
      -- Do not know why it seems to work when stdout/stderr streams are read...
      for _ = 1, 5 do
        stdout:recv_frame()
      end
      for _ = 1, 5 do
        stderr:recv_frame()
      end
      stdin :send_close ()
      stdout:send_close ()
      stderr:send_close ()
      assert (info:update {
        shell = service.Id,
      })
    end

    do
      job:heartbeat ()
      local service, status = Http {
        url    = Et.render ("http://<%- host %>:<%- port %>/containers/create", {
          host = Config.docker.host,
          port = Config.docker.port,
        }),
        method = "POST",
        body   = {
          Image      = "saucisson/ws-inotify",
          Cmd        = {
            "--port=8080",
            "--directory=/data",
            "--md5",
            "--mime",
          },
          HostConfig   = {
            PublishAllPorts = true,
            Binds           = { outside_directory .. ":/data" },
          },
          WorkingDir   = "/data",
        },
      }
      assert (status == 201, status)
      local _
      _, status = Http {
        method = "POST",
        url    = Et.render ("http://<%- host %>:<%- port %>/containers/<%- container %>/start", {
          host      = Config.docker.host,
          port      = Config.docker.port,
          container = service.Id,
        }),
      }
      assert (status == 204, status)
      while true do
        local state, state_status = Http {
          method = "GET",
          url    = Et.render ("http://<%- host %>:<%- port %>/containers/<%- container %>/json", {
            host      = Config.docker.host,
            port      = Config.docker.port,
            container = service.Id,
          }),
        }
        assert (state_status == 200, state_status)
        if state.State.Running then
          break
        end
        assert (not state.State.OOMKilled)
        assert (not state.State.Dead)
        assert (not state.State.Paused)
        _G.ngx.sleep (1)
      end
      assert (info:update {
        notify = service.Id,
      })
    end

  end)
  if not ok then
    print (err)
    if info.shell then
      local _, status = Http {
        method = "DELETE",
        url    = Et.render ("http://<%- host %>:<%- port %>/containers/<%- container %>?force=true", {
          host      = Config.docker.host,
          port      = Config.docker.port,
          container = info.shell,
        }),
      }
      assert (status == 204, status)
      assert (info:update {
        shell = Database.NULL,
      })
    end
    if info.notify then
      local _, status = Http {
        method = "DELETE",
        url    = Et.render ("http://<%- host %>:<%- port %>/containers/<%- container %>?force=true", {
          host      = Config.docker.host,
          port      = Config.docker.port,
          container = info.notify,
        }),
      }
      assert (status == 204, status)
      assert (info:update {
        notify = Database.NULL,
      })
    end
  end
  redis:del ("webui-start-" .. tostring (repository.id))
  return true
end

return Start
