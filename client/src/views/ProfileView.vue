<template>
  <div class="profile-view">
    <div class="grid">
      <div class="col-12 md:col-8">
        <Card>
          <template #title>
            <div class="flex align-items-center gap-2">
              <i class="pi pi-user"></i>
              <span>{{ t('profile.title') }}</span>
            </div>
          </template>
          <template #content>
            <div v-if="authStore.user" class="profile-content">
              <!-- User Info -->
              <div class="user-info grid">
                <div class="col-12 md:col-6">
                  <div class="field">
                    <label class="font-bold block mb-2">{{ t('auth.username') }}</label>
                    <InputText 
                      v-model="editForm.username" 
                      class="w-full" 
                      :disabled="!isEditing"
                    />
                  </div>
                </div>
                <div class="col-12 md:col-6">
                  <div class="field">
                    <label class="font-bold block mb-2">{{ t('auth.email') }}</label>
                    <InputText 
                      v-model="authStore.user.email" 
                      class="w-full" 
                      disabled
                    />
                  </div>
                </div>
                <div class="col-12 md:col-6">
                  <div class="field">
                    <label class="font-bold block mb-2">{{ t('auth.role') }}</label>
                    <Dropdown 
                      v-model="editForm.role" 
                      :options="roleOptions" 
                      optionLabel="label"
                      optionValue="value"
                      class="w-full"
                      :disabled="!isEditing || !isAdmin"
                    />
                  </div>
                </div>
                <div class="col-12 md:col-6">
                  <div class="field">
                    <label class="font-bold block mb-2">{{ t('profile.memberSince') }}</label>
                    <InputText 
                      :value="formatDate(authStore.user.createdAt)" 
                      class="w-full" 
                      disabled
                    />
                  </div>
                </div>
              </div>

              <!-- Edit Actions -->
              <div class="flex gap-2 mt-4">
                <Button 
                  v-if="!isEditing"
                  :label="t('profile.editProfile')" 
                  icon="pi pi-pencil" 
                  @click="startEditing"
                />
                <template v-else>
                  <Button 
                    :label="t('common.save')" 
                    icon="pi pi-check" 
                    @click="saveProfile"
                    :loading="loading"
                  />
                  <Button 
                    :label="t('common.cancel')" 
                    icon="pi pi-times" 
                    severity="secondary"
                    @click="cancelEditing"
                  />
                </template>
              </div>
            </div>

            <div v-else class="text-center p-4">
              <ProgressSpinner />
              <span class="ml-2">{{ t('common.loading') }}</span>
            </div>
          </template>
        </Card>

        <!-- User Statistics -->
        <Card class="mt-4">
          <template #title>
            <div class="flex align-items-center gap-2">
              <i class="pi pi-chart-bar"></i>
              <span>{{ t('profile.statistics') }}</span>
            </div>
          </template>
          <template #content>
            <div class="grid text-center">
              <div class="col-6 md:col-3">
                <div class="text-2xl font-bold text-primary">{{ userStats.solvedProblems }}</div>
                <div class="text-color-secondary text-sm">{{ t('profile.solved') }}</div>
              </div>
              <div class="col-6 md:col-3">
                <div class="text-2xl font-bold text-green-500">{{ userStats.easySolved }}</div>
                <div class="text-color-secondary text-sm">{{ t('problems.easy') }}</div>
              </div>
              <div class="col-6 md:col-3">
                <div class="text-2xl font-bold text-orange-500">{{ userStats.mediumSolved }}</div>
                <div class="text-color-secondary text-sm">{{ t('problems.medium') }}</div>
              </div>
              <div class="col-6 md:col-3">
                <div class="text-2xl font-bold text-red-500">{{ userStats.hardSolved }}</div>
                <div class="text-color-secondary text-sm">{{ t('problems.hard') }}</div>
              </div>
            </div>
          </template>
        </Card>
      </div>

      <div class="col-12 md:col-4">
        <!-- Recent Activity -->
        <Card>
          <template #title>
            <div class="flex align-items-center gap-2">
              <i class="pi pi-history"></i>
              <span>{{ t('profile.recentActivity') }}</span>
            </div>
          </template>
          <template #content>
            <div v-if="recentActivity.length > 0" class="activity-list">
              <div 
                v-for="activity in recentActivity" 
                :key="activity.id" 
                class="activity-item flex align-items-center gap-3 mb-3"
              >
                <Avatar 
                  :label="getActivityIcon(activity.type)" 
                  shape="circle" 
                  size="large"
                  :class="getActivitySeverity(activity.type)"
                />
                <div class="flex-1">
                  <div class="font-medium">{{ activity.description }}</div>
                  <div class="text-color-secondary text-sm">
                    {{ formatTimeAgo(activity.timestamp) }}
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="text-center text-color-secondary p-4">
              <i class="pi pi-inbox text-4xl mb-2"></i>
              <p>{{ t('profile.noActivity') }}</p>
            </div>
          </template>
        </Card>

        <!-- User Badges -->
        <Card class="mt-4">
          <template #title>
            <div class="flex align-items-center gap-2">
              <i class="pi pi-star"></i>
              <span>{{ t('profile.badges') }}</span>
            </div>
          </template>
          <template #content>
            <div class="flex flex-wrap gap-2">
              <Badge 
                v-for="badge in userBadges" 
                :key="badge.id"
                :value="badge.name" 
                :severity="badge.severity"
                class="text-sm"
              />
            </div>
          </template>
        </Card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useToast } from 'primevue/usetoast'
