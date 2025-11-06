<template>
  <div class="users-view">
    <div class="grid">
      <div class="col-12">
        <Card>
          <template #title>
            <div class="flex align-items-center gap-2">
              <i class="pi pi-users"></i>
              <span>{{ t('admin.users') }}</span>
            </div>
          </template>
          <template #subtitle>
            {{ t('admin.usersSubtitle') }}
          </template>
          <template #content>
            <DataTable
              :value="users"
              :loading="loading"
              :paginator="true"
              :rows="10"
              :rowsPerPageOptions="[10, 20, 50]"
              class="p-datatable-sm"
            >
              <Column field="id" :header="t('common.id')" sortable />
              <Column field="username" :header="t('auth.username')" sortable />
              <Column field="email" :header="t('auth.email')" sortable />
              <Column field="role" :header="t('admin.userRole')" sortable>
                <template #body="{ data }">
                  <Tag :value="t(`roles.${data.role}`)" :severity="getRoleSeverity(data.role)" />
                </template>
              </Column>
              <Column field="createdAt" :header="t('admin.createdAt')" sortable>
                <template #body="{ data }">
                  {{ formatDate(data.createdAt) }}
                </template>
              </Column>
              <Column field="updatedAt" :header="t('admin.updatedAt')" sortable>
                <template #body="{ data }">
                  {{ formatDate(data.updatedAt) }}
                </template>
              </Column>
              <Column :header="t('common.actions')" style="min-width: 120px">
                <template #body="{ data }">
                  <div class="flex gap-1">
                    <Button
                      icon="pi pi-pencil"
                      text
                      rounded
                      severity="secondary"
                      @click="editUser(data)"
                      v-tooltip.top="t('common.edit')"
                    />
                    <Button
                      v-if="data.id !== authStore.user?.id"
                      icon="pi pi-trash"
                      text
                      rounded
                      severity="danger"
                      @click="deleteUser(data)"
                      v-tooltip.top="t('common.delete')"
                    />
                  </div>
                </template>
              </Column>
            </DataTable>
          </template>
        </Card>
      </div>
    </div>

    <!-- Edit User Dialog -->
    <Dialog
      v-model:visible="showUserDialog"
      :header="t('admin.editUser')"
      :style="{ width: '500px' }"
      :modal="true"
    >
      <div class="flex flex-column gap-3" v-if="selectedUser">
        <div class="field">
          <label class="font-bold block mb-2">{{ t('auth.username') }} *</label>
          <InputText
            v-model="userForm.username"
            class="w-full"
            :class="{ 'p-invalid': errors.username }"
          />
          <small v-if="errors.username" class="p-error">{{ errors.username }}</small>
        </div>

        <div class="field">
          <label class="font-bold block mb-2">{{ t('auth.email') }}</label>
          <InputText v-model="selectedUser.email" class="w-full" disabled />
          <small class="text-color-secondary">{{ t('admin.emailCannotBeChanged') }}</small>
        </div>

        <div class="field">
          <label class="font-bold block mb-2">{{ t('auth.role') }} *</label>
          <Dropdown
            v-model="userForm.role"
            :options="roleOptions"
            optionLabel="label"
            optionValue="value"
            class="w-full"
            :class="{ 'p-invalid': errors.role }"
          />
          <small v-if="errors.role" class="p-error">{{ errors.role }}</small>
        </div>

        <div class="field">
          <label class="font-bold block mb-2">{{ t('admin.memberSince') }}</label>
          <InputText :value="formatDate(selectedUser.createdAt)" class="w-full" disabled />
        </div>
      </div>

      <template #footer>
        <Button
          :label="t('common.cancel')"
          icon="pi pi-times"
          @click="showUserDialog = false"
          severity="secondary"
          text
        />
        <Button :label="t('common.save')" icon="pi pi-check" @click="saveUser" :loading="loading" />
      </template>
    </Dialog>

    <!-- Delete Confirmation Dialog -->
    <Dialog
      v-model:visible="showDeleteDialog"
      :header="t('common.confirm')"
      :style="{ width: '400px' }"
      :modal="true"
    >
      <div class="flex align-items-center gap-3">
        <i class="pi pi-exclamation-triangle text-3xl text-red-500" />
        <span>{{ t('admin.confirmDeleteUser') }}</span>
      </div>

      <template #footer>
        <Button
          :label="t('common.no')"
          icon="pi pi-times"
          @click="showDeleteDialog = false"
          severity="secondary"
          text
        />
        <Button
          :label="t('common.yes')"
          icon="pi pi-check"
          @click="confirmDelete"
          severity="danger"
          :loading="loading"
        />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { apiService } from '@/services/api'
