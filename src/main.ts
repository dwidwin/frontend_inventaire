import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { VueQueryPlugin, QueryClient } from '@tanstack/vue-query'
import { configure } from 'vee-validate'
import { config } from './config'
import { initSentry } from './utils/sentry'
import App from './App.vue'
import router from './router'
import './style.css'

// Configuration VeeValidate
configure({
  validateOnBlur: true,
  validateOnChange: true,
  validateOnInput: false,
  validateOnModelUpdate: true,
})

// Configuration Vue Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: config.query.staleTime,
      retry: (failureCount: number, error: unknown) => {
        // Ne pas retry sur les erreurs 401/403
        const errorObj = error as { statusCode?: number }
        if (errorObj?.statusCode === 401 || errorObj?.statusCode === 403) {
          return false
        }
        return failureCount < config.query.retryAttempts
      },
    },
    mutations: {
      retry: false,
    },
  },
})

// Création de l'app
const app = createApp(App)

// Plugins
app.use(createPinia())
app.use(VueQueryPlugin, { queryClient })
app.use(router)

// Initialiser Sentry (optionnel, nécessite VITE_SENTRY_DSN)
if (import.meta.env.VITE_SENTRY_DSN) {
  initSentry(app, router)
}

app.mount('#app')
