import * as Util from './util';
import { Errors } from './const';
import * as BaseCommands from './commands';
import * as BashParser from './parser';

export default class Bash {

    constructor(extensions = {}) {
        this.commands = Object.assign(extensions, BaseCommands);
        this.prevCommands = [];
        this.prevCommandsIndex = 0;
    }

    /*
     * This adds the given <input> into the terminal history
     *
     * @param {string} input - the user input
     * @param {Object} state - the current terminal state
     * @returns {Object} the new terminal state
     */
    pushInput(input, currentState) {
        this.prevCommands.push(input);
        this.prevCommandsIndex = this.prevCommands.length;

        // Append input to history
        return Object.assign({}, currentState, {
            history: currentState.history.concat({
                cwd: currentState.cwd,
                value: input,
            }),
        });
    }

    /*
     * This parses and executes the given <input> and returns an updated
     * state object.
     *
     * @param {string} input - the user input
     * @param {Object} state - the current terminal state
     * @returns {Object} a promise that resolves to the new terminal state
     */
    execute(input, currentState) {
        const commandList = BashParser.parse(input);
        return this.runCommands(commandList, currentState);
    }

    /*
     * This function executes a list of command lists. The outer list
     * is a dependency list parsed from the `&&` operator. The inner lists
     * are groups of commands parsed from the `;` operator. If any given
     * command fails, the outer list will stop executing.
     *
     * @param {Array} commands - the commands to run
     * @param {Object} state - the terminal state
     * @returns {Object} a promise that resolves to the new terminal state
     */
    runCommands(commands, state) {
        let errorOccurred = false;

        /*
         * This function executes a single command and wraps its result into a
         * a promise. If the promise fails, or if it returns an erroneous
         * state, the following dependent commands should not be run.
         */
        const reducer = (previousCommand, command) => {
            if (command.name === '') {
                return previousCommand;
            }

            return previousCommand
                .then((newState) => {
                    if (this.commands[command.name]) {
                        errorOccurred = errorOccurred || (newState && newState.error);
                        return errorOccurred
                            ? newState
                            : Promise.resolve(this.commands[command.name].exec(newState, command));
                    } else {
                        errorOccurred = true;
                        return Util.appendError(newState, Errors.COMMAND_NOT_FOUND, command.name);
                    }
                })
                .catch((error) => {
                    errorOccurred = true;
                    const message = (error && error.message)
                        ? error.message
                        : `command ${command.name} failed`;
                    return Util.appendError(newState, '$1', `command ${command.name} failed`);
                });
        };

        let result = Promise.resolve(state);
        while (!errorOccurred && commands.length) {
            const dependentCommands = commands.shift();
            result = dependentCommands.reduce(reducer, result);
        }
        return result;
    }

    /*
     * This is a very naive autocomplete method that works for both
     * commands and directories. If the input contains only one token it
     * should only suggest commands.
     *
     * @param {string} input - the user input
     * @param {Object} state - the terminal state
     * @param {Object} state.structure - the file structure
     * @param {string} state.cwd - the current working directory
     * @returns {?string} a suggested autocomplete for the <input>
     */
    autocomplete(input, { structure, cwd }) {
        const tokens = input.split(/ +/);
        let token = tokens.pop();
        const filter = item => item.indexOf(token) === 0;
        const result = str => tokens.concat(str).join(' ');

        if (tokens.length === 0) {
            const suggestions = Object.keys(this.commands).filter(filter);
            return suggestions.length === 1 ? result(suggestions[0]) : null;
        } else {
            const pathList = token.split('/');
            token = pathList.pop();
            const partialPath = pathList.join('/');
            const path = Util.extractPath(partialPath, cwd);
            const { err, dir } = Util.getDirectoryByPath(structure, path);
            if (err) return null;
            const suggestions = Object.keys(dir).filter(filter);
            const prefix = partialPath ? `${partialPath}/` : '';
            return suggestions.length === 1 ? result(`${prefix}${suggestions[0]}`) : null;
        }
    }

    getPrevCommand() {
        return this.prevCommands[--this.prevCommandsIndex];
    }

    getNextCommand() {
        return this.prevCommands[++this.prevCommandsIndex];
    }

    hasPrevCommand() {
        return this.prevCommandsIndex !== 0;
    }

    hasNextCommand() {
        return this.prevCommandsIndex !== this.prevCommands.length - 1;
    }

}
