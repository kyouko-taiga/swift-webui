local Arguments = require "argparse"
local Copas     = require "copas"
local Json      = require "rapidjson"
local Websocket = require "websocket"

local parser = Arguments () {
  name        = "webui",
  description = "",
}

parser:option "--token" {
  description = "user token",
  default     = "abcde",
}
parser:option "--port" {
  description = "port",
  convert     = tonumber,
  default     = 8080,
}
local arguments = parser:parse ()

Copas.addthread (function ()
  local client = Websocket.client.copas {}
  print (client:connect ("ws://localhost:" .. tostring (arguments.port), "webui"))
  client:send (Json.encode {
    type  = "authenticate",
    token = arguments.token,
  })
  client:receive ()
  client:send (Json.encode {
    type    = "execute",
    command = [[ cd docker-base && git status ]],
  })
  print (client:receive ())
  print (client:receive ())
  client:send (Json.encode {
    type    = "execute",
    command = [[ cd docker-base && touch machin ]],
  })
  print (client:receive ())
  print (client:receive ())
end)
Copas.loop ()
