<template>
  <div class="register-container flex justify-content-center align-items-center min-h-screen">
    <Card class="register-card w-full md:w-4">
      <template #title>
        <div class="flex align-items-center gap-2">
          <i class="pi pi-user-plus"></i>
          <span>{{ t('auth.registerTitle') }}</span>
        </div>
      </template>
      <template #content>
        <form @submit.prevent="handleRegister" class="flex flex-column gap-3">
          <div class="field">
            <label for="username" class="block text-900 font-medium mb-2">{{
              t('auth.username')
            }}</label>
            <InputText
              id="username"
              v-model="form.username"
              type="text"
              class="w-full"
              :placeholder="t('auth.username')"
              :class="{ 'p-invalid': errors.username }"
            />
            <small v-if="errors.username" class="p-error">{{ errors.username }}</small>
          </div>

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
            <label for="password" class="block text-900 font-medium mb-2">{{
              t('auth.password')
            }}</label>
            <Password
              id="password"
              v-model="form.password"
              class="w-full"
              :placeholder="t('auth.password')"
              toggleMask
              :feedback="true"
              :class="{ 'p-invalid': errors.password }"
            >
              <template #header>
                <h6 class="mb-2">{{ t('auth.passwordRequirements') }}</h6>
              </template>
            </Password>
            <small v-if="errors.password" class="p-error">{{ errors.password }}</small>
          </div>

          <div class="field">
            <label for="confirmPassword" class="block text-900 font-medium mb-2">{{
              t('auth.confirmPassword')
            }}</label>
            <Password
              id="confirmPassword"
              v-model="form.confirmPassword"
              class="w-full"
              :placeholder="t('auth.confirmPassword')"
              toggleMask
              :feedback="false"
              :class="{ 'p-invalid': errors.confirmPassword }"
            />
            <small v-if="errors.confirmPassword" class="p-error">{{
              errors.confirmPassword
            }}</small>
          </div>

          <div class="field">
            <label for="role" class="block text-900 font-medium mb-2">{{ t('auth.role') }}</label>
            <Dropdown
              id="role"
              v-model="form.role"
              :options="roleOptions"
              optionLabel="label"
              optionValue="value"
              :placeholder="t('auth.role')"
              class="w-full"
            />
            <small class="text-color-secondary text-sm">{{ t('auth.roleHint') }}</small>
          </div>

          <Button
            type="submit"
            :label="t('auth.register')"
            class="w-full mt-3"
            :loading="authStore.loading"
            size="large"
          />
        </form>

        <Divider />

        <div class="text-center">
          <p class="text-600">{{ t('auth.hasAccount') }}</p>
          <Button :label="t('auth.login')" link @click="$router.push('/login')" />
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
import Dropdown from 'primevue/dropdown'

const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()
const { t } = useI18n()

const form = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  role: 'user' as 'user' | 'interviewer' | 'admin',
})

const errors = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
})

const roleOptions = ref([
  { label: t('roles.user'), value: 'user' },
  { label: t('roles.interviewer'), value: 'interviewer' },
  { label: t('roles.admin'), value: 'admin' },
])

const validateForm = () => {
  let isValid = true

  Object.keys(errors).forEach((key) => {
    errors[key as keyof typeof errors] = ''
  })

  if (!form.username.trim()) {
    errors.username = t('validation.required', { field: t('auth.username') })
    isValid = false
  } else if (form.username.length < 3) {
    errors.username = t('validation.usernameLength', { length: 3 })
    isValid = false
  }

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

  if (!form.confirmPassword) {
    errors.confirmPassword = t('validation.required', { field: t('auth.confirmPassword') })
    isValid = false
  } else if (form.password !== form.confirmPassword) {
    errors.confirmPassword = t('validation.passwordsMatch')
    isValid = false
  }

  return isValid
}

const handleRegister = async () => {
  if (!validateForm()) return

  try {
    await authStore.register({
      username: form.username,
      email: form.email,
      password: form.password,
      role: form.role,
    })

    toast.add({
      severity: 'success',
      summary: t('common.success'),
      detail: t('auth.registerSuccess'),
      life: 3000,
    })

    router.push('/')
  } catch (error: any) {
    toast.add({
      severity: 'error',
      summary: t('auth.registerFailed'),
      detail: error.message || t('auth.registerFailed'),
      life: 5000,
    })
  }
}
</script>

<style scoped>
.register-container {
  background: #e7ebe9;
  padding: 2rem;
}

.register-card {
  background: white;
  max-width: 400px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

:deep(.p-password input) {
  width: 100%;
}
</style>
