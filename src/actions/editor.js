import { CHANGE_CURRENT_FILE, UPDATE_FILE_CONTENT } from './types'


export function changeCurrentFile(filepath) {
    return {
        type: CHANGE_CURRENT_FILE,
        payload: {
            filepath: filepath
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
