import { i18n, type Locale } from '@/i18n'
import { computed } from 'vue'

export const useI18n = () => {
  const { t, locale } = i18n.global

  const setLocale = (newLocale: Locale) => {
    locale.value = newLocale
  }

  const currentLocale = computed(() => locale.value as Locale)

  return {
    t,
    locale: currentLocale,
    setLocale,
  }
}
