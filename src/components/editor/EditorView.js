import React from 'react'

import Editor from './Editor'
import FileTree from './FileTree'
import Shell from './Shell'


export default class EditorView extends React.Component {

    render() {
        return (
            <div className="row">
                <div className="col-sm-3">
                    <FileTree />
                </div>
                <div className="col-sm-9">
                    <Editor />
                </div>
                <div className="col-sm-12">
                    <Shell />
                </div>
            </div>
        )
    }

}
