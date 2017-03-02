import classNames from 'classnames'
import React from 'react'
import { connect } from 'react-redux'

import * as editorActions from '../../actions/editor'


class FileTree extends React.Component {

    constructor() {
        super()
    }

    render() {
        const nodes = makeNodes(
            this.props.files,
            this.props.editor.activeFile,
            this.props.dispatch)

        return (
            <div className="sw-filetree">
                <div className="sw-filetree-heading">
                    <i className="fa fa-fw fa-code-fork" />
                    { this.props.repository.name }/{ this.props.repository.activeBranch }
                </div>
                <ul>
                    { nodes }
                </ul>
            </div>
        )
    }

}


function makeNodes(arborescence, activeFile, dispatch, depth=0) {
    let nodes = []
    const indentation = Array(depth).fill().map(
        (_, i) => <span key={i} className="sw-filetree-indent"></span>)

    for (let node of Object.keys(arborescence).sort()) {
        if ('mimetype' in arborescence[node]) {
            const file = arborescence[node]
            const classnames = classNames({'active': activeFile == file.path})
            const tag = file.__modified__
                ? <span className="sw-tag sw-tag-modified" />
                : null

            function handleClick(e) {
                e.preventDefault()
                dispatch(editorActions.changeActiveFile(file.path))
            }

            nodes.push(
                <li key={`${node}${depth}`} onClick={handleClick} className={classnames}>
                    { indentation }
                    <i className="fa fa-fw fa-file-text-o" /> { file.name }
                    <div className="pull-right">{ tag }</div>
                </li>
            )
        } else {
            const directory = arborescence[node]
            const collapsed = directory.collapsed
            const iconClass = 'fa fa-fw fa-folder' + (!collapsed ? '-open' : '') + '-o'

            function handleClick(e) {
                e.preventDefault()
                dispatch(editorActions.toggleDirectory(directory.path, !directory.collapsed))
            }

            nodes.push(
                <li key={`${node}${depth}`} onClick={handleClick}>
                    { indentation }
                    <i className={iconClass} /> { node }
                </li>
            )

            if (!collapsed) {
                nodes = nodes.concat(makeNodes(
                    arborescence[node].files, activeFile, dispatch, depth + 1))
            }
        }
    }

    return nodes
}


// The arborescence object in the editor's store only keeps references
// (file paths) to the actual files. This function dereferences those
// references to actual file entity they point to.
function dereferencedArborescence(arborescence, state) {
    return {...Object.map(arborescence, (key, value) => {
        return (typeof value == 'string')
            ? [key, state.files[value]]
            : [key, {...value, files: dereferencedArborescence(value.files, state)}]
    })}
}


function stateToProps(state) {
    return {
        repository: state.repository,
        files: dereferencedArborescence(state.editor.arborescence, state),
        editor: state.editor
    }
}


export default connect(stateToProps)(FileTree)
