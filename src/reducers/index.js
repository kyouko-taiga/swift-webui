import { combineReducers } from 'redux'

import arborescence from './arborescence'
import growls from './growls'
import repository from './repository'
import files from './files'
import editor from './editor'


export default combineReducers({
    arborescence,
    growls,
    repository,
    files,
    editor
})
