local Config     = require "lapis.config".get ()
local Csrf       = require "lapis.csrf"
local Et         = require "etlua"
local Http       = require "webui.jsonhttp".resty
local Json       = require "rapidjson"
local Lapis      = require "lapis"
local Mime       = require "mime"
local Model      = require "webui.model"
local Qless      = require "resty.qless"
local Util       = require "lapis.util"
local respond_to = require "lapis.application".respond_to

local app  = Lapis.Application ()
app.layout = false
app:enable "etlua"

app.handle_error = function (_, error, trace)
  print (error)
  print (trace)
  return {
    status = 500,
  }
end

app.handle_404 = function ()
  return {
    status = 404,
  }
end

app:before_filter (function (self)
  local token = self.req.headers ["Webui-Token"]
  if token then
    self.session.user = Json.decode (token) -- FIXME: should be signed
  end
end)

app:match ("/", function (self)
  if not self.session.user then
    return { redirect_to = "/login" }
  end
  self.token = Json.encode (self.session.user)
  return {
    status = 200,
    render = "index",
  }
end)

app:match ("/login", function (self)
  return {
    redirect_to = Et.render ("https://github.com/login/oauth/authorize?state=<%- state %>&scope=<%- scope %>&client_id=<%- client_id %>", {
      client_id = Config.application.id,
      state     = Mime.b64 (Csrf.generate_token (self)),
      scope     = Util.escape "user:email write:public_key",
    })
  }
end)

app:match ("/logout", function (self)
  self.session.user = nil
  return { redirect_to = "http://cui.unige.ch" }
end)

app:match ("/register", function (self)
  self.params.csrf_token = Mime.unb64 (self.params.state)
  assert (Csrf.validate_token (self))
  local user, token, status
  token, status = Http {
    url     = "https://github.com/login/oauth/access_token",
    method  = "POST",
    headers = {
      ["Accept"    ] = "application/json",
      ["User-Agent"] = Config.application.name,
    },
    body    = {
      client_id     = Config.application.id,
      client_secret = Config.application.secret,
      state         = self.params.state,
      code          = self.params.code,
    },
  }
  assert (status == 200, status)
  if not token.access_token then
    return { status = 403 }
  end
  user, status = Http {
    url     = "https://api.github.com/user",
    method  = "GET",
    headers = {
      ["Accept"       ] = "application/vnd.github.v3+json",
      ["Authorization"] = "token " .. token.access_token,
      ["User-Agent"   ] = Config.application.name,
    },
  }
  assert (status == 200, status)
  if not pcall (function ()
    assert (Model.accounts:create {
      id    = user.id,
      token = token.access_token,
      login = user.login,
    })
    assert (os.mkdir (Config.data.inside .. "/" .. user.login))
  end) then
    assert (Model.accounts:find {
      id = user.id,
    }:update {
      token = token.access_token,
      login = user.login,
    })
  end
  local qless = Qless.new (Config.redis)
  local queue = qless.queues ["webui"]
  queue:put ("webui.user", {
    user = user,
  })
  self.session.user = user
  return { redirect_to = "/" }
end)

app:match ("/api/repositories/", function (self)
  if not self.session.user then
    return { redirect_to = "/login" }
  end
  local user_info = assert (Model.accounts:find {
    id = self.session.user.id,
  })
  local repositories, status = Http {
    url     = "https://api.github.com/user/repos",
    method  = "GET",
    headers = {
      ["Accept"       ] = "application/vnd.github.v3+json",
      ["Authorization"] = "token " .. user_info.token,
      ["User-Agent"   ] = Config.application.name,
    },
  }
  assert (status == 200, status)
  for _, repository in ipairs (repositories) do
    if not pcall (function ()
      assert (Model.repositories:create {
        id    = repository.id,
        owner = repository.owner.login,
        name  = repository.name,
      })
    end) then
      assert (Model.repositories:find {
        id = repository.id,
      })
    end
  end
  return {
    status = 200,
    json   = repositories,
  }
end)

