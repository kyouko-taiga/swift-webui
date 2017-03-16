import { schema } from 'normalizr'

const workspace = new schema.Entity('workspaces', {}, {idAttribute: 'id'})
const file = new schema.Entity('files', {}, {idAttribute: 'path'})


export default {
    workspace,
    file
}
