import React from 'react'

import RepositoryList from './repositories/RepositoryList'


export default class HomeView extends React.Component {

    render() {
        return (
            <div className="sw-home">
                <h1>Welcome to Cloudenvr</h1>
                <h2>Open a repository</h2>
                <RepositoryList />
            </div>
        )
    }

}
