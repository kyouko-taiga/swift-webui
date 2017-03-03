local Config = require "lapis.config"
local Url    = require "socket.url"

local docker_url   = assert (Url.parse (os.getenv "DOCKER_PORT"  ))
local postgres_url = assert (Url.parse (os.getenv "POSTGRES_PORT"))
local redis_url    = assert (Url.parse (os.getenv "REDIS_PORT"   ))

local common = {
  host         = "localhost",
  port         = 8080,
  num_workers  = 1,
  session_name = "webui",
  application  = {
    name   = "Webui",
    id     = assert (os.getenv "APPLICATION_ID"    ),
    secret = assert (os.getenv "APPLICATION_SECRET"),
  },
  data = {
    outside = assert (os.getenv "DATA_DIRECTORY"),
    inside  = "/data",
  },
  postgres = {
    backend  = "pgmoon",
    host     = assert (postgres_url.host),
    port     = assert (postgres_url.port),
    user     = assert (os.getenv "POSTGRES_USER"    ),
    password = assert (os.getenv "POSTGRES_PASSWORD"),
    database = assert (os.getenv "POSTGRES_DATABASE"),
  },
  redis = {
    host     = assert (redis_url.host),
    port     = assert (redis_url.port),
    database = 0,
  },
  docker = {
    username = assert (os.getenv "DOCKER_USER"  ),
    api_key  = assert (os.getenv "DOCKER_SECRET"),
    host     = assert (docker_url.host),
    port     = assert (docker_url.port),
  },
  clean = {
    delay = 10,
  },
  jsonhttp = {
    delay = 24 * 50 * 60,
  },
}

Config ({ "test", "development", "production" }, common)
