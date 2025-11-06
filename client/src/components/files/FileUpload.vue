<template>
  <div class="file-upload">
    <Card>
      <template #title>
        <div class="flex align-items-center gap-2">
          <i class="pi pi-cloud-upload"></i>
          <span>{{ t('files.upload') }}</span>
        </div>
      </template>
      <template #content>
        <form @submit.prevent="uploadFile" class="flex flex-column gap-3">
          <div class="field">
            <label class="font-bold block mb-2">{{ t('files.selectFile') }} *</label>
            <FileUpload
              mode="basic"
              :chooseLabel="t('files.chooseFile')"
              :class="{ 'p-invalid': errors.file }"
              @select="onFileSelect"
            />
            <small v-if="errors.file" class="p-error">{{ errors.file }}</small>
          </div>

          <div class="field">
            <label class="font-bold block mb-2">{{ t('files.description') }}</label>
            <InputText v-model="form.description" class="w-full" />
          </div>

          <Button
            type="submit"
            :label="t('files.upload')"
            icon="pi pi-upload"
            :loading="loading"
            :disabled="!selectedFile"
          />
        </form>

        <!-- Uploaded Files List -->
        <div v-if="files.length > 0" class="mt-4">
          <h4>{{ t('files.uploadedFiles') }}</h4>
          <DataTable :value="files" class="p-datatable-sm">
            <Column field="originalName" :header="t('files.fileName')" />
            <Column field="fileSize" :header="t('files.fileSize')">
              <template #body="{ data }">
                {{ formatFileSize(data.fileSize) }}
              </template>
            </Column>
            <Column field="description" :header="t('files.description')" />
            <Column :header="t('common.actions')">
              <template #body="{ data }">
                <div class="flex gap-1">
                  <Button icon="pi pi-download" text rounded @click="downloadFile(data)" />
                  <Button
                    icon="pi pi-trash"
                    text
                    rounded
                    severity="danger"
                    @click="deleteFile(data)"
                  />
                </div>
              </template>
            </Column>
          </DataTable>
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useI18n } from '@/composables/useI18n'
import { apiService } from '@/services/api'
import type { File } from '@/types'

// PrimeVue components
import Card from 'primevue/card'
import FileUpload from 'primevue/fileupload'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'

interface Props {
  problemId: number
}

const props = defineProps<Props>()
const { t } = useI18n()

const files = ref<File[]>([])
const loading = ref(false)
const selectedFile = ref<File | null>(null)

const form = reactive({
  description: '',
})

const errors = reactive({
  file: '',
})

const onFileSelect = (event: any) => {
  selectedFile.value = event.files[0]
  errors.file = ''
}

const uploadFile = async () => {
  if (!selectedFile.value) {
    errors.file = t('validation.required', { field: t('files.file') })
    return
  }

  loading.value = true
  try {
    const formData = new FormData()
    formData.append('file', selectedFile.value)
    formData.append('problemId', props.problemId.toString())
    if (form.description) {
      formData.append('description', form.description)
    }

    await apiService.uploadFile(formData)
    await loadFiles()
    resetForm()
  } catch (error) {
    console.error('Failed to upload file:', error)
  } finally {
    loading.value = false
  }
}

const downloadFile = async (file: File) => {
  try {
    const blob = await apiService.downloadFile(file.id)
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = file.originalName
    link.click()
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Failed to download file:', error)
  }
}

const deleteFile = async (file: File) => {
  if (!confirm(t('files.confirmDelete'))) return

  try {
    await apiService.deleteFile(file.id)
    await loadFiles()
  } catch (error) {
    console.error('Failed to delete file:', error)
  }
}

const loadFiles = async () => {
  try {
    const response = await apiService.getProblemFiles(props.problemId)
    files.value = response.files
  } catch (error) {
    console.error('Failed to load files:', error)
  }
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const resetForm = () => {
  selectedFile.value = null
  form.description = ''
}

onMounted(() => {
  loadFiles()
})
</script>
