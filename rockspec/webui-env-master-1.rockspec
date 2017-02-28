package = "webui-env"
version = "master-1"
source  = {
  url    = "git+https://github.com/kyouko-taiga/swift-webui.git",
  branch = "master",
}

description = {
  summary    = "Webui: dev dependencies",
  detailed   = [[]],
  homepage   = "https://github.com/kyouko-taiga/swift-webui",
  license    = "MIT/X11",
  maintainer = "Alban Linard <alban@linard.fr>",
}

dependencies = {
  "lua >= 5.1",
  "busted",
  "cluacov",
  "etlua",
  "jwt",
  "luacheck",
  "luacov",
  "luacov-coveralls",
  "luasocket",
  "luasec",
  "lua-websockets",
}

build = {
  type    = "builtin",
  modules = {},
}
