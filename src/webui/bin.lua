#! /usr/bin/env lua

local Posix  = require "posix"
local Setenv = require "posix.stdlib".setenv
local Socket = require "socket"
local Stat   = require "posix.sys.stat".stat
local Url    = require "socket.url"

assert (Stat "/var/run/docker.sock")
print "Fixing permissions on docker socket..."
assert (Posix.chmod ("/var/run/docker.sock", "ugo+w"))

-- FIXME:  nginx resolver does not seem to work within docker-compose or
-- docker-cloud, so we convert all service hostnames to ips before
-- launching the server.
for _, address in ipairs { "POSTGRES_PORT", "REDIS_PORT" } do
  local parsed = assert (Url.parse (os.getenv (address)))
  parsed.host  = assert (Socket.dns.toip (parsed.host))
  Setenv (address, Url.build (parsed))
end

print "Waiting for services to run..."
for _, address in ipairs { "POSTGRES_PORT", "REDIS_PORT" } do
  local parsed = assert (Url.parse (os.getenv (address)))
  local socket = Socket.tcp ()
  local i      = 0
  while not socket:connect (parsed.host, parsed.port) do
    if i > 30 then
      error (os.getenv (address) .. " is not reachable.")
    end
    os.execute [[ sleep 1 ]]
    i = i+1
  end
end

print "Applying database migrations..."
assert (os.execute ("lapis migrate"))

print "Starting server..."
assert (os.execute ("lapis server"))
