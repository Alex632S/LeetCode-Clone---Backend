<template>
  <div id="app">
    <Toast />
    <Menubar :model="menuItems" class="shadow-2">
      <template #start>
        <RouterLink to="/" class="flex align-items-center no-underline text-color">
          <i class="pi pi-code text-2xl mr-2"></i>
          <span class="font-bold text-xl">LeetCode Clone</span>
        </RouterLink>
      </template>
      <template #end>
        <div v-if="authStore.isAuthenticated" class="flex align-items-center gap-3">
          <Avatar :label="userInitials" shape="circle" />
          <span class="font-medium">{{ authStore.user?.username }}</span>
          <Button label="Logout" severity="secondary" @click="authStore.logout()" size="small" />
        </div>
        <div v-else class="flex gap-2">
          <Button label="Login" @click="$router.push('/login')" size="small" />
          <Button
            label="Register"
            severity="secondary"
            @click="$router.push('/register')"
            size="small"
          />
        </div>
      </template>
    </Menubar>

    <main class="main-content">
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.ts'
import Menubar from 'primevue/menubar'
import Button from 'primevue/button'
import Avatar from 'primevue/avatar'
import Toast from 'primevue/toast'

const router = useRouter()
const authStore = useAuthStore()

const userInitials = computed(() => {
  const user = authStore.user
  if (!user) return ''
  return user.username.charAt(0).toUpperCase()
})

const menuItems = computed(() => [
  {
    label: 'Problems',
    icon: 'pi pi-list',
    command: () => router.push('/'),
  },
  ...(authStore.isAuthenticated
    ? [
        {
          label: 'Profile',
          icon: 'pi pi-user',
          command: () => router.push('/profile'),
        },
      ]
    : []),
])

onMounted(() => {
  authStore.checkAuth()
})
</script>

<style>
#app {
  min-height: 100vh;
  background-color: var(--surface-ground);
}

.main-content {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

/* Custom styles for problem descriptions */
.problem-description {
  line-height: 1.7;
}

.problem-description h1 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: var(--surface-900);
}

.problem-description h2 {
  font-size: 1.25rem;
  margin: 1.5rem 0 0.75rem 0;
  color: var(--surface-700);
}

.problem-description h3 {
  font-size: 1.1rem;
  margin: 1.25rem 0 0.5rem 0;
  color: var(--surface-600);
}

.problem-description p {
  margin-bottom: 1rem;
}

.problem-description pre {
  background: var(--surface-800);
  color: var(--surface-100);
  padding: 1rem;
  border-radius: 6px;
  overflow-x: auto;
  margin: 1rem 0;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.9rem;
}

.problem-description code {
  background: var(--surface-100);
  padding: 0.2rem 0.4rem;
  border-radius: 3px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.9rem;
}

.problem-description pre code {
  background: none;
  padding: 0;
}
</style>
