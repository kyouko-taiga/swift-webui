import React from 'react'
import { Link } from 'react-router'

import WorkspaceList from './workspaces/WorkspaceList'


export default class HomeView extends React.Component {

    render() {
        return (
            <div className="sw-jumbotron">
                <h1>ウミウシ</h1>
                <h2>Open or create a workspace</h2>
                <WorkspaceList />
                <div className="text-center">
                    <Link to="/create-workspace" className="btn btn-lg btn-success">
                        Create a new workspace
                    </Link>
                </div>
            </div>
        )
    }

}
