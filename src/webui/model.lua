local Model  = require "lapis.db.model".Model
local result = {}

result.accounts     = Model:extend ("accounts", {})
result.repositories = Model:extend ("repositories", {})

return result
