import type { Locale } from '@/i18n'
import type { ComputedRef } from 'vue'

export interface LocaleOption {
  name: string
  code: Locale
  flag?: string
}

export type TranslateFunction = (key: string, params?: Record<string, any>) => string

export interface I18nComposable {
  t: TranslateFunction
  locale: ComputedRef<Locale>
  setLocale: (locale: Locale) => void
  hasTranslation: (key: string) => boolean
  pluralize: (key: string, count: number, params?: Record<string, any>) => string
  availableLocales: LocaleOption[]
}
