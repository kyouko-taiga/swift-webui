import React from 'react'
import { connect } from 'react-redux'

import { dismiss } from '../../actions/growls'
import Growls from './Growls'


class GrowlsContainer extends React.Component {
    componentWillReceiveProps(props) {
        // Set a timer on the new growls to dismiss them.
        if (props.growls.length > this.props.growls.length) {
            props.growls.slice(0, props.growls.length - this.props.growls.length).map((it) => {
                setTimeout(() => props.onDismissGrowl(it.uid), 3000)
            })
        }
    }

    render() {
        return <Growls {...this.props} />
    }
}


function stateToProps(state) {
    return {
        growls: state.growls
    }
}


function dispatchToProps(dispatch) {
    return {
        onDismissGrowl: (uid) => {
            dispatch(dismiss(uid))
        }
    }
}


export default connect(stateToProps, dispatchToProps)(GrowlsContainer)
