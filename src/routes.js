import Root from './components/Root'
import EditorView from './components/editor/EditorView'


// Declare the application routes. Note that I chose not to use the JSX
// syntax, as I find it less readable than plain JS for routes declaration.
const routes = {
    path: '/',
    component: Root,
    indexRoute: {
        component: EditorView
    }
}


export default routes
