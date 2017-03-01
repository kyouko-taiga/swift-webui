#! /usr/bin/env lua

local oldprint = print
_G.print = function (...)
  oldprint (...)
  io.stdout:flush ()
end

local oldexecute = os.execute
_G.os.execute = function (...)
  print (...)
  return oldexecute (...)
end

_G.table.unpack = table.unpack or unpack

local Arguments = require "argparse"
local Copas     = require "copas"
local Et        = require "etlua"
local Inotify   = require "inotify"
local Json      = require "rapidjson"
local Lfs       = require "lfs"
local Lpeg      = require "lpeg"
local Magic     = require "magic"
local Websocket = require "websocket"

local magic = Magic.open (Magic.MIME_TYPE, Magic.NO_CHECK_COMPRESS)
assert (magic:load () == 0)

local inotify = Inotify.init {
  blocking = false,
}
local notifies = {
  inotify.IN_ATTRIB,
  inotify.IN_CLOSE_WRITE,
  inotify.IN_CREATE,
  inotify.IN_DELETE,
  inotify.IN_DELETE_SELF,
  inotify.IN_MODIFY,
  inotify.IN_MOVE_SELF,
  inotify.IN_MOVED_FROM,
  inotify.IN_MOVED_TO,
}

local Patterns = {}
Lpeg.locale (Patterns)
Patterns.module =
  (Patterns.alnum + Lpeg.P"-" + Lpeg.P"_" + Lpeg.P".")^1 / tostring
Patterns.identifier =
  (Patterns.alnum + Lpeg.P"-")^1 / tostring
Patterns.repository =
  Lpeg.Ct (
      Patterns.identifier
    * Lpeg.P"/"
    * Patterns.identifier
  ) / function (t)
    return {
      owner      = t [1],
      repository = t [2],
      full_name  = t [1] .. "/" .. t [2],
    }
  end

local parser = Arguments () {
  name        = "webui",
  description = "",
}
parser:argument "repository" {
  description = "repository to use (in 'user/repository' format)",
  convert     = function (x)
    return assert (Patterns.repository:match (x))
  end,
}
parser:argument "token" {
  description = "user token",
}
parser:option "--port" {
  description = "port",
  convert     = tonumber,
  default     = 8080,
}
parser:option "--timeout" {
  description = "timeout",
  convert     = tonumber,
  default     = 60, -- seconds
}
parser:option "--data" {
  description = "data directory",
  default     = "/data",
}
local arguments = parser:parse ()

assert (os.execute (Et.render ([[
  cd "<%- data %>"
  if [ ! -d "<%- repository %>" ]
  then
    git clone "https://github.com/<%- owner %>/<%- repository %>.git"
  fi
]], {
  data       = arguments.data,
  owner      = arguments.repository.owner,
  repository = arguments.repository.repository,
})))
local base_directory = arguments.data .. "/" .. arguments.repository.repository

local function current_branch (where)
  local file = io.popen (Et.render ([[
    cd "<%- directory %>"
    git rev-parse --abbrev-ref HEAD
  ]], {
    directory = where,
  }), "r")
  local result = file:read "*l"
  file:close ()
  return result
end

local watchers = {}

local function current_files (where, prefix, result)
  prefix = prefix or where
  result = result or {}
  for entry in Lfs.dir (where) do
    local path = where .. "/" .. entry
    if not entry:match "^%." then
      watchers [#watchers+1] = inotify:addwatch (path, table.unpack (notifies))
      if Lfs.attributes (path, "mode") == "directory" then
        result [path] = {
          type     = "directory",
          mimetype = magic:file (path),
          path     = path:sub (#prefix+2),
          name     = entry,
        }
        current_files (path, prefix, result)
      elseif Lfs.attributes (path, "mode") == "file" then
        local file    = io.open (path, "r")
        local content = file:read "*a"
        file:close ()
        result [path] = {
          type     = "file",
          mimetype = magic:file (path),
          path     = path:sub (#prefix+2),
          name     = entry,
          content  = content,
        }
      end
    end
  end
  return result
end

local copas_addserver = Copas.addserver
Copas.addserver = function (socket, f)
  arguments.last   = os.time ()
  arguments.socket = socket
  arguments.host, arguments.port = socket:getsockname ()
  print ("listening on:", arguments.host, arguments.port)
  copas_addserver (socket, f)
end
local clients = setmetatable ({}, { __mode = "k" })
local server  = Websocket.server.copas.listen {
  port      = arguments.port,
  default   = function () end,
  protocols = {
    webui = function (ws)
      print ("connection:", "open")
      arguments.last = os.time ()
      clients [ws] = true
      local message = ws:receive ()
      message = Json.decode (message)
      assert (message.type == "authenticate")
      assert (message.token == arguments.token)
      ws:send (Json.encode {
        type   = "list",
        files  = current_files  (base_directory),
        branch = current_branch (base_directory),
      })
      while ws.state == "OPEN" do
        pcall (function ()
          message = ws:receive ()
          print ("message:", message)
          message = Json.decode (message)
          if message.type == "patch" then
            local file = io.open (base_directory .. "/" .. message.file, "w")
            if file then
              file:write (message.contents)
              file:close ()
            end
          elseif message.type == "execute" then
            local file = io.popen (message.command, "r")
            for line in file:lines () do
              ws:send (Json.encode {
                type = "log",
                line = line,
              })
            end
            file:close ()
          end
        end)
      end
      print ("connection:", "close")
    end,
  },
}
Copas.addthread (function ()
  while arguments.running do
    if  next (clients) == nil
    and arguments.last + arguments.timeout <= os.time ()
    then
      arguments.running = false
      server:close ()
    else
      Copas.sleep (arguments.timeout / 2 + 1)
    end
  end
end)
Copas.addthread (function ()
  while arguments.running do
    for _, watcher in ipairs (watchers) do
      local events = watcher:read ()
      if #events ~= 0 then
        watchers = {}
        local files  = current_files  (base_directory)
        local branch = current_branch (base_directory)
        for client in pairs (clients) do
          client:send (Json.encode {
            type   = "list",
            files  = files,
            branch = branch,
          })
        end
      end
    end
  end
end)
Copas.addserver = copas_addserver

Copas.loop ()
