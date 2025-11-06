<template>
  <div class="login-container flex justify-content-center align-items-center min-h-screen">
    <Card class="login-card w-full md:w-4">
      <template #title>{{ t('auth.loginTitle') }}</template>
      <template #content>
        <form @submit.prevent="handleLogin" class="flex flex-column gap-3">
          <div class="field">
            <label for="email" class="block text-900 font-medium mb-2">{{ t('auth.email') }}</label>
            <InputText
              id="email"
              v-model="form.email"
              type="email"
              class="w-full"
              :placeholder="t('auth.email')"
              :class="{ 'p-invalid': errors.email }"
            />
            <small v-if="errors.email" class="p-error">{{ errors.email }}</small>
          </div>
          
          <div class="field">
            <label for="password" class="block text-900 font-medium mb-2">{{ t('auth.password') }}</label>
            <Password
              id="password"
              v-model="form.password"
              class="w-full"
              :placeholder="t('auth.password')"
              :feedback="false"
              toggleMask
              :class="{ 'p-invalid': errors.password }"
            />
            <small v-if="errors.password" class="p-error">{{ errors.password }}</small>
          </div>
          
          <Button 
            type="submit" 
            :label="t('auth.login')" 
            class="w-full" 
            :loading="authStore.loading"
          />
        </form>
        
        <Divider />
        
        <div class="text-center">
          <p class="text-600">{{ t('auth.noAccount') }}</p>
          <Button 
            :label="t('auth.register')" 
            link 
            @click="$router.push('/register')"
          />
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToast } from 'primevue/usetoast'
import { useI18n } from '@/composables/useI18n'

// PrimeVue components
import Card from 'primevue/card'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Button from 'primevue/button'
import Divider from 'primevue/divider'

const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()
const { t } = useI18n()

const form = reactive({
  email: '',
  password: ''
})

const errors = reactive({
  email: '',
  password: ''
})

const validateForm = () => {
  let isValid = true
  errors.email = ''
  errors.password = ''

  if (!form.email) {
    errors.email = t('validation.required', { field: t('auth.email') })
    isValid = false
  } else if (!/\S+@\S+\.\S+/.test(form.email)) {
    errors.email = t('validation.emailInvalid')
    isValid = false
  }

  if (!form.password) {
    errors.password = t('validation.required', { field: t('auth.password') })
    isValid = false
  } else if (form.password.length < 6) {
    errors.password = t('validation.passwordLength', { length: 6 })
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
      summary: t('common.success'),
      detail: t('auth.loginSuccess'),
      life: 3000
    })
    router.push('/')
  } catch (error: any) {
    toast.add({
      severity: 'error',
      summary: t('auth.loginFailed'),
      detail: error.message || t('auth.invalidCredentials'),
      life: 5000
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
