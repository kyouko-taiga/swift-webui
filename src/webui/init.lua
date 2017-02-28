local Config = require "lapis.config".get ()
local Csrf   = require "lapis.csrf"
local Et     = require "etlua"
local Http   = require "webui.jsonhttp".resty
local Lapis  = require "lapis"
local Mime   = require "mime"
local Model  = require "webui.model"
local Qless  = require "resty.qless"
local Util   = require "lapis.util"

local app  = Lapis.Application ()
app.layout = false

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

app:match ("/repositories", function (self)
  if not self.session.user then
    return { redirect_to = "/login" }
  end
  local user_info = Model.accounts:find {
    id = self.session.user.id,
  }
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
        id = repository.id,
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
  return { status = 204 }
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
    })
    assert (os.mkdir (Config.application.data .. "/" .. user.login))
  end) then
    assert (Model.accounts:find {
      id = user.id,
    }:update {
      token = token.access_token,
    })
  end
  local qless = Qless.new (Config.redis)
  local queue = qless.queues ["webui"]
  queue:put ("webui.user", {
    user = user,
  })
  self.session.user = user
  return { redirect_to = "/repositories" }
end)

app:match ("/repositories/:owner/:repository", function (self)
  if not self.session.user then
    return { redirect_to = "/login" }
  end
  local user_info = Model.accounts:find {
    id = self.session.user.id,
  }
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
      id = repository.id,
    })
  end) then
    assert (Model.repositories:find {
      id = repository.id,
    })
  end
  local info = Model.repositories:find {
    id = repository.id,
  }
  if info.url then
    repository.webui_url = info.url
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
    return { status = 409 }
  end
end)

return app
