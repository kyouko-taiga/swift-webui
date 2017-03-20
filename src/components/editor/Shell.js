import React from 'react'


export default class Shell extends React.Component {

    constructor() {
        super()
        this.term = null
    }

    componentDidMount() {
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
                this.term.io.print(str)
            }

            // io.sendString = (str) => {
            //     // same as 'onVTKeystroke'
            // }

            this.term.setCursorPosition(0, 0)
            this.term.setCursorVisible(true)
        }

        this.term.decorate(this.refs.terminal)
        this.term.installKeyboard()
    }

    render() {
        // console.log(this.props.structure)
        return (
            <div ref="terminal" id="terminal" className="sw-shell" />
        )
    }

}
