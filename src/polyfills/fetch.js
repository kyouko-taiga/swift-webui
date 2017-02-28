/*
 *  Polyfill inspired by fetch-bluebird (github.com/undoZen/fetch-bluebird)
 *  that provides winfow.fetch, and makes it return Bluebird promises rather
 *  than native promises.
 */

(function(global) {
    'use strict'

    let Bluebird = require('bluebird')

    if (!global.fetch) {
        require('isomorphic-fetch')
    }

    if (fetch.Promise) {
        if (fetch.Promise === Promise) {
            return
        }
        fetch.Promise = Bluebird
        return
    }

    global.fetch = (function (f) {
        return function fetch(url) {
            return Bluebird.resolve(f.apply(this, arguments))
        }
    }(fetch));

    function transMethod(obj, method) {
        let origMethod = obj[method]
        obj[method] = function() {
            return Bluebird.resolve(origMethod.apply(this, arguments))
        }
    }

    for (let obj of [global.Response, global.Request]) {
        if (obj && obj.prototype) {
            for (let method of ['arrayBuffer', 'blob', 'formData', 'json', 'text']) {
                if (obj.prototype[method]) {
                    transMethod(obj.prototype, method)
                }
            }
        }
    }
}(typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : typeof window !== 'undefined' ? window : {}));
