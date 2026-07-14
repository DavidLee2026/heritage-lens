import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import './assets/design-tokens.css'

const app = createApp(App)

// 全局错误边界
app.config.errorHandler = (err, instance, info) => {
  console.error('[Vue Error]', err, info)
}
window.addEventListener('unhandledrejection', (e) => {
  console.error('[Unhandled Promise]', e.reason)
})

app.use(createPinia())
app.mount('#app')
