import React from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'

import { list as listFiles } from '../../actions/files'
import { list as listRespositories } from '../../actions/repositories'


class RepositoryList extends React.Component {

    render() {
        if (this.props.isFetching) {
            return <p>"Just a moment, we're listing your repositories."</p>
        }

        const repositories = this.props.repositories.map((repository) => {
            const handleClick = (e) => {
                e.preventDefault()
                this.props.onSelectRepository(repository.id)
            }

            return (
                <li key={repository.id}>
                    <Link to={`/editor/${repository.id}`}>{repository.name}</Link>
                </li>
            )
        })

        return (
            <div className="sw-repository-list">
                <ul>{repositories}</ul>
            </div>
        )
    }

}


class RepositoryListContainer extends React.Component {

    constructor() {
        super()
        this.state = {
            isFetching: true,
            error: null
        }
    }

    componentDidMount() {
        this.setState({isFetching: true})

        this.props.dispatch(listRespositories())
            .then((action) => {
                this.setState({
                    isFetching: false,
                    error: action.error ? action.payload : null
                })
            })
    }

    render() {
        return (
            <RepositoryList
              {...this.props}
              {...this.state}
            />
        )
    }

}


function stateToProps(state) {
    return {
        repositories: Object.keys(state.repositories)
            .sort((lhs, rhs) => {
                const left = state.repositories[lhs].name.toUpperCase()
                const right = state.repositories[rhs].name.toUpperCase()
                return left < right ? -1 : 0
            })
            .map((id) => state.repositories[id])
    }
}


export default connect(stateToProps)(RepositoryListContainer)
