import { combineReducers } from 'redux'

import repository from './repository'
import files from './files'
import editor from './editor'


export default combineReducers({
    repository,
    files,
    editor
})
