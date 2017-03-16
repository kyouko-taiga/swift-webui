import { combineReducers } from 'redux'

import arborescence from './arborescence'
import editor from './editor'
import files from './files'
import growls from './growls'
import workspaces from './workspaces'


export default combineReducers({
    arborescence,
    editor,
    files,
    growls,
    workspaces,
})