app:match ("/api/repositories/:owner/:repository", function (self)
  if not self.session.user
  or self.session.user.login ~= self.params.owner then
    return { status = 403 }
  end
  local user_info = assert (Model.accounts:find {
    id = self.session.user.id,
  })
  local repository, status
  for _, token in ipairs { user_info.token, Config.application.token } do
    repository, status = Http {
      url     = Et.render ("https://api.github.com/repos/<%- owner %>/<%- repository %>", {
        owner      = self.params.owner,
        repository = self.params.repository,
      }),
      method  = "GET",
      headers = {
        ["Accept"       ] = "application/vnd.github.v3+json",
        ["Authorization"] = "token " .. tostring (token),
        ["User-Agent"   ] = Config.application.name,
      },
    }
    if status == 404 then
      return { status = 404 }
    end
    assert (status == 200, status)
    if not repository.permissions.pull
    or not repository.permissions.push then
      return { status = 403 }
    end
  end
  if not pcall (function ()
    assert (Model.repositories:create {
      id    = repository.id,
      owner = repository.owner.login,
      name  = repository.name,
    })
  end) then
    assert (Model.repositories:find {
      id = repository.id,
    })
  end
  local info = Model.repositories:find {
    id = repository.id,
  }
  if info.shell and info.notify then
    return {
      status = 200,
      json   = repository,
    }
  else
    local qless = Qless.new (Config.redis)
    local queue = qless.queues ["webui"]
    queue:put ("webui.start", {
      user       = self.session.user,
      repository = repository,
    })
    return { status = 202 }
  end
end)

app:match ("/api/repositories/:owner/:repository/*", respond_to {
  GET = function (self)
    if not self.session.user
    or self.session.user.login ~= self.params.owner then
      return { status = 403 }
    end
    local user_directory = Config.data.inside .. "/" .. self.params.owner
    local data_directory = user_directory .. "/" .. self.params.repository
    local base_directory = data_directory .. "/" .. self.params.repository
    local file, err = io.open (base_directory .. "/" .. self.params.splat, "r")
    if not file then
      return {
        status = 404,
        json = { error = err }
      }
    end
    local content = assert (file:read "*a")
    assert (file:close ())
    return {
      status = 200,
      json = {
        path    = self.params.splat,
        content = content,
      }
    }
  end,
  DELETE = function (self)
    if not self.session.user
    or self.session.user.login ~= self.params.owner then
      return { status = 403 }
    end
    local user_directory = Config.data.inside .. "/" .. self.params.owner
    local data_directory = user_directory .. "/" .. self.params.repository
    local base_directory = data_directory .. "/" .. self.params.repository
    local ok, err = os.remove (base_directory .. "/" .. self.params.splat)
    if not ok then
      return {
        status = 404,
        json = { error = err }
      }
    end
    return { status = 204 }
  end,
  PUT = function (self)
    if not self.session.user
    or self.session.user.login ~= self.params.owner then
      return { status = 403 }
    end
    local user_directory = Config.data.inside .. "/" .. self.params.owner
    local data_directory = user_directory .. "/" .. self.params.repository
    local base_directory = data_directory .. "/" .. self.params.repository
    local file, err = io.open (base_directory .. "/" .. self.params.splat, "w")
    if not file then
      return {
        status = 404,
        json = { error = err }
      }
    end
    _G.ngx.req.read_body ()
    assert (file:write (_G.ngx.req.get_body_data ()))
    assert (file:close ())
    return { status = 201 }
  end,
})

app:match ("/streams/:owner/:repository/:type", function (self)
  if not self.session.user
  or self.session.user.login ~= self.params.owner then
    return { status = 403 }
  end
  local repository_info = Model.repositories:find {
    owner = self.params.owner,
    name  = self.params.repository,
  }
  if self.params.type == "shell" then
    if not repository_info
    or not repository_info.shell then
      return { status = 404 }
    end
    local state, status = Http {
      method = "GET",
      url    = Et.render ("http://<%- host %>:<%- port %>/containers/<%- container %>/json", {
        host      = Config.docker.host,
        port      = Config.docker.port,
        container = repository_info.shell,
      }),
    }
    assert (status == 200, status)
    assert (state.State.Running)
    local data = ((state.NetworkSettings.Ports ["8080/tcp"] or {}) [1] or {})
    _G.ngx.var.target = Et.render ("http://<%- host %>:<%- port %>/wetty", {
      host = data.HostIp,
      port = data.HostPort,
    })
  elseif self.params.type == "notify" then
    if not repository_info
    or not repository_info.notify then
      return { status = 404 }
    end
    local state, status = Http {
      method = "GET",
      url    = Et.render ("http://<%- host %>:<%- port %>/containers/<%- container %>/json", {
        host      = Config.docker.host,
        port      = Config.docker.port,
        container = repository_info.notify,
      }),
    }
    assert (status == 200, status)
    assert (state.State.Running)
    local data = ((state.NetworkSettings.Ports ["8080/tcp"] or {}) [1] or {})
    _G.ngx.var.target = Et.render ("http://<%- host %>:<%- port %>", {
      host = data.HostIp,
      port = data.HostPort,
    })
  else
    return { status = 400 }
  end
end)


return app
