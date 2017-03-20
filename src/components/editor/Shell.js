import React from 'react'


export default class Shell extends React.Component {

    constructor(props) {
        super(props)

        this.term = null
        this.socket = null
    }

    componentDidMount() {
        // Connect to the shell server.
        this.socket = window.io(window.location.origin, {
            path: '/shell',
            extraHeaders: {
                'Streams-Token': this.props.workspace.streams_token,
            },
        })

        // Choose the storage implementation of hterm.
        window.hterm.defaultStorage = new window.lib.Storage.Local()

        // Create a new terminal.
        this.term = new window.hterm.Terminal()
        this.term.prefs_.set('background-color', 'none')

        // Set some preferences.
        this.term.prefs_.set('ctrl-c-copy', true)
        this.term.prefs_.set('ctrl-v-paste', true)
        this.term.prefs_.set('use-default-window-copy', true)

        this.term.onTerminalReady = () => {
            // Create a new terminal IO object and give it the foreground.
            let io = this.term.io.push()

            io.onVTKeystroke = (str) => {
                this.socket.emit('input', str)
            }

            io.sendString = (str) => {
                this.socket.emit('input', str)
            }

            io.onTerminalResize = (columns, rows) => {
                this.socket.emit('resize', { col: columns, row: rows })
            }

            this.socket.on('output', (data) => {
                this.term.io.writeUTF16(data)
            })
        }

        this.term.decorate(this.refs.terminal)
        this.term.setCursorPosition(0, 0)
        this.term.setCursorVisible(true)
        this.term.installKeyboard()
    }

    componentWillUnmount() {
        this.socket.disconnect()
    }

    render() {
        return <div ref="terminal" id="terminal" className="sw-shell" />
    }

}
