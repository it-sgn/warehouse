import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

// 1. Import Vuetify (tetap sama)
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import '@mdi/font/css/materialdesignicons.css' 

const vuetify = createVuetify({
  components,
  directives,
  icons: {
    defaultSet: 'mdi',
  },
})

// 2. Import Keycloak
import { vueKeycloak } from '@josempgon/vue-keycloak'
import { keycloakConfig, initOptions } from './config/keycloak.js'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(vuetify)

// 3. Inisialisasi Keycloak secara Asinkron
// Pasang plugin keycloak dan tunggu sampai selesai inisialisasi
vueKeycloak.install(app, {
    config: keycloakConfig,
    initOptions: initOptions,
})
.then(() => {
    // 4. Setelah Keycloak terinisialisasi dan autentikasi berhasil, pasang aplikasi Vue.
    console.log('Keycloak terinisialisasi dan pengguna terautentikasi.')
    app.mount('#app')
})
.catch((error) => {
    console.error('Inisialisasi Keycloak Gagal:', error)
    // Tampilkan pesan error atau fallback UI jika gagal autentikasi/inisialisasi
    // app.mount('#app') // Pasang tanpa autentikasi jika diperlukan
})