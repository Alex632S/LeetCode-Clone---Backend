import { i18n, type Locale, saveLocale } from '@/i18n'
import type { TranslateFunction } from '@/types/i18n.ts'
import { computed } from 'vue'

export const useI18n = () => {
  const { t, locale, te } = i18n.global

  const setLocale = (newLocale: Locale) => {
    locale.value = newLocale
    saveLocale(newLocale)
  }

  const currentLocale = computed(() => locale.value as Locale)

  const translate: TranslateFunction = (key: string, params?: Record<string, any>) => {
    //@ts-ignore
    return t(key, params)
  }

  const pluralize = (key: string, count: number, params?: Record<string, any>) => {
    const pluralKey = count === 1 ? key : `${key}_plural`
    return t(pluralKey, { count, ...params })
  }

  const hasTranslation = (key: string): boolean => {
    return te(key)
  }

  const availableLocales = [
    { code: 'en' as Locale, name: 'English', flag: '🇺🇸' },
    { code: 'ru' as Locale, name: 'Русский', flag: '🇷🇺' },
  ]

  return {
    t: translate,
    locale: currentLocale,
    setLocale,
    hasTranslation,
    pluralize,
    availableLocales,
  }
}
