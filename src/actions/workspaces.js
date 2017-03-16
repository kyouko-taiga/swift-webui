import api from '../api'
import { LIST_WORKSPACES } from './types'
import { makeRequestCreator } from './factories'


export function list({ requestId } = {}) {
    return makeRequestCreator(
        LIST_WORKSPACES,
        api.workspaces.list().get(),
        {
            args: {},
            requestId: requestId,
        }
    )
}
