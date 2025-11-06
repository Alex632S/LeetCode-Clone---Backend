import type { App } from 'vue'
import { createI18n } from 'vue-i18n'
import en from './locales/en.json'
import ru from './locales/ru.json'

const locales = {
  en,
  ru,
} as const

export type Locale = keyof typeof locales

const getSavedLocale = (): Locale => {
  const saved = localStorage.getItem('preferred-locale') as Locale
  return saved && Object.keys(locales).includes(saved) ? saved : 'en'
}

export const saveLocale = (locale: Locale): void => {
  localStorage.setItem('preferred-locale', locale)
}

const i18n = createI18n({
  legacy: false,
  locale: getSavedLocale(),
  fallbackLocale: 'en',
  messages: locales,
})

export const installI18n = (app: App) => {
  app.use(i18n)
}

export { i18n }
export default i18n