import { useI18n } from '@/composables/useI18n'

// PrimeVue components
import Card from 'primevue/card'
import InputText from 'primevue/inputtext'
import Dropdown from 'primevue/dropdown'
import Button from 'primevue/button'
import ProgressSpinner from 'primevue/progressspinner'
import Avatar from 'primevue/avatar'
import Badge from 'primevue/badge'

const authStore = useAuthStore()
const toast = useToast()
const { t } = useI18n()

const isEditing = ref(false)
const loading = ref(false)

const editForm = reactive({
  username: '',
  role: 'user' as 'user' | 'interviewer' | 'admin',
})

const roleOptions = ref([
  { label: 'User', value: 'user' },
  { label: 'Interviewer', value: 'interviewer' },
  { label: 'Admin', value: 'admin' },
])

const userStats = ref({
  solvedProblems: 0,
  easySolved: 0,
  mediumSolved: 0,
  hardSolved: 0,
  totalSubmissions: 0,
  acceptanceRate: 0,
})

const recentActivity = ref([
  {
    id: 1,
    type: 'problem_solved',
    description: 'Solved "Two Sum"',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
  },
  {
    id: 2,
    type: 'problem_attempted',
    description: 'Attempted "Reverse Linked List"',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
  },
  {
    id: 3,
    type: 'comment',
    description: 'Commented on "Valid Parentheses"',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
  },
])

const userBadges = ref([
  { id: 1, name: 'First Problem', severity: 'success' },
  { id: 2, name: 'Quick Solver', severity: 'warning' },
  { id: 3, name: 'Commentator', severity: 'info' },
])

const isAdmin = computed(() => {
  return authStore.user?.role === 'admin'
})

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const formatTimeAgo = (date: Date) => {
  const now = new Date()
  const diffInMs = now.getTime() - date.getTime()
  const diffInHours = diffInMs / (1000 * 60 * 60)

  if (diffInHours < 1) {
    const diffInMinutes = Math.floor(diffInHours * 60)
    return `${diffInMinutes}m ago`
  } else if (diffInHours < 24) {
    return `${Math.floor(diffInHours)}h ago`
  } else {
    return `${Math.floor(diffInHours / 24)}d ago`
  }
}

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'problem_solved':
      return '✓'
    case 'problem_attempted':
      return '↻'
    case 'comment':
      return '💬'
    default:
      return '•'
  }
}

const getActivitySeverity = (type: string) => {
  switch (type) {
    case 'problem_solved':
      return 'bg-green-500'
    case 'problem_attempted':
      return 'bg-orange-500'
    case 'comment':
      return 'bg-blue-500'
    default:
      return 'bg-gray-500'
  }
}

const startEditing = () => {
  if (authStore.user) {
    editForm.username = authStore.user.username
    editForm.role = authStore.user.role
  }
  isEditing.value = true
}

const cancelEditing = () => {
  isEditing.value = false
}

const saveProfile = async () => {
  if (!authStore.user) return

  loading.value = true
  try {
    await authStore.updateUser({
      username: editForm.username,
      role: editForm.role
    })
    
    toast.add({
      severity: 'success',
      summary: t('common.success'),
      detail: t('profile.updateSuccess'),
      life: 3000
    })
    
    isEditing.value = false
  } catch (error: any) {
    toast.add({
      severity: 'error',
      summary: t('common.error'),
      detail: error.message || t('profile.updateFailed'),
      life: 5000
    })
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  userStats.value = {
    solvedProblems: 15,
    easySolved: 8,
    mediumSolved: 5,
    hardSolved: 2,
    totalSubmissions: 25,
    acceptanceRate: 60,
  }
})
</script>

<style scoped>
.profile-view {
  min-height: calc(100vh - 100px);
}

.activity-item {
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--surface-200);
}

.activity-item:last-child {
  border-bottom: none;
}

:deep(.p-avatar) {
  color: white;
  font-weight: bold;
}

.bg-green-500 {
  background: var(--green-500) !important;
}

.bg-orange-500 {
  background: var(--orange-500) !important;
}

.bg-blue-500 {
  background: var(--blue-500) !important;
}

.bg-gray-500 {
  background: var(--gray-500) !important;
}
</style>
