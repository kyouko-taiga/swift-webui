import Bluebird from 'bluebird'
import { normalize } from 'normalizr'

import { API_ROOT } from '../constants'

import schemas from './schemas'


class ExtendableError extends Error {
    constructor(message, name) {
        super(message)
        this.name = name
        this.message = message
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, this.constructor);
        } else {
            this.stack = (new Error(message)).stack;
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
        .catch((err) => {
            let exc = new ApiError(response.statusText, 'ApiError', `Error ${response.status}`)
            console.warn(exc)
            throw exc
        })
}


const wrapper = {
    repositories: {
        list: () => ({
            get: () => fetch(`${API_ROOT}/repositories/`)
                .then((resp) => handleResponse(resp, [schemas.repository]))
        }),
        select: (repositoryId) => ({
            get: () => fetch(`${API_ROOT}/repositories/${repositoryId}`)
                .then((resp) => handleResponse(resp, schemas.repository)),
            files: {
                list: () => ({
                    get: () => fetch(`${API_ROOT}/repositories/${repositoryId}/files/`)
                        .then((resp) => handleResponse(resp, [schemas.file]))
                }),
                select: (filePath) => ({
                    get: () => fetch(`${API_ROOT}/repositories/${repositoryId}/files/${filePath}`)
                        .then((resp) => handleResponse(resp, schemas.file)),
                    patch: (entity) => fetch(`${API_ROOT}/repositories/${repositoryId}/files/${filePath}`, {
                        method: 'PATCH',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify(entity)
                    }).then((resp) => handleResponse(resp, schemas.file))
                })
            }
        })
    }
}


export default wrapper
