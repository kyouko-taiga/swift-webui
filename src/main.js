import './polyfills/object'

import React from 'react'
import { render } from 'react-dom'
import { Router, hashHistory } from 'react-router'

import { createStore, applyMiddleware } from 'redux'
import { Provider } from 'react-redux'
import createLogger from 'redux-logger'
import promiseMiddleware from 'redux-promise'
import thunkMiddleware from 'redux-thunk'

import appState from './reducers'
import routes from './routes'


let store = createStore(
    appState,
    applyMiddleware(
        thunkMiddleware,
        promiseMiddleware,
        createLogger({collapsed: true})
    )
)


const App = (
    <Provider store={store}>
        <Router history={hashHistory} routes={routes} />
    </Provider>
)


render(App, document.getElementById('app'))
