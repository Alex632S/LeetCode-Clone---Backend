<template>
  <div class="create-problem-view">
    <div class="grid">
      <div class="col-12">
        <Card>
          <template #title>
            <div class="flex align-items-center gap-2">
              <i class="pi" :class="editMode ? 'pi-pencil' : 'pi-plus'"></i>
              <span>{{ editMode ? t('problems.editProblem') : t('problems.createProblem') }}</span>
            </div>
          </template>
          <template #content>
            <form @submit.prevent="submitProblem" class="flex flex-column gap-4">
              <!-- Basic Information -->
              <div class="grid">
                <div class="col-12 md:col-8">
                  <div class="field">
                    <label class="font-bold block mb-2">{{ t('problems.title') }} *</label>
                    <InputText
                      v-model="problemForm.title"
                      class="w-full"
                      :class="{ 'p-invalid': errors.title }"
                      :placeholder="t('problems.titlePlaceholder')"
                    />
                    <small v-if="errors.title" class="p-error">{{ errors.title }}</small>
                  </div>
                </div>

                <div class="col-12 md:col-4">
                  <div class="field">
                    <label class="font-bold block mb-2">{{ t('problems.difficulty') }} *</label>
                    <Dropdown
                      v-model="problemForm.difficulty"
                      :options="difficultyOptions"
                      optionLabel="label"
                      optionValue="value"
                      class="w-full"
                      :class="{ 'p-invalid': errors.difficulty }"
                    />
                    <small v-if="errors.difficulty" class="p-error">{{ errors.difficulty }}</small>
                  </div>
                </div>
              </div>

              <!-- Description -->
              <div class="field">
                <label class="font-bold block mb-2">{{ t('problems.description') }} *</label>
                <Textarea
                  v-model="problemForm.description"
                  rows="10"
                  class="w-full"
                  :class="{ 'p-invalid': errors.description }"
                  :placeholder="t('problems.descriptionPlaceholder')"
                  autoResize
                />
                <small v-if="errors.description" class="p-error">{{ errors.description }}</small>
                <small class="text-color-secondary">{{ t('problems.markdownSupported') }}</small>
              </div>

              <!-- Examples -->
              <div class="field">
                <div class="flex justify-content-between align-items-center mb-3">
                  <label class="font-bold block">{{ t('problems.examples') }}</label>
                  <Button
                    :label="t('problems.addExample')"
                    icon="pi pi-plus"
                    size="small"
                    @click="addExample"
                  />
                </div>

                <Card v-for="(example, index) in problemForm.examples" :key="index" class="mb-3">
                  <template #title>
                    <div class="flex justify-content-between align-items-center">
                      <span>{{ t('problems.example') }} {{ index + 1 }}</span>
                      <Button
                        icon="pi pi-trash"
                        text
                        rounded
                        severity="danger"
                        @click="removeExample(index)"
                      />
                    </div>
                  </template>
                  <template #content>
                    <div class="grid">
                      <div class="col-12 md:col-6">
                        <label class="font-medium block mb-2">{{ t('problems.input') }} *</label>
                        <InputText
                          :value="example.input"
                          @input="(value: any) => updateExampleField(index, 'input', value)"
                          class="w-full"
                          :placeholder="t('problems.inputPlaceholder')"
                          :class="{ 'p-invalid': !example.input.trim() }"
                        />
                        <small v-if="!example.input.trim()" class="p-error">{{
                          t('validation.required', { field: t('problems.input') })
                        }}</small>
                      </div>
                      <div class="col-12 md:col-6">
                        <label class="font-medium block mb-2">{{ t('problems.output') }} *</label>
                        <InputText
                          :value="example.output"
                          @input="(value: any) => updateExampleField(index, 'output', value)"
                          class="w-full"
                          :placeholder="t('problems.outputPlaceholder')"
                          :class="{ 'p-invalid': !example.output.trim() }"
                        />
                        <small v-if="!example.output.trim()" class="p-error">{{
                          t('validation.required', { field: t('problems.output') })
                        }}</small>
                      </div>
                      <div class="col-12">
                        <label class="font-medium block mb-2">{{
                          t('problems.explanation')
                        }}</label>
                        <InputText
                          :value="example.explanation"
                          @input="(value: any) => updateExampleField(index, 'explanation', value)"
                          class="w-full"
                          :placeholder="t('problems.explanationPlaceholder')"
                        />
                      </div>
                    </div>
                  </template>
                </Card>
              </div>

              <!-- Tags -->
              <div class="field">
                <label class="font-bold block mb-2">{{ t('problems.tags') }}</label>
                <MultiSelect
                  v-model="problemForm.tags"
                  :options="availableTags"
                  :placeholder="t('problems.tagsPlaceholder')"
                  display="chip"
                  class="w-full"
                  :filter="true"
                />
              </div>

              <!-- Actions -->
              <div class="flex gap-2 justify-content-end">
                <Button
                  :label="t('common.cancel')"
                  icon="pi pi-times"
                  severity="secondary"
                  @click="$router.back()"
                />
                <Button
                  :label="editMode ? t('common.update') : t('common.create')"
                  icon="pi pi-check"
                  :loading="loading"
                  type="submit"
                />
              </div>
            </form>
          </template>
        </Card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { apiService } from '@/services/api'
