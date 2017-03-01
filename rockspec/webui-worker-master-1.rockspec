package = "webui-worker"
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
  "argparse",
  "copas",
  "etlua",
  "inotify",
  "lpeg",
  "luafilesystem",
  "lua-websockets",
  "magic",
  "rapidjson",
}

build = {
  type    = "builtin",
  modules = {},
  install = {
    bin = {
      ["webui-worker"] = "src/webui/worker.lua",
    },
  },
}
