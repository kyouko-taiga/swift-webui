import {
    EDITOR_CHANGE_ACTIVE_FILE,
    EDITOR_CLOSE_FILE,
    EDITOR_TOGGLE_DIRECTORY,
    EDITOR_UPDATE_FILE_CONTENT
} from './types'


export function changeActiveFile(filePath) {
    return {
        type: EDITOR_CHANGE_ACTIVE_FILE,
        payload: {filePath: filePath}
    }
}


export function closeFile(filePath) {
    return {
        type: EDITOR_CLOSE_FILE,
        payload: {filePath: filePath}
    }
}


export function toggleDirectory(path, collapsed) {
    return {
        type: EDITOR_TOGGLE_DIRECTORY,
        payload: {
            path: path,
            collapsed: collapsed
        }
    }
}


export function updateFileContent(filePath, content) {
    return {
        type: EDITOR_UPDATE_FILE_CONTENT,
        payload: {
            filePath: filePath,
            content: content
        }
    }
}
