import { ADD_GROWL, DISMISS_GROWL } from '../actions/types'


const growl = (state, action) => {
    switch (action.type) {
    case ADD_GROWL:
        return {
            uid: action.payload.uid,
            level: action.payload.level,
            icon: action.payload.icon,
            body: action.payload.body
        }

    default:
        return state
    }
}


const growls = (state = [], action) => {
    switch (action.type) {
    case ADD_GROWL:
        return [growl(undefined, action), ...state]

    case DISMISS_GROWL:
        return state.filter((it) => (it.uid != action.payload.uid))

    default:
        return state
    }
}


export default growls
