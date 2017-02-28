import React, { PropTypes } from 'react'
import ReactCSSTransitionGroup from 'react-addons-css-transition-group'

import GrowlItem from './GrowlItem'


export default class Growls extends React.Component {
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
