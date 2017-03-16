import api from '../api'
import { LIST_WORKSPACES, GET_WORKSPACE, CREATE_WORKSPACE } from './types'
import { makeRequestCreator } from './factories'


export function list({ requestId } = {}) {
    return makeRequestCreator(
        LIST_WORKSPACES,
        api.workspaces.list().get(),
        { args: {}, requestId, }
    )
}

export function create(workspace, { requestId } = {}) {
    return makeRequestCreator(
        CREATE_WORKSPACE,
        api.workspaces.post(workspace),
        { args: { workspace }, requestId, }
    )
}

export function get(workspaceId, { requestId } = {}) {
    return makeRequestCreator(
        GET_WORKSPACE,
        api.workspaces.select(workspaceId).get(),
        { args: { workspaceId }, requestId, }
    )
}
