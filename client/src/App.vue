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
          <!-- Селектор языка с флагами -->
          <Dropdown
            v-model="currentLocale"
            :options="availableLocales"
            optionLabel="name"
            optionValue="code"
            :placeholder="t('common.selectLanguage')"
            class="w-10rem"
          >
            <template #value="slotProps">
              <div v-if="slotProps.value" class="flex align-items-center gap-2">
                <span>{{ getLocaleFlag(slotProps.value) }}</span>
                <span>{{ getLocaleName(slotProps.value) }}</span>
              </div>
              <span v-else>
                {{ slotProps.placeholder }}
              </span>
            </template>
            <template #option="slotProps">
              <div class="flex align-items-center gap-2">
                <span>{{ slotProps.option.flag }}</span>
                <span>{{ slotProps.option.name }}</span>
              </div>
            </template>
          </Dropdown>

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
            <Button :label="t('auth.login')" @click="$router.push('/login')" size="small" />
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
import { computed, ref, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useI18n } from '@/composables/useI18n'
import type { Locale } from '@/i18n'
import Menubar from 'primevue/menubar'
import Button from 'primevue/button'
import Avatar from 'primevue/avatar'
import Toast from 'primevue/toast'
import Dropdown from 'primevue/dropdown'

const router = useRouter()
const authStore = useAuthStore()
const { t, locale, setLocale, availableLocales } = useI18n()

const currentLocale = ref<Locale>(locale.value)

const userInitials = computed(() => {
  const user = authStore.user
  if (!user) return ''
  return user.username.charAt(0).toUpperCase()
})

const getLocaleName = (localeCode: Locale): string => {
  const localeObj = availableLocales.find((loc) => loc.code === localeCode)
  return localeObj?.name || localeCode
}

const getLocaleFlag = (localeCode: Locale): string => {
  const localeObj = availableLocales.find((loc) => loc.code === localeCode)
  return localeObj?.flag || '🌐'
}

const menuItems = computed(() => {
  const items = [
    {
      label: t('navigation.problems'),
      icon: 'pi pi-list',
      command: () => router.push('/'),
    },
  ]

  if (authStore.isAuthenticated) {
    // Кнопка создания задачи для админов и интервьюеров
    if (authStore.user?.role === 'admin' || authStore.user?.role === 'interviewer') {
      items.push({
        label: t('problems.createProblem'),
        icon: 'pi pi-plus',
        command: () => router.push('/problems/create'),
      })
    }

    items.push(
      {
        label: t('navigation.profile'),
        icon: 'pi pi-user',
        command: () => router.push('/profile'),
      },
      {
        label: t('tags.title'),
        icon: 'pi pi-tags',
        command: () => router.push('/tags'),
      },
    )

    // Админские пункты меню
    if (authStore.user?.role === 'admin') {
      items.push({
        label: t('admin.users'),
        icon: 'pi pi-users',
        command: () => router.push('/admin/users'),
      })
    }
  }

  return items
})

watch(currentLocale, (newLocale: Locale) => {
  setLocale(newLocale)
})

watch(locale, (newLocale) => {
  currentLocale.value = newLocale
})
</script>

<style scoped>
.main-content {
  padding: 1rem;
  background: #e7ebe9;
  min-height: 94vh;
}
</style>
