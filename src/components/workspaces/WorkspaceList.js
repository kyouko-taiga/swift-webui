import React from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'

import { list as listWorkspaces } from '../../actions/workspaces'


class WorkspaceList extends React.Component {

    render() {
        if (this.props.isFetching) {
            return <p>"Just a moment, we're listing your workspaces."</p>
        }

        const workspaces = this.props.workspaces.map((workspace) => {
            return (
            <li key={workspace.id}>
                <Link to={`/${workspace.name}/editor`}>{workspace.name}</Link>
            </li>
            )
        })

        return (
            <div className="sw-workspace-list">
                <ul>{workspaces}</ul>
            </div>
        )
    }

}


class WorkspaceListContainer extends React.Component {

    constructor() {
        super()
        this.state = {
            isFetching: true,
            error: null
        }
    }

    componentDidMount() {
        this.setState({isFetching: true})

        this.props.dispatch(listWorkspaces())
            .then((action) => {
                this.setState({
                    isFetching: false,
                    error: action.error ? action.payload : null
                })
            })
    }

    render() {
        return (
            <WorkspaceList
              {...this.props}
              {...this.state}
            />
        )
    }

}


function stateToProps(state) {
    return {
        workspaces: Object.keys(state.workspaces)
            .sort((lhs, rhs) => {
                const left = state.workspaces[lhs].name.toUpperCase()
                const right = state.workspaces[rhs].name.toUpperCase()
                return left < right ? -1 : 0
            })
            .map((id) => state.workspaces[id])
    }
}


export default connect(stateToProps)(WorkspaceListContainer)
