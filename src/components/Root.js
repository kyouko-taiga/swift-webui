import React from 'react'
import { connect } from 'react-redux'

import Growls from './growls'


class Root extends React.Component {
    render() {
        return (
            <div className="container-fluid">
                <div className="row">
                    <div className="col-sm-12">
                        { this.props.children }
                    </div>
                </div>
                <Growls />
            </div>
        )
    }
}


export default connect()(Root)
