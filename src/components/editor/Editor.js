import React, { PropTypes } from 'react'
import CodeMirror from 'react-codemirror'

require('codemirror/mode/swift/swift')


export default class Editor extends React.Component {
    constructor() {
        super()
        this.state = {
            code: '// Oh, swifty ...'
        }

        this.updateCode = this.updateCode.bind(this)
    }

    updateCode(newCode) {
        this.setState({code: newCode})
    }

    render() {
        return (
            <CodeMirror
                onChange={this.updateCode}
                value={this.state.code}
                options={this.props.options}
            />
        )
    }
}

Editor.propTypes = {
    mode: PropTypes.string,
    options: PropTypes.object
}

Editor.defaultProps = {
    options: {
        mode: 'swift',
        lineNumbers: true
    }
}
