import { combineReducers } from 'redux'

import growls from './growls'
import repository from './repository'
import files from './files'
import editor from './editor'


export default combineReducers({
    growls,
    repository,
    files,
    editor
})
