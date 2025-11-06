<template>
  <div class="login-container flex justify-content-center align-items-center min-h-screen">
    <Card class="login-card w-full md:w-4">
      <template #title>Login</template>
      <template #content>
        <form @submit.prevent="handleLogin" class="flex flex-column gap-3">
          <div class="field">
            <label for="email" class="block text-900 font-medium mb-2">Email</label>
            <InputText
              id="email"
              v-model="form.email"
              type="email"
              class="w-full"
              placeholder="Enter your email"
              :class="{ 'p-invalid': errors.email }"
            />
            <small v-if="errors.email" class="p-error">{{ errors.email }}</small>
          </div>

          <div class="field">
            <label for="password" class="block text-900 font-medium mb-2">Password</label>
            <Password
              id="password"
              v-model="form.password"
              class="w-full"
              placeholder="Enter your password"
              :feedback="false"
              toggleMask
              :class="{ 'p-invalid': errors.password }"
            />
            <small v-if="errors.password" class="p-error">{{ errors.password }}</small>
          </div>

          <Button type="submit" label="Login" class="w-full" :loading="authStore.loading" />
        </form>

        <Divider />

        <div class="text-center">
          <p class="text-600">Don't have an account?</p>
          <Button label="Register" link @click="$router.push('/register')" />
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.ts'
import { useToast } from 'primevue/usetoast'

const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()

const form = reactive({
  email: '',
  password: '',
})

const errors = reactive({
  email: '',
  password: '',
})

const validateForm = () => {
  let isValid = true
  errors.email = ''
  errors.password = ''

  if (!form.email) {
    errors.email = 'Email is required'
    isValid = false
  } else if (!/\S+@\S+\.\S+/.test(form.email)) {
    errors.email = 'Email is invalid'
    isValid = false
  }

  if (!form.password) {
    errors.password = 'Password is required'
    isValid = false
  } else if (form.password.length < 6) {
    errors.password = 'Password must be at least 6 characters'
    isValid = false
  }

  return isValid
}

const handleLogin = async () => {
  if (!validateForm()) return

  try {
    await authStore.login(form.email, form.password)
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Login successful',
      life: 3000,
    })
    router.push('/')
  } catch (error: any) {
    toast.add({
      severity: 'error',
      summary: 'Login Failed',
      detail: error.message || 'Invalid credentials',
      life: 5000,
    })
  }
}
</script>

<style scoped>
.login-container {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-card {
  background: white;
}
</style>
