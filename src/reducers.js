import { combineReducers } from 'redux'


const initialState = {
    repository: {
        id: '12345',
        name: 'swift-webui',
        currentBranch: 'master'
    },
    files: {
        'README.md': {
            mimetype: 'text/markdown',
            path: 'README.md',
            name: 'README.md',
            content: 'This is a README file.'
        },
        'LICENSE': {
            mimetype: 'text/plain',
            name: 'LICENSE',
            path: 'LICENSE',
            content: 'MIT LICENSE'
        },
        'Sources/main.swift': {
            mimetype: 'text/x-swift',
            name: 'main.swift',
            path: 'Sources/main.swift',
            content: 'print("So swifty!")'
        }
    },
    editor: {
        currentFile: 'Sources/main.swift'
    }
}


const appState = (state = initialState, action) => {
    switch (action.type) {
    default:
        return state
    }
}


export default appState
