
export function makeRequestCreator(
        actionType, request, meta = {}) {

    return (dispatch) => {
        // Dispatch the pending action.
        dispatch({
            type: actionType,
            meta: {
                ...meta,
                status: 'pending'
            }
        })

        return dispatch({
            type: actionType,
            payload: request,
            meta: {
                ...meta,
                status: 'completed'
            }
        })
    }

}
