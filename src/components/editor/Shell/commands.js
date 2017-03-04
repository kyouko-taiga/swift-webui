import { execute } from '../../../actions/bash'


export default (dispatch) => ({

    uname: {
        exec: (state, command) => {
            return dispatch(execute(command.input)).then((action) => {
                return {
                    ...state,
                    history: state.history.concat({ value: action.payload.result.stdout })
                }
            })
        }
    },

})
