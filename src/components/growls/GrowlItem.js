import classNames from 'classnames'
import React, { PropTypes } from 'react'


export default class GrowlItem extends React.Component {
    render() {
        const growlClass = classNames({
            'mkt-growl': true,
            'info': this.props.level == 'info',
            'success': this.props.level == 'success',
            'primary': this.props.level == 'primary',
            'warning': this.props.level == 'warning',
            'danger': (this.props.level == 'danger') || (this.props.level == 'error')
        })

        return (
            <div className={growlClass}>
                <div className="clearfix">
                    <button onClick={this.props.onDismiss} className="close">
                        <i className="fa fa-fw fa-times" />
                    </button>
                    <div className="mkt-growl-icon">
                        <i className={'fa fa-fw fa-' + this.props.icon} />
                    </div>
                    <div className="mkt-growl-body">
                        {this.props.children}
                    </div>
                </div>
            </div>
        )
    }
}


GrowlItem.propTypes = {
    onDismiss: PropTypes.func,
    level: PropTypes.oneOf([
        'info', 'success', 'primary', 'warning', 'danger', 'error'
    ]),
    icon: PropTypes.string.isRequired
}
