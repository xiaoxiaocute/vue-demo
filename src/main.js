import Vue from 'vue'
import App from './App.vue'
import router from './router.js'
import './plugins/element.js'
import TreeTable from 'vue-table-with-tree-grid'
// 导入全局样式表
import './assets/css/global.css'
// 导入全局字体文件
import './assets/fonts/iconfont.css'
import axios from 'axios'

Vue.config.productionTip = false
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
Vue.prototype.$http = axios

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')

Vue.component('tree-table', TreeTable)
