import React from 'react'
import SplitPane from 'react-split-pane'

import Editor from './Editor'
import FileTree from './FileTree'
import Shell from './Shell'


const consoleHeight = 300;


export default class EditorView extends React.Component {

    render() {
        // <viewport's height> - <viewport's padding> - <shell's height> - <tabs' height>
        const editorHeight = window.innerHeight - 20 - consoleHeight - 40

        return (
            <div className="sw-editor-view">
                <SplitPane split="horizontal" size={300} primary="second" allowResize={false}>
                    <SplitPane minSize={50} defaultSize={200} split="vertical">
                        <FileTree />
                        <Editor height={editorHeight} />
                    </SplitPane>
                    <Shell />
                </SplitPane>
            </div>
        )
    }

}
