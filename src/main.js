import Vue from 'vue'
import App from './App.vue'
import router from './router'
//导入全局样式
import '@/assets/css/global.css'

import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';

Vue.use(ElementUI);

import TreeTable from 'vue-table-with-tree-grid'

Vue.config.productionTip = false
import axios from 'axios';

//配置请求路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
Vue.prototype.$http = axios
    //拦截axios绑定token
axios.interceptors.request.use(config => {

    config.headers.Authorization = window.sessionStorage.getItem('token')
    return config
})

Vue.component('tree-table', TreeTable)

Vue.filter('dataFormat', function(originVal) {
    const dt = new Date(originVal)
    const y = dt.getFullYear()
    const m = (dt.getMonth() + 1 + '').padStart(2, '0')
    const d = (dt.getDate() + '').padStart(2, '0')

    const hh = (dt.getHours() + '').padStart(2, '0')
    const mm = (dt.getMinutes() + '').padStart(2, '0')
    const ss = (dt.getSeconds() + '').padStart(2, '0')
    return `${y}-${m}-${d}  ${hh}:${mm}:${ss}`
})

new Vue({
    router,
    render: h => h(App)
}).$mount('#app')