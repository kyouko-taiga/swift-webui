import { LIST_WORKSPACES, GET_WORKSPACE } from '../actions/types'


const workspaces = (state = {}, action) => {
    switch (action.type) {
    case LIST_WORKSPACES:
    case GET_WORKSPACE:
        if ((action.meta.status == 'pending') || !action.payload.entities) {
            return state
        }

        return {
            ...state,
            ...action.payload.entities.workspaces,
        }

    default:
        return state
    }
}

export default workspaces
