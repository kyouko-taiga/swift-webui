import React from 'react'

import WorkspaceList from './workspaces/WorkspaceList'


export default class HomeView extends React.Component {

    render() {
        return (
            <div className="sw-home">
                <h1>ウミウシ</h1>
                <h2>Open or create a workspace</h2>
                <WorkspaceList />
            </div>
        )
    }

}
