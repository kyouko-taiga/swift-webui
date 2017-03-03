local Schema = require "lapis.db.schema"

return {
  function ()
    Schema.create_table ("accounts", {
      { "id"         , Schema.types.integer { primary_key = true } },
      { "token"      , Schema.types.text    { null        = true } },
      { "email"      , Schema.types.text    { null        = true } },
      { "public_key" , Schema.types.text    { null        = true } },
      { "private_key", Schema.types.text    { null        = true } },
    })
  end,
  function ()
    Schema.create_table ("repositories", {
      { "id"    , Schema.types.integer { primary_key = true } },
      { "shell" , Schema.types.text    { null        = true } },
      { "notify", Schema.types.text    { null        = true } },
      { "owner" , Schema.types.text },
      { "name"  , Schema.types.text },
    })
  end,
}
