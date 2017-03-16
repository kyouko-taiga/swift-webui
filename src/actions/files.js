import api from '../api'
import { LIST_FILES, CREATE_FILE, GET_FILE } from './types'
import { makeRequestCreator } from './factories'


export function list(workspaceName, {requestId} = {}) {
    return makeRequestCreator(
        LIST_FILES,
        api.workspaces.select(workspaceName).files.list().get(),
        {
            args: {workspaceName},
            requestId: requestId
        }
    )
}

export function create(file, {requestId} = {}) {
    return makeRequestCreator(
        CREATE_FILE,
        api.workspaces.select(file.workspace).files.select(file.path).post(file),
        {
            args: {file},
            requestId: requestId
        }
    )
}

export function get(workspaceName, filePath, {requestId} = {}) {
    return makeRequestCreator(
        GET_FILE,
        api.workspaces.select(workspaceName).files.select(filePath).get(),
        {
            args: {workspaceName, filePath},
            requestId: requestId
        }
    )
}
