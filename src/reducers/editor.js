import {
    CHANGE_ACTIVE_FILE,
    TOGGLE_DIRECTORY
} from '../actions/types'


const initialState = {
    activeFile: null,
    arborescence: {
        'LICENSE': 'LICENSE',
        'README.md': 'README.md',
        'Sources': {
            path: 'Sources/',
            collapsed: false,
            files: {
                'main.swift': 'Sources/main.swift'
            }
        }
    }
}


function createArborescence(files) {
    let arborescence = {}

    for (let path in files) {
        // Walk the arborescence and create any missing subdirectories.
        let directory = arborescence
        for (let subdirectory of path.split('/').slice(0, -1)) {
            if (!(subdirectory in directory)) {
                directory[subdirectory] = {}
            }
            directory = directory[subdirectory]
        }

        // Place the file in the arborescence.
        directory[path] = files[path]
    }

    return arborescence
}


function toggleDirectory(arborescence, path, collapsed) {
    let done = false
    return Object.map(arborescence, (key, value) => {
        if (done || (typeof value == 'string')) {
            return [key, value]
        } else if (value.path == path) {
            return [key, {...value, collapsed: collapsed}]
            done = true
        }

        return [key, toggleDirectory(value.files, path, collapsed)]
    })
}


const editor = (state = initialState, action) => {
    switch (action.type) {
    case CHANGE_ACTIVE_FILE:
        return {...state, activeFile: action.payload.filepath}

    case TOGGLE_DIRECTORY:
        return {
            ...state,
            arborescence: toggleDirectory(
                state.arborescence, action.payload.path, action.payload.collapsed)
        }

    default:
        return state
    }
}

export default editor
