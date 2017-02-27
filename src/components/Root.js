import React from 'react'
import { connect } from 'react-redux'


class Root extends React.Component {
    render() {
        return (
            <div className="container-fluid">
                <div className="row">
                    <div className="col-sm-12">
                        {this.props.children}
                    </div>
                </div>
            </div>
        )
    }
}


export default connect()(Root)
