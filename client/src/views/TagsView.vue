<template>
  <div class="tags-view">
    <div class="grid">
      <div class="col-12">
        <Card>
          <template #title>
            <div class="flex align-items-center gap-2">
              <i class="pi pi-tags"></i>
              <span>{{ t('tags.title') }}</span>
            </div>
          </template>
          <template #subtitle>
            {{ t('tags.subtitle') }}
          </template>
          <template #content>
            <div class="flex justify-content-between align-items-center mb-4">
              <Button
                v-if="canCreateTag"
                :label="t('tags.createTag')"
                icon="pi pi-plus"
                @click="openCreateDialog"
              />
              <InputText
                v-model="searchQuery"
                :placeholder="t('tags.searchPlaceholder')"
                class="w-4"
                @input="loadTags"
              />
            </div>

            <DataTable
              :value="tags"
              :loading="loading"
              class="p-datatable-sm"
              :paginator="true"
              :rows="10"
              :rowsPerPageOptions="[10, 20, 50]"
            >
              <Column field="name" :header="t('tags.name')" sortable>
                <template #body="{ data }">
                  <div class="flex align-items-center gap-2">
                    <div
                      v-if="data.color"
                      class="w-3 h-3 border-round"
                      :style="{ backgroundColor: data.color }"
                    ></div>
                    <span>{{ data.name }}</span>
                  </div>
                </template>
              </Column>
              <Column field="description" :header="t('tags.description')" />
              <Column field="createdAt" :header="t('admin.createdAt')" sortable>
                <template #body="{ data }">
                  {{ formatDate(data.createdAt) }}
                </template>
              </Column>
              <Column :header="t('common.actions')" style="min-width: 120px">
                <template #body="{ data }">
                  <div class="flex gap-1">
                    <Button
                      v-if="canEditTag"
                      icon="pi pi-pencil"
                      text
                      rounded
                      severity="secondary"
                      @click="editTag(data)"
                      v-tooltip.top="t('common.edit')"
                    />
                    <Button
                      v-if="canDeleteTag"
                      icon="pi pi-trash"
                      text
                      rounded
                      severity="danger"
                      @click="deleteTag(data)"
                      v-tooltip.top="t('common.delete')"
                    />
                  </div>
                </template>
              </Column>
              <template #empty>
                <div class="text-center p-4 text-color-secondary">
                  <i class="pi pi-tags text-4xl mb-2"></i>
                  <p>{{ t('tags.noTags') }}</p>
                </div>
              </template>
            </DataTable>
          </template>
        </Card>
      </div>
    </div>

    <!-- Create/Edit Tag Dialog -->
    <Dialog
      v-model:visible="showTagDialog"
      :header="editMode ? t('tags.editTag') : t('tags.createTag')"
      :style="{ width: '500px' }"
      :modal="true"
    >
      <div class="flex flex-column gap-3">
        <div class="field">
          <label class="font-bold block mb-2">{{ t('tags.name') }} *</label>
          <InputText
            v-model="tagForm.name"
            class="w-full"
            :class="{ 'p-invalid': errors.name }"
            :placeholder="t('tags.namePlaceholder')"
          />
          <small v-if="errors.name" class="p-error">{{ errors.name }}</small>
        </div>
        <div class="field">
          <label class="font-bold block mb-2">{{ t('tags.description') }}</label>
          <Textarea
            v-model="tagForm.description"
            rows="3"
            class="w-full"
            :placeholder="t('tags.descriptionPlaceholder')"
          />
        </div>
        <div class="field">
          <label class="font-bold block mb-2">{{ t('tags.color') }}</label>
          <ColorPicker v-model="tagForm.color" class="w-full" :style="{ width: '100%' }" />
        </div>
      </div>
      <template #footer>
        <Button
          :label="t('common.cancel')"
          icon="pi pi-times"
          @click="showTagDialog = false"
          severity="secondary"
          text
        />
        <Button
          :label="editMode ? t('common.save') : t('common.create')"
          icon="pi pi-check"
          @click="saveTag"
          :loading="loading"
          :disabled="!tagForm.name.trim()"
        />
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
        <span>{{ t('tags.confirmDelete') }}</span>
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
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { apiService } from '@/services/api'
import { useI18n } from '@/composables/useI18n'
import { useToast } from 'primevue/usetoast'
import type { Tag, TagCreate } from '@/types'

