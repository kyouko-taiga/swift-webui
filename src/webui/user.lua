local Config  = require "lapis.config".get ()
local Et      = require "etlua"
local Redis   = require "resty.redis"
local Http    = require "webui.jsonhttp".resty
local Model   = require "webui.model"

local User = {}

local ssh_keygen = [[
rm -f "<%- filename %>"
ssh-keygen -t rsa -b 4096 -C "<%- email %>" -f "<%- filename %>" -q -N ""
]]

function User.perform (job)
  local user_info = Model.accounts:find {
    id = job.data.user.id,
  }
  local redis = Redis:new ()
  redis:set_timeout (1000) -- 1 sec
  assert (redis:connect (Config.redis.host, Config.redis.port))
  if redis:setnx ("webui-user-" .. tostring (user_info.id), "creating") == 0 then
    return
  end
  pcall (function ()
    if not user_info.email then
      local emails, status = Http {
        url     = "https://api.github.com/user/emails",
        method  = "GET",
        headers = {
          ["Accept"       ] = "application/vnd.github.v3+json",
          ["Authorization"] = "token " .. user_info.token,
          ["User-Agent"   ] = Config.application.name,
        },
      }
      assert (status == 200)
      for _, x in ipairs (emails) do
        if x.primary then
          user_info:update {
            email = x.email,
          }
        end
      end
    end
    if not user_info.public_key then
      local filename = os.tmpname ()
      assert (os.execute (Et.render (ssh_keygen, {
        filename = filename,
        email    = user_info.email,
      })))
      local public_key, private_key
      do
        local file = assert (io.open (filename, "r"))
        private_key = file:read "*a"
        file:close ()
      end
      do
        local file = assert (io.open (filename .. ".pub", "r"))
        public_key = file:read "*a"
        file:close ()
      end
      local _, status = Http {
        url     = "https://api.github.com/user/keys",
        method  = "POST",
        headers = {
          ["Accept"       ] = "application/vnd.github.v3+json",
          ["Authorization"] = "token " .. user_info.token,
          ["User-Agent"   ] = Config.application.name,
        },
        body    = {
          title = "Remote Development Environment",
          key   = public_key,
        },
      }
      assert (status == 201)
      assert (user_info:update {
        public_key  = public_key,
        private_key = private_key,
      })
    end
  end)
  redis:del ("webui-user-" .. tostring (user_info.id))
end

return User
