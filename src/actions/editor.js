import {
    CHANGE_ACTIVE_FILE,
    CLOSE_FILE,
    TOGGLE_DIRECTORY,
    UPDATE_FILE_CONTENT
} from './types'


export function changeActiveFile(filepath) {
    return {
        type: CHANGE_ACTIVE_FILE,
        payload: {filepath: filepath}
    }
}


export function closeFile(filepath) {
    return {
        type: CLOSE_FILE,
        payload: {filepath: filepath}
    }
}


export function toggleDirectory(path, collapsed) {
    return {
        type: TOGGLE_DIRECTORY,
        payload: {
            path: path,
            collapsed: collapsed
        }
    }
}


export function updateFileContent(filepath, content) {
    return {
        type: UPDATE_FILE_CONTENT,
        payload: {
            filepath: filepath,
            content: content
        }
    }
}
