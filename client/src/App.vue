<template>
  <div id="app">
    <Toast />
    <Menubar :model="menuItems">
      <template #start>
        <RouterLink to="/" class="flex align-items-center no-underline text-color">
          <i class="pi pi-code text-2xl mr-2"></i>
          <span class="font-bold text-xl">{{ t('common.appName') }}</span>
        </RouterLink>
      </template>
      <template #end>
        <div class="flex align-items-center gap-3">
          <SelectButton
            v-model="currentLocale"
            :options="locales"
            optionLabel="name"
            optionValue="code"
            class="text-sm"
          />
          <div v-if="authStore.isAuthenticated" class="flex align-items-center gap-3">
            <Avatar :label="userInitials" shape="circle" />
            <span class="font-medium">{{ authStore.user?.username }}</span>
            <Button 
              :label="t('auth.logout')" 
              severity="secondary" 
              @click="authStore.logout()"
              size="small"
            />
          </div>
          <div v-else class="flex gap-2">
            <Button 
              :label="t('auth.login')" 
              @click="$router.push('/login')"
              size="small"
            />
            <Button 
              :label="t('auth.register')" 
              severity="secondary"
              @click="$router.push('/register')"
              size="small"
            />
          </div>
        </div>
      </template>
    </Menubar>

    <main class="main-content">
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useI18n } from '@/composables/useI18n'
import type { Locale } from '@/i18n'
import Menubar from 'primevue/menubar'
import Button from 'primevue/button'
import Avatar from 'primevue/avatar'
import Toast from 'primevue/toast'
import SelectButton from 'primevue/selectbutton'

const router = useRouter()
const authStore = useAuthStore()
const { t, locale, setLocale } = useI18n()

const currentLocale = ref<Locale>(locale.value)

const locales = ref<{ name: string; code: Locale }[]>([
  { name: 'EN', code: 'en' },
  { name: 'RU', code: 'ru' }
])

const userInitials = computed(() => {
  const user = authStore.user
  if (!user) return ''
  return user.username.charAt(0).toUpperCase()
})

const menuItems = computed(() => [
  {
    label: t('navigation.problems'),
    icon: 'pi pi-list',
    command: () => router.push('/')
  },
  ...(authStore.isAuthenticated ? [{
    label: t('navigation.profile'),
    icon: 'pi pi-user',
    command: () => router.push('/profile')
  }] : [])
])

watch(currentLocale, (newLocale: Locale) => {
  setLocale(newLocale)
})
</script>