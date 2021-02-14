import Router from 'svelte-easyroute'
import List from './pages/List.svelte'
import Profile from './pages/Profile.svelte'
import Edit from './pages/Edit.svelte'

export const router = new Router({
    mode: "hash",
    omitTrailingSlash: true,

    routes: [
        {
            path: '/',
            component: List,
            name: 'Index'
        },
        {
            path: '/profile',
            component: Profile,
            name: 'Profile'
        },
        {
            path: '/edit',
            component: Edit,
            name: 'Edit'
        }
    ]
})