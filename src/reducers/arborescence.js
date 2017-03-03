import { LIST_FILES } from '../actions/types'


const arborescence = (state = {}, action) => {
    switch (action.type) {
    case LIST_FILES:
        if ((action.meta.status == 'pending') || !action.payload.entities) {
            return state
        }

        // Rebuild the file arborescence.
        let newArborescence = {}
        const files = Object.map(action.payload.entities['files'], (key, value) =>
            [key, {...value, __modified__: false}])

        for (let path in files) {
            // Walk the arborescence and create any missing subdirectories.
            let directory = newArborescence
            const components = path.split('/').slice(0, -1)
            components.map((subdirectory, index) => {
                if (!(subdirectory in directory)) {
                    directory[subdirectory] = {
                        path: components.slice(0, index + 1).join('/') + '/',
                        files: {}
                    }
                }
                directory = directory[subdirectory].files
            })

            // Place the file in the arborescence.
            directory[path] = files[path].path
        }

        return newArborescence

    default:
        return state
    }
}

export default arborescence
