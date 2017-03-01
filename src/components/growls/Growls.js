import React, { PropTypes } from 'react'
import ReactCSSTransitionGroup from 'react-addons-css-transition-group'
import { connect } from 'react-redux'

import { dismiss } from '../../actions/growls'
import GrowlItem from './GrowlItem'


class Growls extends React.Component {
    render() {
        const items = this.props.growls.map((it) => {
            return (
                <GrowlItem
                    onDismiss={() => this.props.onDismissGrowl(it.uid)}
                    key={it.uid}
                    level={it.level}
                    icon={it.icon}
                >
                    {it.body}
                </GrowlItem>
            )
        })

        return (
            <div className="mkt-growls-container">
                <ReactCSSTransitionGroup
                    transitionName="on"
                    transitionEnterTimeout={500}
                    transitionLeaveTimeout={500}
                >
                    {items}
                </ReactCSSTransitionGroup>
            </div>
        )
    }
}

Growls.propTypes = {
    onDismissGrowl: PropTypes.func.isRequired,
    growls: PropTypes.arrayOf(PropTypes.shape({
        uid: PropTypes.any.isRequired,
        level: PropTypes.string,
        icon: PropTypes.string,
        body: PropTypes.node
    })).isRequired
}


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
