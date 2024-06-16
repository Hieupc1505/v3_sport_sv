const express = require('express')

const authRoute = require('./v1/auth.route')
const taskRoute = require('./v1/task.route')
const userRoute = require('./v1/user.route')

const initRoute = require('./v1/initData')
const sportRoute = require('./v1/sport.route')

const router = express.Router()

const defaultRoutes = [
    {
        path: '/v1/auth',
        route: authRoute,
    },
    {
        path: '/v1/tasks',
        route: taskRoute,
    },
    {
        path: '/v1/users',
        route: userRoute,
    },
    {
        path: '/v1/init',
        route: initRoute,
    },
    {
        path: '/v1/sports',
        route: sportRoute,
    },
]

defaultRoutes.forEach((route) => {
    router.use(route.path, route.route)
})

module.exports = router