// PrimeVue components
import Card from 'primevue/card'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Dialog from 'primevue/dialog'
import ColorPicker from 'primevue/colorpicker'
import Tooltip from 'primevue/tooltip'

const authStore = useAuthStore()
const toast = useToast()
const { t } = useI18n()

const tags = ref<Tag[]>([])
const loading = ref(false)
const searchQuery = ref('')
const showTagDialog = ref(false)
const showDeleteDialog = ref(false)
const editMode = ref(false)
const tagToDelete = ref<Tag | null>(null)
const editingTagId = ref<number | null>(null)

const tagForm = reactive<TagCreate>({
  name: '',
  description: '',
  color: '#FF6B6B',
})

const errors = reactive({
  name: '',
})

const canCreateTag = computed(() => {
  return authStore.user?.role === 'admin' || authStore.user?.role === 'interviewer'
})

const canEditTag = computed(() => {
  return authStore.user?.role === 'admin'
})

const canDeleteTag = computed(() => {
  return authStore.user?.role === 'admin'
})

// Метод для открытия диалога создания
const openCreateDialog = () => {
  showTagDialog.value = true
  editMode.value = false
  resetTagForm()
}

const loadTags = async () => {
  loading.value = true
  try {
    const response = await apiService.getTags(searchQuery.value)
    tags.value = response.tags
  } catch (error) {
    console.error('Failed to load tags:', error)
    toast.add({
      severity: 'error',
      summary: t('common.error'),
      detail: t('tags.failedToLoad'),
      life: 5000,
    })
  } finally {
    loading.value = false
  }
}

const editTag = (tag: Tag) => {
  editingTagId.value = tag.id
  tagForm.name = tag.name
  tagForm.description = tag.description || ''
  tagForm.color = tag.color || '#FF6B6B'
  editMode.value = true
  showTagDialog.value = true
}

const deleteTag = (tag: Tag) => {
  tagToDelete.value = tag
  showDeleteDialog.value = true
}

const saveTag = async () => {
  // Validate form
  errors.name = ''

  if (!tagForm.name.trim()) {
    errors.name = t('validation.required', { field: t('tags.name') })
    return
  }

  loading.value = true
  try {
    if (editMode.value && editingTagId.value) {
      await apiService.updateTag(editingTagId.value, tagForm)
      toast.add({
        severity: 'success',
        summary: t('common.success'),
        detail: t('tags.tagUpdated'),
        life: 3000,
      })
    } else {
      await apiService.createTag(tagForm)
      toast.add({
        severity: 'success',
        summary: t('common.success'),
        detail: t('tags.tagCreated'),
        life: 3000,
      })
    }

    showTagDialog.value = false
    resetTagForm()
    await loadTags()
  } catch (error: any) {
    console.error('Failed to save tag:', error)
    toast.add({
      severity: 'error',
      summary: t('common.error'),
      detail: error.message || t('tags.failedToSave'),
      life: 5000,
    })
  } finally {
    loading.value = false
  }
}

const confirmDelete = async () => {
  if (!tagToDelete.value) return

  loading.value = true
  try {
    await apiService.deleteTag(tagToDelete.value.id)

    toast.add({
      severity: 'success',
      summary: t('common.success'),
      detail: t('tags.tagDeleted'),
      life: 3000,
    })

    showDeleteDialog.value = false
    tagToDelete.value = null
    await loadTags()
  } catch (error: any) {
    console.error('Failed to delete tag:', error)
    toast.add({
      severity: 'error',
      summary: t('common.error'),
      detail: error.message || t('tags.failedToDelete'),
      life: 5000,
    })
  } finally {
    loading.value = false
  }
}

const resetTagForm = () => {
  tagForm.name = ''
  tagForm.description = ''
  tagForm.color = '#FF6B6B'
  editingTagId.value = null
  editMode.value = false
  errors.name = ''
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

// Watch for search query changes with debounce
let searchTimeout: number
watch(searchQuery, () => {
  clearTimeout(searchTimeout)
  searchTimeout = window.setTimeout(() => {
    loadTags()
  }, 500)
})

onMounted(() => {
  loadTags()
})
</script>

<style scoped>
.tags-view {
  padding: 1rem;
}

:deep(.p-datatable) {
  font-size: 0.9rem;
}

:deep(.p-column-header-content) {
  font-weight: 600;
}

:deep(.p-colorpicker) {
  width: 100%;
}

:deep(.p-colorpicker-preview) {
  width: 100%;
  height: 40px;
}
</style>
