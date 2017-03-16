import classnames from 'classnames'
import React from 'react'
import { connect } from 'react-redux'
import { Link, browserHistory } from 'react-router'
import { growlError } from '../../actions/growls'
import { list as listWorkspaces, create as createWorkspace } from '../../actions/workspaces'


class WorkspaceForm extends React.Component {

    constructor() {
        super()
        this.state = {
            name: '',
            language: 'swift',
            isNameValid: undefined,
            isFetchingWorkspaces: false,
        }

        this.handleNameChange = this.handleNameChange.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this)
    }

    componentDidMount() {
        this.setState({ isFetchingWorkspaces: true}, () => {
            this.props.dispatch(listWorkspaces())
                .then(() => { this.setState({ isFetchingWorkspaces: false }) })
        })
    }

    handleNameChange(e) {
        this.setState({ name: e.target.value })
        this.validateName(e.target.value)
    }

    handleSubmit(e) {
        e.preventDefault()
        this.props.dispatch(createWorkspace({
            name: this.state.name,
            language: this.state.language
        }))
            .then((action) => {
                if (!action.error) {
                    browserHistory.push('/')
                } else {
                    this.props.dispatch(growlError(action.payload))
                }
            })
    }

    validateName(name) {
        // If we're still fetching the workspaces, we can't determine if the
        // given name is valid or not.
        if (this.state.isFetchingWorkspaces) {
            this.setState({ isNameValid: undefined })
            return
        }

        // Don't display a validation state if the name is empty.
        if (name == '') {
            this.setState({ isNameValid: undefined })
            return
        }

        // If we've already fetched a workspace with the same name locally, we
        // know for sure that the name is invalid.
        this.setState({ isNameValid: this.props.workspaceNames.indexOf(name) < 0 })
    }

    render() {
        // Compute the validation state of the name input.
        let nameGroupClass = classnames('form-group', {
            'has-success': this.state.isNameValid,
            'has-error': this.state.isNameValid === false,
        })

        return (
            <form onSubmit={this.handleSubmit}>
                <div className={nameGroupClass}>
                    <label htmlFor="workspaceName">Name of the workspace</label>
                    <input
                      type="text"
                      className="form-control"
                      id="workspaceName"
                      placeholder="Name"
                      value={this.state.name}
                      onChange={this.handleNameChange}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="workspaceLanguage">Environment</label>
                    <select className="form-control">
                        <option value="swift">Swift</option>
                    </select>
                </div>
                <div className="form-group text-right">
                    <Link to="/" className="btn btn-danger">Cancel</Link>
                    {' '}
                    <button
                      type="submit"
                      className="btn btn-success"
                      disabled={!this.state.isNameValid}
                    >
                        Create
                    </button>
                </div>
            </form>
        )
    }

}

function stateToProps(state) {
    return {
        workspaceNames: Object.keys(state.workspaces).map((id) => state.workspaces[id].name)
    }
}

export default connect(stateToProps)(WorkspaceForm)
