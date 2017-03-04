import api from '../api'
import { BASH_EXECUTE } from './types'
import { makeRequestCreator } from './factories'


export function execute(command, { requestId } = {}) {
    command = command + (command.endsWith('\n') ? '' : '\n')
    return makeRequestCreator(
        BASH_EXECUTE,
        api.bash.execute(command).post(),
        {
            args: { command },
            requestId: requestId,
        }
    )
}
