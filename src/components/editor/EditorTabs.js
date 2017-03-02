import React from 'react'

import * as editorActions from '../../actions/editor'


export default class EditorTabs extends React.Component {

    render() {
        const openedFiles = this.props.openedFiles.map((file) => {
            const style = {width: `${100 / this.props.openedFiles.length}%`}
            const classname = (file == this.props.activeFile) ? 'active' : ''
            const tag = file.__modified__
                ? <span><span className="sw-tag sw-tag-modified" /></span>
                : null

            const dispatch = this.props.dispatch
            function handleClick(e) {
                e.preventDefault()
                dispatch(editorActions.changeActiveFile(file.path))
            }

            function handleClose(e) {
                e.preventDefault()
                e.stopPropagation()
                dispatch(editorActions.closeFile(file.path))
            }

            return (
                <li key={file.path} onClick={handleClick} className={classname} style={style}>
                    <span>
                        { file.name }
                        <span className="sw-close-span">
                            { tag }
                            <a onClick={handleClose} className="sw-close-button" href="#">
                                <i className="fa fa-times" />
                            </a>
                        </span>
                    </span>
                </li>
            )
        })

        return (
            <ul className="sw-editor-tabs">
                { openedFiles }
            </ul>
        )
    }

}
