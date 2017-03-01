import {
    LIST_FILES,
    GET_FILE,
    PATCH_FILE,
    EDITOR_UPDATE_FILE_CONTENT
} from '../actions/types'


const files = (state = {}, action) => {
    switch (action.type) {
    case PATCH_FILE: // TODO: Handle optimistic update.
    case GET_FILE:
    case LIST_FILES:
        if ((action.meta.status == 'pending') || !action.payload.entities) {
            return state
        }

        return {
            ...state,
            ...Object.map(action.payload.entities['files'], (key, value) =>
            [key, {...value, __modified__: false}])
        }

    case EDITOR_UPDATE_FILE_CONTENT:
        const file = state[action.payload.filePath]

        return {
            ...state,
            [file.path]: {
                ...file,
                content: action.payload.content,
                __modified__: true
            }
        }

    default:
        return state
    }
}

export default files
