import { schema } from 'normalizr'

const repository = new schema.Entity('repositories', {}, {idAttribute: 'id'})
const file = new schema.Entity('files', {}, {idAttribute: 'path'})


export default {
    repository,
    file
}
