import { CHANGE_CURRENT_FILE } from '../actions/types'


const initialState = {
    currentFile: 'Sources/main.swift'
}


const editor = (state = initialState, action) => {
    switch (action.type) {
    case CHANGE_CURRENT_FILE:
        return {...state, currentFile: action.payload.filepath}

    default:
        return state
    }
}

export default editor
