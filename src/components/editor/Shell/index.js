import React, { PropTypes } from 'react'
import { connect } from 'react-redux'

import { changeActiveFile } from '../../../actions/editor'
import Terminal from './Terminal'
import { Errors } from './Terminal/const'
import * as Util from './Terminal/util'
import commandsFactory from './commands'


class Shell extends Terminal {

    constructor(props) {
        super(props)

        const open = {
            exec: (state, { args }) => {
                const relativePath = args[0] || ''
                const fullPath = Util.extractPath(relativePath, state.cwd)
                const components = fullPath.split('/')
                const dirname = components.slice(0, -1).join('/')
                const filename = components.slice(-1)
                const { err, dir } = Util.getDirectoryByPath(state.structure, dirname)

                if (err) {
                    return Util.appendError(state, err, path)
                } else if (!dir[filename]) {
                    return Util.appendError(state, Errors.NO_SUCH_FILE, path)
                } else if (!dir[filename].hasOwnProperty('content')) {
                    return Util.appendError(state, Errors.IS_A_DIRECTORY, path)
                } else {
                    props.dispatch(changeActiveFile(fullPath))
                }

                return state
            }
        }

        this.extensions = { ...commandsFactory(props.dispatch), open }
    }

    render() {
        // console.log(this.props.structure)
        return (
            <Terminal
              prefix=""
              structure={this.props.structure}
              extensions={this.extensions}
              theme={'dark'}
            />
        )
    }

}

Shell.propTypes = {
    structure: PropTypes.object.isRequired,
}


// Transform the file arborescence so that it is compatible with the shell's
// filesystem representation.
function arborescenceToStructure(arborescence, files) {
    let result = {}
    for (const key in arborescence) {
        if (typeof arborescence[key] === 'string') {
            result[key.split('/').slice(-1)] = files[arborescence[key]]
        } else {
            result[key] = arborescenceToStructure(arborescence[key].files, files)
        }
    }
    return result
}


function stateToProps(state) {
    return {
        structure: arborescenceToStructure(state.arborescence, state.files),
    }
}

export default connect(stateToProps)(Shell)
