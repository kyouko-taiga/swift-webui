import classNames from 'classnames'
import React from 'react'
import { connect } from 'react-redux'

import { changeCurrentFile } from '../../actions/editor'


class FileTree extends React.Component {

    constructor() {
        super()
    }

    render() {
        const nodes = makeNodes(
            createArborescence(this.props.files),
            this.props.editor.currentFile,
            this.props.dispatch)

        return (
            <div>
                <div className="panel panel-info">
                    <div className="panel-heading">
                        <i className="fa fa-fw fa-code-fork" />
                        { this.props.repository.name }/{ this.props.repository.currentBranch }
                    </div>
                    <ul className="sw-filetree">
                        { nodes }
                    </ul>
                </div>
            </div>
        )
    }

}


function createArborescence(files) {
    let arborescence = {}

    for (let path in files) {
        // Walk the arborescence and create any missing subdirectories.
        let directory = arborescence
        for (let subdirectory of path.split('/').slice(0, -1)) {
            if (!(subdirectory in directory)) {
                directory[subdirectory] = {}
            }
            directory = directory[subdirectory]
        }

        // Place the file in the arborescence.
        directory[path] = files[path]
    }

    return arborescence
}


function makeNodes(arborescence, currentFile, dispatch, depth=0) {
    let nodes = []
    const indentation = Array(depth).fill().map(
        (_, i) => <span key={i} className="sw-filetree-indent"></span>)

    for (let node of Object.keys(arborescence).sort()) {
        if ('mimetype' in arborescence[node]) {
            const file = arborescence[node]
            function handleClick(e) {
                e.preventDefault()
                dispatch(changeCurrentFile(file.path))
            }

            const classnames = classNames({'active': currentFile == file.path})
            const tag = file.__modified__
                ? <span className="sw-tag sw-tag-modified"></span>
                : null

            nodes.push(
                <li key={`${node}${depth}`} onClick={handleClick} className={classnames}>
                    { indentation }
                    <i className="fa fa-fw fa-file-text-o" /> { file.name }
                    <div className="pull-right">{ tag }</div>
                </li>
            )
        } else {
            nodes.push(
                <li key={`${node}${depth}`}>
                    { indentation }
                    <i className="fa fa-fw fa-folder-open-o" /> { node }
                </li>
            )

            nodes = nodes.concat(makeNodes(arborescence[node], currentFile, dispatch, depth + 1))
        }
    }

    return nodes
}


function stateToProps(state) {
    return {
        repository: state.repository,
        files: state.files,
        editor: state.editor
    }
}


export default connect(stateToProps)(FileTree)
