import api from '../api'
import { LIST_REPOSITORIES } from './types'
import { makeRequestCreator } from './factories'


export function list({ requestId } = {}) {
    return makeRequestCreator(
        LIST_REPOSITORIES,
        api.repositories.list().get(),
        {
            args: {},
            requestId: requestId,
        }
    )
}