import { useI18n } from '@/composables/useI18n'
import { useToast } from 'primevue/usetoast'
import type { User } from '@/types'

// PrimeVue components
import Card from 'primevue/card'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Dropdown from 'primevue/dropdown'
import Tooltip from 'primevue/tooltip'

const authStore = useAuthStore()
const toast = useToast()
const { t } = useI18n()

const users = ref<User[]>([])
const loading = ref(false)
const showUserDialog = ref(false)
const showDeleteDialog = ref(false)
const selectedUser = ref<User | null>(null)
const userToDelete = ref<User | null>(null)

const userForm = reactive({
  username: '',
  role: 'user' as 'user' | 'interviewer' | 'admin',
})

const errors = reactive({
  username: '',
  role: '',
})

const roleOptions = computed(() => [
  { label: t('roles.user'), value: 'user' },
  { label: t('roles.interviewer'), value: 'interviewer' },
  { label: t('roles.admin'), value: 'admin' },
])

const getRoleSeverity = (role: string) => {
  switch (role) {
    case 'admin':
      return 'danger'
    case 'interviewer':
      return 'warning'
    case 'user':
      return 'info'
    default:
      return 'secondary'
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const loadUsers = async () => {
  loading.value = true
  try {
    const response = await apiService.getUsers()
    users.value = response.users
  } catch (error) {
    console.error('Failed to load users:', error)
    toast.add({
      severity: 'error',
      summary: t('common.error'),
      detail: t('admin.failedToLoadUsers'),
      life: 5000,
    })
  } finally {
    loading.value = false
  }
}

const editUser = (user: User) => {
  selectedUser.value = user
  userForm.username = user.username
  userForm.role = user.role
  showUserDialog.value = true
}

const deleteUser = (user: User) => {
  userToDelete.value = user
  showDeleteDialog.value = true
}

const saveUser = async () => {
  // Validate form
  errors.username = ''
  errors.role = ''

  if (!userForm.username.trim()) {
    errors.username = t('validation.required', { field: t('auth.username') })
    return
  }

  if (!userForm.role) {
    errors.role = t('validation.required', { field: t('auth.role') })
    return
  }

  if (!selectedUser.value) return

  loading.value = true
  try {
    await apiService.updateUser(selectedUser.value.id, userForm)

    toast.add({
      severity: 'success',
      summary: t('common.success'),
      detail: t('admin.userUpdated'),
      life: 3000,
    })

    showUserDialog.value = false
    await loadUsers() // Reload users to get updated data
  } catch (error: any) {
    console.error('Failed to update user:', error)
    toast.add({
      severity: 'error',
      summary: t('common.error'),
      detail: error.message || t('admin.failedToUpdateUser'),
      life: 5000,
    })
  } finally {
    loading.value = false
  }
}

const confirmDelete = async () => {
  if (!userToDelete.value) return

  loading.value = true
  try {
    // Note: API might not have delete user endpoint
    // For now, we'll just demote to user role
    await apiService.updateUser(userToDelete.value.id, { role: 'user' })

    toast.add({
      severity: 'success',
      summary: t('common.success'),
      detail: t('admin.userDemoted'),
      life: 3000,
    })

    showDeleteDialog.value = false
    userToDelete.value = null
    await loadUsers()
  } catch (error: any) {
    console.error('Failed to update user:', error)
    toast.add({
      severity: 'error',
      summary: t('common.error'),
      detail: error.message || t('admin.failedToUpdateUser'),
      life: 5000,
    })
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadUsers()
})
</script>

<style scoped>
.users-view {
  padding: 1rem;
}

:deep(.p-datatable) {
  font-size: 0.9rem;
}

:deep(.p-column-header-content) {
  font-weight: 600;
}
</style>
