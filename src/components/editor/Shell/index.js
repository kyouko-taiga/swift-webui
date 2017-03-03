import React, { PropTypes } from 'react'
import { connect } from 'react-redux'

import Terminal from './Terminal'


class Shell extends Terminal {

    render() {
        // console.log(this.props.structure)
        return <Terminal prefix="" structure={this.props.structure} theme={'dark'} />
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
            result[key] = files[arborescence[key]]
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
