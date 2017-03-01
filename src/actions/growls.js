import React from 'react'

import { ADD_GROWL, DISMISS_GROWL } from './types'


let _nextUid = 0


export function growl(level = 'info', icon = 'info', body = '') {
    return {
        type: ADD_GROWL,
        payload: {
            uid: _nextUid++,
            level: level,
            icon: icon,
            body: body
        }
    }
}


export function growlError(error, title, icon = 'warning') {
    let body
    if (title) {
        body = (
            <div>
                <strong>{title}</strong>
                <p>{error.message}</p>
            </div>
        )
    } else {
        body = error.message
    }


    return growl('danger', icon, body)
}


export function dismiss(uid) {
    return {
        type: DISMISS_GROWL,
        payload: {
            uid: uid
        }
    }
}
