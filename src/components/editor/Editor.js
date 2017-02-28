import React, { PropTypes } from 'react'
import CodeMirror from 'react-codemirror'

import 'codemirror/mode/swift/swift'


export default class Editor extends React.Component {
    constructor() {
        super()
        this.state = {
            code: 'print("So swifty!")'
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
    theme: PropTypes.string,
    options: PropTypes.object
}

Editor.defaultProps = {
    options: {
        mode: 'swift',
        theme: 'monokai',
        lineNumbers: true
    }
}
