import React, { PropTypes } from 'react'
import CodeMirrorEditor from 'react-codemirror'
import { connect } from 'react-redux'

// Note that addding modes to codemirror this way will populate the instance
// of the codemirror from the codemirror dependency. For react-codemirror to
// use the same instance, it should be installed at the same time, otherwise
// codemirror will be installed as an inner dependency, and the mode scripts
// won't be linked to the same intance.
// Another solution is to explicitly link the react-codemirror component to
// the correct codemirror instance using the `codeMirrorInstance` property.

import 'codemirror/mode/swift/swift'
import 'codemirror/mode/markdown/markdown'

import { updateFileContent } from '../../actions/editor'


class Editor extends React.Component {
    constructor() {
        super()

        this.updateCode = this.updateCode.bind(this)
    }

    updateCode(newCode) {
        this.props.dispatch(updateFileContent(this.props.file.path, newCode))
    }

    render() {
        const options = {
            ...this.props.options,
            mode: this.props.file.mimetype
        }

        return (
            <CodeMirrorEditor
                onChange={this.updateCode}
                value={this.props.file.content}
                options={options}
            />
        )
    }
}

Editor.propTypes = {
    mode: PropTypes.string,
    theme: PropTypes.string,
    options: PropTypes.object
}

Editor.defaultProps = {
    options: {
        mode: null,
        theme: 'monokai',
        lineNumbers: true
    }
}


function stateToProps(state) {
    return {
        file: state.files[state.editor.currentFile]
    }
}


export default connect(stateToProps)(Editor)
