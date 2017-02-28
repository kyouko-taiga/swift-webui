import classNames from 'classnames'
import React from 'react'
import { connect } from 'react-redux'


class FileTree extends React.Component {
    render() {
        let subdirectories = this.props.subdirectories.map((name) =>
            <button key={name} className="list-group-item">
                <i className="fa fa-fw fa-folder-o" /> { name }
            </button>
        )

        let files = this.props.files.map((file) => {
            const classname = classNames({
                'list-group-item': true,
                'list-group-item-warning':
                    this.props.currentFile && (file.sha == this.props.currentFile.sha)
            })

            return (
                <button key={file.sha} className={classname}>
                    <i className="fa fa-fw fa-file-text-o" /> { file.name }
                </button>
            )
        })

        return (
            <div>
                <div className="panel panel-info">
                    <div className="panel-heading">
                        <i className="fa fa-fw fa-code-fork" />
                        <span className="text-muted">Branch: </span>
                        <b>{ this.props.currentBranch.name }</b>
                        <div className="pull-right">
                            <i className="fa fa-fw fa-chevron-down" />
                        </div>
                    </div>
                    <div className="list-group">
                        { subdirectories }{ files }
                    </div>
                </div>
            </div>
        )
    }
}


function stateToProps(state) {
    // Get the current branch.
    const currentBranch = state.branches[state.fileTree.branch]

    // Filter the branch files so we keep only that of the current directory.
    const directory = state.fileTree.directory
    let re = RegExp('^' + directory.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'))
    re.compile()

    let files = []
    let subdirectories = []
    for (let sha of currentBranch.files) {
        // Remove the prefix of the current directory from the filepath. Then,
        // if there's still a '/' in the remainder, we can assume the file is
        // nested in some subdirectory.
        const file = state.files[sha]
        const stem = file.path.replace(re, '')
        const slashIndex = stem.indexOf('/')
        if (slashIndex == -1) {
            files.push(file)
        } else {
            // If the file is nested, we keep a reference to its closest
            // ancestor, w.r.t. the current directory.
            subdirectories.push(stem.substring(0, slashIndex))
        }
    }

    return {
        currentBranch: currentBranch,
        currentFile: state.files[state.fileTree.file],
        files: files,
        subdirectories: subdirectories
    }
}


export default connect(stateToProps)(FileTree)
