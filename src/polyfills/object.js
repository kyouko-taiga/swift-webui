if (typeof Object.assign != 'function') {
    Object.assign = function(target) {
        if (target == null) {
            throw new TypeError('Cannot convert undefined or null to object')
        }

        target = Object(target)
        for (let index = 1; index < arguments.length; index++) {
            let source = arguments[index]
            if (source != null) {
                for (let key in source) {
                    if (Object.prototype.hasOwnProperty.call(source, key)) {
                        target[key] = source[key]
                    }
                }
            }
        }
        return target
    }
}


if (typeof Object.map != 'function') {
    Object.map = function(source, fn) {
        if (typeof fn != 'function') {
            throw new TypeError('fn is not a function')
        }

        let rv = {}
        for (let key in source) {
            let [new_key, new_value] = fn(key, source[key])
            rv[new_key] = new_value
        }

        return rv
    }
}


if (typeof Object.filter != 'function') {
    Object.filter = function(source, fn) {
        if (typeof fn != 'function') {
            throw new TypeError('fn is not a function')
        }

        let rv = {}
        for (let key in source) {
            if (fn(key, source[key])) {
                rv[key] = source[key]
            }
        }

        return rv
    }
}
