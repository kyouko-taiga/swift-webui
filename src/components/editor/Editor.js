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
import { growlError } from '../../actions/growls'
import { list as listFiles, patch as patchFile } from '../../actions/files'
import EditorTabs from './EditorTabs'


class Editor extends React.Component {

    constructor() {
        super()

        this.saveCode = this.saveCode.bind(this)
        this.updateCode = this.updateCode.bind(this)
    }

    componentDidMount() {
        document.addEventListener('keydown', this.saveCode)
    }

    componentWillUnmount() {
        document.removeEventListener('keydown', this.saveCode)
    }

    saveCode(e) {
        if ((e.keyCode == 83) && (navigator.platform.match('Mac') ? e.metaKey : e.ctrlKey)) {
            e.preventDefault()
            this.props.dispatch(patchFile(this.props.activeFile))
                .then((action) => {
                    if (action.error) {
                        this.props.dispatch(growlError(
                            action.payload, `Failed to save '${this.props.activeFile.name}'.`))
                    }
                })
        }
    }

    updateCode(newCode) {
        this.props.dispatch(updateFileContent(this.props.activeFile.path, newCode))
    }

    render() {
        if (this.props.activeFile == null) {
            return <div>No file selected.</div>
        }

        const options = {
            ...this.props.options,
            mode: this.props.activeFile.mimetype
        }

        return (
            <div>
                <EditorTabs
                    dispatch={this.props.dispatch}
                    activeFile={this.props.activeFile}
                    openedFiles={this.props.openedFiles}
                />
                <CodeMirrorEditor
                    onChange={this.updateCode}
                    value={this.props.activeFile.content}
                    options={options}
                />
            </div>
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


class EditorContainer extends React.Component {

    constructor() {
        super()
        this.state = {
            isFetching: true,
            error: null
        }
    }

    componentDidMount() {
        this.setState({isFetching: true})

        this.props.dispatch(listFiles(this.props.repository.id))
            .then((action) => {
                this.setState({
                    isFetching: false,
                    error: action.error ? action.payload : null
                })
            })
    }

    render() {
        return <Editor {...this.props} {...this.state} />
    }


}


function stateToProps(state) {
    return {
        repository: state.repository,
        activeFile: (state.editor.activeFile != null)
            ? state.files[state.editor.activeFile]
            : null,
        openedFiles: state.editor.openedFiles.map((filePath) => state.files[filePath])
    }
}


export default connect(stateToProps)(EditorContainer)
