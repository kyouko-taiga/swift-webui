import { UPDATE_FILE_CONTENT } from '../actions/types'


const initialState = {
    'README.md': {
        mimetype: 'text/x-markdown',
        path: 'README.md',
        name: 'README.md',
        content: 'This is a README file.',
        __modified__: false
    },
    'LICENSE': {
        mimetype: 'text/plain',
        name: 'LICENSE',
        path: 'LICENSE',
        content: 'MIT LICENSE',
        __modified__: false
    },
    'Sources/main.swift': {
        mimetype: 'text/x-swift',
        name: 'main.swift',
        path: 'Sources/main.swift',
        content: 'print("So swifty!")',
        __modified__: false
    }
}


const files = (state = initialState, action) => {
    switch (action.type) {
    case UPDATE_FILE_CONTENT:
        const file = state[action.payload.filepath]

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
