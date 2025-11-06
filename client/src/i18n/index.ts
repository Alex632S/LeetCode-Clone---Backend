import type { App } from 'vue'
import { createI18n } from 'vue-i18n'
import en from './locales/en.json'
import ru from './locales/ru.json'

export type Locale = 'en' | 'ru'

const i18n = createI18n({
  legacy: false,
  locale: 'en' as Locale,
  fallbackLocale: 'en' as Locale,
  messages: {
    en,
    ru,
  },
})

export const installI18n = (app: App) => {
  app.use(i18n)
}

export { i18n }
export default i18n
