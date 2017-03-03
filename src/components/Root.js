import React from 'react'
import { connect } from 'react-redux'

import Growls from './growls/Growls'


class Root extends React.Component {
    render() {
        return (
            <div className="sw-root">
                { this.props.children }
                <Growls />
            </div>
        )
    }
}


export default connect()(Root)
