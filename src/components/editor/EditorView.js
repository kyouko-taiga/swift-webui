import React from 'react'
import { connect } from 'react-redux'
import SplitPane from 'react-split-pane'

import { get as getWorkspace } from '../../actions/workspaces'

import Editor from './Editor'
import FileTree from './FileTree'
import Shell from './Shell'


const consoleHeight = 300


class EditorView extends React.Component {

    render() {
        // <viewport's height> - <viewport's padding> - <shell's height> - <tabs' height>
        const editorHeight = window.innerHeight - 20 - consoleHeight - 40

        return (
            <div className="sw-editor-view">
                <SplitPane split="horizontal" size={300} primary="second" allowResize={false}>
                    <SplitPane minSize={50} defaultSize={200} split="vertical">
                        <FileTree workspace={this.props.workspace} />
                        <Editor workspace={this.props.workspace} height={editorHeight} />
                    </SplitPane>
                    <Shell />
                </SplitPane>
            </div>
        )
    }

}


class EditorViewContainer extends React.Component {

    constructor() {
        super()
        this.state = { isFetching: true, error: null, }
    }

    componentDidMount() {
        this.setState({ isFetching: true }, () => {
            this.props.dispatch(getWorkspace(this.props.params.workspaceName))
                .then((action) => {
                    this.setState({
                        isFetching: false,
                        error: action.error ? action.payload : null
                    })
                })
        })
    }

    render() {
        if (this.props.workspace) {
            return <EditorView {...this.props} />
        } else if (this.state.isFetching) {
            return <p>Loading data ...</p>
        } else if (this.state.error) {
            return <p>Failed to load the list of workspaces.</p>
        } else {
            return <p>workspace not found.</p>
        }
    }

}


function stateToProps(state, props) {
    // Find the workspace with the given name.
    const wid = Object.keys(state.workspaces).filter((id) =>
        state.workspaces[id].name == props.params.workspaceName
    )[0]

    return {
        workspace: (typeof wid !== 'undefined') ? state.workspaces[wid] : undefined
    }
}

export default connect(stateToProps)(EditorViewContainer)
