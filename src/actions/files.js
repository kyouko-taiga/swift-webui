import api from '../api'
import { LIST_FILES, GET_FILE, PATCH_FILE } from './types'
import { makeRequestCreator } from './factories'


export function list(repositoryId, {requestId} = {}) {
    return makeRequestCreator(
        LIST_FILES,
        api.repositories.select(repositoryId).files.list().get(),
        {
            args: {repositoryId},
            requestId: requestId
        }
    )
}


export function get(repositoryId, filePath, {requestId} = {}) {
    return makeRequestCreator(
        GET_FILE,
        api.repositories.select(repositoryId).files.select(filePath).get(),
        {
            args: {repositoryId, filePath},
            requestId: requestId
        }
    )
}


export function patch(file, {requestId} = {}) {
    return makeRequestCreator(
        PATCH_FILE,
        api.repositories.select(file.repository).files.select(file.path).patch(file),
        {
            args: {file},
            requestId: requestId
        }
    )
}
