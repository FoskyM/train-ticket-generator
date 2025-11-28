import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import { initCopyrightInfo } from './utils/copyright'

// 初始化版权保护
initCopyrightInfo()

const app = createApp(App)

app.mount('#app')