import { useI18n } from '@/composables/useI18n'
import { useToast } from 'primevue/usetoast'
import type { ProblemCreate, Tag } from '@/types'

// PrimeVue components
import Card from 'primevue/card'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Dropdown from 'primevue/dropdown'
import MultiSelect from 'primevue/multiselect'
import Button from 'primevue/button'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()
const { t } = useI18n()

const loading = ref(false)
const availableTags = ref<string[]>([])
const editMode = ref(false)
const problemId = ref<number | null>(null)

// Тип для примера
interface Example {
  input: string
  output: string
  explanation?: string
}

const problemForm = reactive({
  title: '',
  description: '',
  difficulty: 'medium' as 'easy' | 'medium' | 'hard',
  examples: [] as Example[],
  tags: [] as string[],
})

const errors = reactive({
  title: '',
  description: '',
  difficulty: '',
})

const difficultyOptions = [
  { label: t('problems.easy'), value: 'easy' },
  { label: t('problems.medium'), value: 'medium' },
  { label: t('problems.hard'), value: 'hard' },
]

const canCreateProblem = computed(() => {
  return authStore.user?.role === 'admin' || authStore.user?.role === 'interviewer'
})

const addExample = () => {
  problemForm.examples.push({
    input: '',
    output: '',
    explanation: '',
  })
}

const removeExample = (index: number) => {
  if (problemForm.examples[index]) {
    problemForm.examples.splice(index, 1)
  }
}

// Метод для обновления полей примера
const updateExampleField = (index: number, field: keyof Example, value: string) => {
  if (problemForm.examples[index]) {
    problemForm.examples[index][field] = value
  }
}

const loadTags = async () => {
  try {
    const response = await apiService.getTags()
    availableTags.value = response.tags.map((tag: Tag) => tag.name)
  } catch (error) {
    console.error('Failed to load tags:', error)
  }
}

const loadProblem = async (id: number) => {
  if (!canCreateProblem.value) {
    toast.add({
      severity: 'error',
      summary: t('common.error'),
      detail: t('problems.unauthorized'),
      life: 5000,
    })
    router.push('/')
    return
  }

  loading.value = true
  try {
    const problem = await apiService.getProblem(id)

    problemForm.title = problem.title
    problemForm.description = problem.description
    problemForm.difficulty = problem.difficulty
    problemForm.examples = problem.examples || []
    problemForm.tags = problem.tags || []
  } catch (error) {
    console.error('Failed to load problem:', error)
    toast.add({
      severity: 'error',
      summary: t('common.error'),
      detail: t('problems.failedToLoad'),
      life: 5000,
    })
  } finally {
    loading.value = false
  }
}

const validateForm = (): boolean => {
  let isValid = true

  // Reset errors
  errors.title = ''
  errors.description = ''
  errors.difficulty = ''

  if (!problemForm.title.trim()) {
    errors.title = t('validation.required', { field: t('problems.title') })
    isValid = false
  }

  if (!problemForm.description.trim()) {
    errors.description = t('validation.required', { field: t('problems.description') })
    isValid = false
  }

  if (!problemForm.difficulty) {
    errors.difficulty = t('validation.required', { field: t('problems.difficulty') })
    isValid = false
  }

  // Validate examples - используем безопасный доступ
  for (let i = 0; i < problemForm.examples.length; i++) {
    const example = problemForm.examples[i]
    // Проверяем что пример существует и имеет обязательные поля
    if (example && (!example.input.trim() || !example.output.trim())) {
      toast.add({
        severity: 'error',
        summary: t('common.error'),
        detail: t('problems.exampleValidation'),
        life: 5000,
      })
      isValid = false
      break
    }
  }

  return isValid
}

const submitProblem = async () => {
  if (!validateForm()) return

  if (!canCreateProblem.value) {
    toast.add({
      severity: 'error',
      summary: t('common.error'),
      detail: t('problems.unauthorized'),
      life: 5000,
    })
    return
  }

  loading.value = true
  try {
    // Фильтруем примеры перед отправкой (убираем пустые)
    const examplesToSubmit = problemForm.examples.filter(
      (example) => example && example.input.trim() && example.output.trim(),
    )

    const submissionData = {
      ...problemForm,
      examples: examplesToSubmit,
    }

    if (editMode.value && problemId.value) {
      await apiService.updateProblem(problemId.value, submissionData)
      toast.add({
        severity: 'success',
        summary: t('common.success'),
        detail: t('problems.updatedSuccess'),
        life: 3000,
      })
    } else {
      await apiService.createProblem(submissionData)
      toast.add({
        severity: 'success',
        summary: t('common.success'),
        detail: t('problems.createdSuccess'),
        life: 3000,
      })
    }

    router.push('/')
  } catch (error: any) {
    console.error('Failed to save problem:', error)
    toast.add({
      severity: 'error',
      summary: t('common.error'),
      detail: error.message || t('problems.failedToSave'),
      life: 5000,
    })
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await loadTags()

  // Check if we're in edit mode
  if (route.params.id) {
    const id = parseInt(route.params.id as string)
    if (!isNaN(id)) {
      editMode.value = true
      problemId.value = id
      await loadProblem(id)
    }
  }

  // Add one empty example by default
  if (problemForm.examples.length === 0) {
    addExample()
  }
})
</script>
