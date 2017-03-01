import {
    EDITOR_CHANGE_ACTIVE_FILE,
    EDITOR_CLOSE_FILE,
    EDITOR_TOGGLE_DIRECTORY,
    LIST_FILES
} from '../actions/types'


const initialState = {
    activeFile: null,
    openedFiles: [],
    arborescence: {}
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
    case EDITOR_CHANGE_ACTIVE_FILE:
        // Open the file if it wasn't already.
        if (state.openedFiles.indexOf(action.payload.filePath) == -1) {
            nextOpenedFiles.push(action.payload.filePath)
        }

        return {...state, activeFile: action.payload.filePath, openedFiles: nextOpenedFiles}

    case EDITOR_CLOSE_FILE:
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

    case EDITOR_TOGGLE_DIRECTORY:
        return {
            ...state,
            arborescence: toggleDirectory(
                state.arborescence, action.payload.path, action.payload.collapsed)
        }

    case LIST_FILES:
        if ((action.meta.status == 'pending') || !action.payload.entities) {
            return state
        }

        // Rebuild the file arborescence.
        let arborescence = {}
        const files = Object.map(action.payload.entities['files'], (key, value) =>
            [key, {...value, __modified__: false}])

        for (let path in files) {
            // Walk the arborescence and create any missing subdirectories.
            let directory = arborescence
            const components = path.split('/').slice(0, -1)
            components.map((subdirectory, index) => {
                if (!(subdirectory in directory)) {
                    directory[subdirectory] = {
                        path: components.slice(0, index + 1).join('/') + '/',
                        collapsed: true,
                        files: {}
                    }
                }
                directory = directory[subdirectory].files
            })

            // Place the file in the arborescence.
            directory[path] = files[path].path
        }

        return {
            ...state,
            arborescence: arborescence
        }

    default:
        return state
    }
}

export default editor
