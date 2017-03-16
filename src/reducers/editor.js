import {
    EDITOR_CHANGE_ACTIVE_FILE,
    EDITOR_CLOSE_FILE,
    EDITOR_TOGGLE_DIRECTORY,
} from '../actions/types'


const initialState = {
    activeFile: null,
    openedFiles: [],
    openedDirectories: {},
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
            openedDirectories: {
                ...state.openedDirectories,
                [action.payload.path]: !action.payload.collapsed,
            },
        }

    default:
        return state
    }
}

export default editor
