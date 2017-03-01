package = "webui"
version = "master-1"
source  = {
  url    = "git+https://github.com/kyouko-taiga/swift-webui.git",
  branch = "master",
}

description = {
  summary    = "Webui",
  detailed   = [[]],
  homepage   = "https://github.com/kyouko-taiga/swift-webui",
  license    = "MIT/X11",
  maintainer = "Alban Linard <alban@linard.fr>",
}

dependencies = {
  "lua >= 5.1",
  "etlua",
  "lapis",
  "lpeg",
  "luafilesystem",
  "luaossl",
  "luaposix",
  "luasec",
  "luasocket",
  "luasocket-unix",
  "lua-resty-exec",
  "lua-resty-http",
  "lua-resty-qless", -- FIXME: remove rockspec, fix wercker.yml and Dockerfile
  "lua-websockets",
  "magic",
  "rapidjson",
  "yaml",
}

build = {
  type    = "builtin",
  modules = {
    ["webui"           ] = "src/webui/init.lua",
    ["webui.config"    ] = "src/webui/config.lua",
    ["webui.jsonhttp"  ] = "src/webui/jsonhttp.lua",
    ["webui.migrations"] = "src/webui/migrations.lua",
    ["webui.model"     ] = "src/webui/model.lua",
    ["webui.start"     ] = "src/webui/start.lua",
    ["webui.user"      ] = "src/webui/user.lua",
  },
  install = {
    bin = {
      ["webui"] = "src/webui/bin.lua",
    },
  },
}
