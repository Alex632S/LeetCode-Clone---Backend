<template>
  <div class="register-container flex justify-content-center align-items-center min-h-screen">
    <Card class="register-card w-full md:w-4">
      <template #title>
        <div class="flex align-items-center gap-2">
          <i class="pi pi-user-plus"></i>
          <span>Create Account</span>
        </div>
      </template>
      <template #content>
        <form @submit.prevent="handleRegister" class="flex flex-column gap-3">
          <div class="field">
            <label for="username" class="block text-900 font-medium mb-2">Username</label>
            <InputText
              id="username"
              v-model="form.username"
              type="text"
              class="w-full"
              placeholder="Enter your username"
              :class="{ 'p-invalid': errors.username }"
            />
            <small v-if="errors.username" class="p-error">{{ errors.username }}</small>
          </div>
          
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
              toggleMask
              :feedback="true"
              :class="{ 'p-invalid': errors.password }"
            >
              <template #header>
                <h6 class="mb-2">Pick a password</h6>
              </template>
              <template #footer>
                <Divider class="my-2" />
                <p class="mb-2">Suggestions</p>
                <ul class="pl-2 ml-2 mt-0 text-sm" style="line-height: 1.5">
                  <li>At least one lowercase</li>
                  <li>At least one uppercase</li>
                  <li>At least one numeric</li>
                  <li>Minimum 6 characters</li>
                </ul>
              </template>
            </Password>
            <small v-if="errors.password" class="p-error">{{ errors.password }}</small>
          </div>

          <div class="field">
            <label for="confirmPassword" class="block text-900 font-medium mb-2">Confirm Password</label>
            <Password
              id="confirmPassword"
              v-model="form.confirmPassword"
              class="w-full"
              placeholder="Confirm your password"
              toggleMask
              :feedback="false"
              :class="{ 'p-invalid': errors.confirmPassword }"
            />
            <small v-if="errors.confirmPassword" class="p-error">{{ errors.confirmPassword }}</small>
          </div>

          <div class="field">
            <label for="role" class="block text-900 font-medium mb-2">Role</label>
            <Dropdown
              id="role"
              v-model="form.role"
              :options="roleOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="Select your role"
              class="w-full"
            />
            <small class="text-color-secondary text-sm">Choose "Interviewer" if you want to create problems</small>
          </div>
          
          <Button 
            type="submit" 
            label="Create Account" 
            class="w-full mt-3" 
            :loading="authStore.loading"
            size="large"
          />
        </form>
        
        <Divider />
        
        <div class="text-center">
          <p class="text-600">Already have an account?</p>
          <Button 
            label="Login" 
            link 
            @click="$router.push('/login')"
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

const form = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  role: 'user' as 'user' | 'interviewer' | 'admin'
})

const errors = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const roleOptions = ref([
  { label: 'User', value: 'user' },
  { label: 'Interviewer', value: 'interviewer' },
  { label: 'Admin', value: 'admin' }
])

const validateForm = () => {
  let isValid = true
  
  // Reset errors
  Object.keys(errors).forEach(key => {
    errors[key as keyof typeof errors] = ''
  })

  // Username validation
  if (!form.username.trim()) {
    errors.username = 'Username is required'
    isValid = false
  } else if (form.username.length < 3) {
    errors.username = 'Username must be at least 3 characters'
    isValid = false
  }

  // Email validation
  if (!form.email) {
    errors.email = 'Email is required'
    isValid = false
  } else if (!/\S+@\S+\.\S+/.test(form.email)) {
    errors.email = 'Email is invalid'
    isValid = false
  }

  // Password validation
  if (!form.password) {
    errors.password = 'Password is required'
    isValid = false
  } else if (form.password.length < 6) {
    errors.password = 'Password must be at least 6 characters'
    isValid = false
  } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.password)) {
    errors.password = 'Password must contain at least one lowercase, one uppercase letter and one number'
    isValid = false
  }

  // Confirm password validation
  if (!form.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password'
    isValid = false
  } else if (form.password !== form.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match'
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
      role: form.role
    })
    
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Account created successfully!',
      life: 3000
    })
    
    router.push('/')
  } catch (error: any) {
    toast.add({
      severity: 'error',
      summary: 'Registration Failed',
      detail: error.message || 'Failed to create account',
      life: 5000
    })
  }
}
</script>

<style scoped>
.register-container {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
}

.register-card {
  background: white;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

:deep(.p-password input) {
  width: 100%;
}
</style>