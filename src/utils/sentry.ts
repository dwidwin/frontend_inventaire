import * as Sentry from '@sentry/vue'
import type { App } from 'vue'
import { logger } from './logger'

export const initSentry = (app: App, router: any) => {
  const dsn = import.meta.env.VITE_SENTRY_DSN
  
  if (!dsn) {
    logger.warn('Sentry DSN not configured. Error tracking disabled.')
    return
  }

  Sentry.init({
    app,
    dsn,
    integrations: [
      Sentry.browserTracingIntegration({
        routerInstrumentation: Sentry.vueRouterInstrumentation(router),
        tracePropagationTargets: ['localhost', /^https:\/\/api-inventory\.edwinbouchenna\.fr/],
      }),
    ],
    tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,
    environment: import.meta.env.MODE,
    beforeSend(event, hint) {
      // Filtrer les erreurs non pertinentes
      if (event.exception) {
        const error = hint.originalException
        // Ignorer les erreurs de réseau si elles sont fréquentes
        if (error instanceof Error && error.message.includes('Network Error')) {
          return null
        }
      }
      return event
    },
  })
}
