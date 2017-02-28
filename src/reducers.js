
const initialState = {
    repositories: {
        '12345':  {
            id: '12345',
            name: 'swift-webui',
            branches: ['kyouko-taiga/foo/master', 'kyouko-taiga/foo/dev']
        }
    },
    branches: {
        'kyouko-taiga/foo/master': {
            id: 'kyouko-taiga/foo/master',
            repository: '12345',
            name: 'master',
            files: ['012c1', 'ebb48', 'a672d']
        },
        'kyouko-taiga/foo/dev': {
            id: 'kyouko-taiga/foo/dev',
            repository: '12345',
            name: 'dev',
            files: ['012c1', 'ebb48']
        }
    },
    files: {
        '012c1': {
            sha: '012c1',
            type: 'file',
            name: 'README.md',
            path: 'README.md',
            content: 'This is a README file.'
        },
        'ebb48': {
            sha: 'ebb48',
            type: 'file',
            name: 'main.swift',
            path: 'Sources/main.swift',
            content: 'print("So swifty!")'
        },
        'a672d': {
            sha: 'a672d',
            type: 'file',
            name: 'LICENSE',
            path: 'LICENSE',
            content: 'MIT'
        }
    },
    fileTree: {
        repository: '12345',
        branch: 'kyouko-taiga/foo/master',
        file: '012c1',
        directory: '/'
    }
}


const appState = (state = initialState, action) => {
    switch (action.type) {
    default:
        return state
    }
}


export default appState
