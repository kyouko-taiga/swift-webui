import {
    CHANGE_ACTIVE_FILE,
    CLOSE_FILE,
    TOGGLE_DIRECTORY,
    UPDATE_FILE_CONTENT
} from './types'


export function changeActiveFile(filePath) {
    return {
        type: CHANGE_ACTIVE_FILE,
        payload: {filePath: filePath}
    }
}


export function closeFile(filePath) {
    return {
        type: CLOSE_FILE,
        payload: {filePath: filePath}
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


export function updateFileContent(filePath, content) {
    return {
        type: UPDATE_FILE_CONTENT,
        payload: {
            filePath: filePath,
            content: content
        }
    }
}
