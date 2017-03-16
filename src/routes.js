import Root from './components/Root'
import EditorView from './components/editor/EditorView'
import IndexView from './components/IndexView'
import CreateWorkspaceView from './components/workspaces/CreateWorkspaceView'


// Declare the application routes. Note that I chose not to use the JSX
// syntax, as I find it less readable than plain JS for routes declaration.
const routes = {
    path: '/',
    component: Root,
    indexRoute: {
        component: IndexView,
    },
    childRoutes: [{
        path: 'create-workspace',
        component: CreateWorkspaceView,
    }, {
        path: ':workspaceName/editor',
        component: EditorView,
    }],
}


export default routes
