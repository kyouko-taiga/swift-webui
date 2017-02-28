import {
    CHANGE_ACTIVE_FILE,
    CLOSE_FILE,
    TOGGLE_DIRECTORY
} from '../actions/types'


const initialState = {
    activeFile: 'README.md',
    openedFiles: ['README.md', 'Sources/main.swift'],
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
    // We can't define the same variables within different switch cases.
    let nextOpenedFiles = state.openedFiles.slice()

    switch (action.type) {
    case CHANGE_ACTIVE_FILE:
        // Open the file if it wasn't already.
        if (state.openedFiles.indexOf(action.payload.filePath) == -1) {
            nextOpenedFiles.push(action.payload.filePath)
        }

        return {...state, activeFile: action.payload.filePath, openedFiles: nextOpenedFiles}

    case CLOSE_FILE:
        const fileIndex = state.openedFiles.indexOf(action.payload.filePath)
        if (fileIndex == -1) {
            return state
        }

        nextOpenedFiles =
            state.openedFiles.slice(0, fileIndex).concat(state.openedFiles.slice(fileIndex + 1))
        let nextActiveFile = state.activeFile

        // If the file to be closed is the active file, select the next
        // opened file to replace it.
        if (state.activeFile == action.payload.filePath) {
            if (nextOpenedFiles.length > 0) {
                nextActiveFile = nextOpenedFiles[Math.max(fileIndex - 1, 0)]
            } else {
                nextActiveFile = null
            }
        }

        return {...state, activeFile: nextActiveFile, openedFiles: nextOpenedFiles}

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
