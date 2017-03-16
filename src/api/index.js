import { normalize } from 'normalizr'

import { API_ROOT } from '../constants'

import schemas from './schemas'


class ExtendableError extends Error {
    constructor(message, name) {
        super(message)
        this.name = name
        this.message = message
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, this.constructor)
        } else {
            this.stack = (new Error(message)).stack
        }
    }
}


class ApiError extends ExtendableError {
    constructor(message, name = 'ApiError', status = undefined) {
        super(message, name)
        this.status = status
    }
}


function handleResponse(response, schema) {
    return response.json()
        .then((json) => {
            if ((response.status >= 400) && (response.status < 600)) {
                let exc = new ApiError(json.message, json.name, response.status)
                console.warn(exc)
                throw exc
            }

            // Dispatch the request completion.
            if (typeof schema != 'undefined') {
                return normalize(json, schema)
            } else {
                return {result: json}
            }
        })
        .catch(() => {
            let exc = new ApiError(response.statusText, `Error ${response.status}`, response.status)
            console.warn(exc)
            throw exc
        })
}


const wrapper = {
    workspaces: {
        list: () => ({
            get: () => fetch(`${API_ROOT}/workspaces/`)
                .then((resp) => handleResponse(resp, [schemas.workspace]))
        }),
        post: (entity) => fetch(`${API_ROOT}/workspaces/`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(entity)
        }),
        select: (workspaceId) => ({
            get: () => fetch(`${API_ROOT}/workspaces/${workspaceId}`)
                .then((resp) => handleResponse(resp, schemas.workspace)),
            files: {
                list: () => ({
                    get: () => fetch(`${API_ROOT}/workspaces/${workspaceId}/`)
                        .then((resp) => handleResponse(resp, [schemas.file]))
                }),
                select: (filePath) => ({
                    get: () => fetch(`${API_ROOT}/workspaces/${workspaceId}/${filePath}`)
                        .then((resp) => handleResponse(resp, schemas.file)),
                    post: (entity) => fetch(`${API_ROOT}/workspaces/${workspaceId}/${filePath}`, {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify(entity)
                    }).then((resp) => handleResponse(resp, schemas.file))
                })
            }
        })
    },
    bash: {
        execute: (command) => ({
            post: () => fetch(`${API_ROOT}/bash/execute`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ command })
            }).then((resp) => handleResponse(resp))
        })
    }
}


export default wrapper
