import { LIST_REPOSITORIES } from '../actions/types'


const initialState = {}


const repositories = (state = {}, action) => {
    switch (action.type) {
    case LIST_REPOSITORIES:
        if ((action.meta.status == 'pending') || !action.payload.entities) {
            return state
        }

        return {
            ...state,
            ...action.payload.entities.repositories,
        }

    default:
        return state
    }
}

export default repositories
