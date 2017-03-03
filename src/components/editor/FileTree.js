import classNames from 'classnames'
import React from 'react'
import { connect } from 'react-redux'

import * as editorActions from '../../actions/editor'


class FileTree extends React.Component {

    constructor() {
        super()
    }

    makeNodes(arborescence, depth=0) {
        let nodes = []
        const indentation = Array(depth).fill().map(
            (_, i) => <span key={i} className="sw-filetree-indent"></span>)

        for (let node of Object.keys(arborescence).sort()) {
            if ('mimetype' in arborescence[node]) {
                const file = arborescence[node]
                const classnames = classNames({
                    'active': this.props.editor.activeFile == file.path
                })
                const tag = file.__modified__
                    ? <span className="sw-tag sw-tag-modified" />
                    : null

                const handleClick = (e) => {
                    e.preventDefault()
                    this.props.dispatch(editorActions.changeActiveFile(file.path))
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
                const opened = this.props.openedDirectories[directory.path] || false
                const iconClass = 'fa fa-fw fa-folder' + (opened ? '-open' : '') + '-o'

                const handleClick = (e) => {
                    e.preventDefault()
                    this.props.dispatch(editorActions.toggleDirectory(directory.path, opened))
                }

                nodes.push(
                    <li key={`${node}${depth}`} onClick={handleClick}>
                        {indentation}
                        <i className={iconClass} /> {node}
                    </li>
                )

                if (opened) {
                    nodes = nodes.concat(this.makeNodes(arborescence[node].files, depth + 1))
                }
            }
        }

        return nodes
    }

    render() {
        return (
            <div className="sw-filetree">
                <div className="sw-filetree-heading">
                    <i className="fa fa-fw fa-code-fork" />
                    { this.props.repository.name }/{ this.props.repository.activeBranch }
                </div>
                <ul>
                    {this.makeNodes(this.props.files)}
                </ul>
            </div>
        )
    }

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
        files: dereferencedArborescence(state.arborescence, state),
        openedDirectories: state.editor.openedDirectories,
        editor: state.editor
    }
}


export default connect(stateToProps)(FileTree)
