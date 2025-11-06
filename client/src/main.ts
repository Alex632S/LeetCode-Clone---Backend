import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura'
import ToastService from 'primevue/toastservice'
import { installI18n } from './i18n'
import 'primeflex/primeflex.css'

import App from './App.vue'
import router from './router'

import './assets/main.css'

const app = createApp(App)

app.use(PrimeVue, {
  theme: {
    preset: Aura,
  },
  ripple: true,
})
app.use(ToastService)
app.use(createPinia())
app.use(router)
installI18n(app)

app.mount('#app')
