import React from 'react'
import WorkspaceForm from './WorkspaceForm'


export default class CreateWorkspaceView extends React.Component {

    render() {
        return (
            <div className="sw-jumbotron">
                <h1>Create a workspace</h1>
                <WorkspaceForm />
            </div>
        )
    }

}
