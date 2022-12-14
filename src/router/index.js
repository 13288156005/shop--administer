import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '@/components/Login.vue'
import Home from '@/components/home.vue'
import Welcome from '@/components/Welcome.vue'
import Userlist from '@/components/users/userlist.vue'
import Rights from '@/components/power/Rights.vue'
import Roles from '@/components/power/Roles.vue'
import Goodlist from '@/components/goods/Goodlist.vue'
import Categories from '@/components/goods/Categories.vue'
import Params from '@/components/goods/Params.vue'
import Add from '@/components/goods/Add.vue'

Vue.use(VueRouter)

const routes = [
    { path: '/', redirect: '/login' },
    { path: '/login', component: Login },
    {
        path: '/home',
        component: Home,
        redirect: '/welcome',
        children: [
            { path: '/welcome', component: Welcome },
            { path: '/users', component: Userlist },
            { path: '/rights', component: Rights },
            { path: '/roles', component: Roles },
            { path: '/goods', component: Goodlist },
            { path: '/goods/add', component: Add },
            { path: '/categories', component: Categories },
            { path: '/params', component: Params }
        ]
    }
]

const router = new VueRouter({
        routes
    })
    // 路由守卫
router.beforeEach((to, from, next) => {
    if (to.path === '/login') return next()
        //获取token
    const tokenStr = window.sessionStorage.getItem('token')
    if (!tokenStr) return next('/login')
    next()
})

export default router