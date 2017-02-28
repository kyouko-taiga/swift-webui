import {
    LIST_FILES,
    GET_FILE,
    PATCH_FILE,
    EDITOR_UPDATE_FILE_CONTENT
} from '../actions/types'


const initialState = {
    'README.md': {
        mimetype: 'text/x-markdown',
        path: 'README.md',
        name: 'README.md',
        content: 'This is a README file.',
        repository: '12345',
        __modified__: false
    },
    'LICENSE': {
        mimetype: 'text/plain',
        name: 'LICENSE',
        path: 'LICENSE',
        content: 'MIT LICENSE',
        repository: '12345',
        __modified__: false
    },
    'Sources/main.swift': {
        mimetype: 'text/x-swift',
        name: 'main.swift',
        path: 'Sources/main.swift',
        content: 'print("So swifty!")',
        repository: '12345',
        __modified__: false
    }
}


const files = (state = initialState, action) => {
    switch (action.type) {
    case PATCH_FILE:
        // TODO: Handle optimistic update.

    case LIST_FILES:
    case GET_FILE:
        if ((action.meta.status == 'pending') || !action.payload.entities) {
            return state
        }

        return Object.map(action.payload.entities[entitiesName], (key, value) =>
            [key, {...value, __modified__: false}])

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
