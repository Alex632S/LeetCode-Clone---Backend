import { ref, onUnmounted } from 'vue'

export function useDebounceFn<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
) {
  const timeout = ref<number>() // ← Исправлено: number вместо NodeJS.Timeout

  onUnmounted(() => {
    if (timeout.value) {
      clearTimeout(timeout.value)
    }
  })

  return (...args: Parameters<T>): void => {
    if (timeout.value) {
      clearTimeout(timeout.value)
    }
    
    timeout.value = window.setTimeout(() => { // ← Исправлено: window.setTimeout
      fn(...args)
    }, delay)
  }
}