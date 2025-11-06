<template>
  <div class="problem-view">
    <div
      v-if="loading"
      class="flex justify-content-center align-items-center p-4"
      style="min-height: 400px"
    >
      <ProgressSpinner />
      <span class="ml-3">{{ t('common.loading') }}</span>
    </div>

    <div v-else-if="problem" class="grid">
      <!-- Problem Description -->
      <div class="col-12 lg:col-6">
        <Card class="problem-description-card">
          <template #title>
            <div class="flex align-items-center gap-2 flex-wrap">
              <span class="text-2xl font-bold">{{ problem.title }}</span>
              <Tag
                :value="t(`problems.${problem.difficulty}`)"
                :severity="getDifficultySeverity(problem.difficulty)"
                class="capitalize font-semibold"
              />
              <div class="flex align-items-center gap-1 ml-auto">
                <i class="pi pi-star-fill text-yellow-500"></i>
                <span class="font-semibold">{{
                  problem.averageRating?.toFixed(1) || t('problems.noRatings')
                }}</span>
                <span class="text-color-secondary text-sm">({{ problem.ratingCount || 0 }})</span>
              </div>
            </div>
          </template>
          <template #subtitle>
            <div class="flex align-items-center gap-3 mt-2 flex-wrap">
              <div class="flex align-items-center gap-1">
                <i class="pi pi-calendar text-color-secondary"></i>
                <span class="text-color-secondary text-sm">
                  {{ t('problems.created') }}: {{ formatDate(problem.createdAt) }}
                </span>
              </div>
              <div
                class="flex align-items-center gap-1"
                v-if="problem.updatedAt !== problem.createdAt"
              >
                <i class="pi pi-refresh text-color-secondary"></i>
                <span class="text-color-secondary text-sm">
                  {{ t('problems.updated') }}: {{ formatDate(problem.updatedAt) }}
                </span>
              </div>
            </div>
          </template>
          <template #content>
            <!-- Problem Description -->
            <div class="problem-content">
              <div class="description-section mb-6">
                <h3 class="text-xl font-semibold mb-3">{{ t('problems.description') }}</h3>
                <div v-html="formattedDescription" class="description-text"></div>
              </div>

              <!-- Examples -->
              <div
                v-if="problem.examples && problem.examples.length > 0"
                class="examples-section mb-6"
              >
                <h3 class="text-xl font-semibold mb-3">{{ t('problems.examples') }}</h3>
                <div
                  v-for="(example, index) in problem.examples"
                  :key="index"
                  class="example-section mb-4"
                >
                  <h4 class="font-medium mb-2">{{ t('problems.example') }} {{ index + 1 }}</h4>
                  <Card class="example-card surface-50">
                    <template #content>
                      <div class="grid">
                        <div class="col-12 md:col-6">
                          <strong class="block mb-2">{{ t('problems.input') }}:</strong>
                          <pre class="example-code">{{ example.input }}</pre>
                        </div>
                        <div class="col-12 md:col-6">
                          <strong class="block mb-2">{{ t('problems.output') }}:</strong>
                          <pre class="example-code">{{ example.output }}</pre>
                        </div>
                        <div v-if="example.explanation" class="col-12 mt-3">
                          <strong class="block mb-2">{{ t('problems.explanation') }}:</strong>
                          <p class="mt-2 text-color-secondary">{{ example.explanation }}</p>
                        </div>
                      </div>
                    </template>
                  </Card>
                </div>
              </div>

              <!-- Tags -->
              <div v-if="problem.tags && problem.tags.length > 0" class="tags-section mt-6">
                <h3 class="text-xl font-semibold mb-3">{{ t('problems.tags') }}</h3>
                <div class="flex flex-wrap gap-2">
                  <Chip
                    v-for="tag in problem.tags"
                    :key="tag"
                    :label="tag"
                    class="capitalize font-medium"
                  />
                </div>
              </div>
            </div>
          </template>
        </Card>

        <!-- Comments Section -->
        <CommentsSection :problem-id="problemId" class="mt-4" />
      </div>

      <!-- Code Editor & Sidebar -->
      <div class="col-12 lg:col-6">
        <!-- Edit Button for Admins and Interviewers -->
        <Card v-if="canEditProblem" class="mb-4">
          <template #content>
            <Button
              :label="t('problems.editProblem')"
              icon="pi pi-pencil"
              severity="secondary"
              @click="$router.push(`/problems/edit/${problemId}`)"
              class="w-full"
            />
          </template>
        </Card>

        <!-- User Rating -->
        <Card v-if="authStore.isAuthenticated" class="mb-4">
          <template #title>
            <div class="flex align-items-center gap-2">
              <i class="pi pi-star"></i>
              <span>{{ t('problems.rateProblem') }}</span>
            </div>
          </template>
          <template #content>
            <div class="flex align-items-center gap-3">
              <Rating
                v-model="userRating"
                :cancel="false"
                @update:modelValue="handleRateProblem"
                class="flex-1"
              />
              <span class="text-color-secondary text-sm min-w-max">
                {{
                  userRating
                    ? t('problems.youRated', { rating: userRating })
                    : t('problems.ratePrompt')
                }}
              </span>
            </div>
          </template>
        </Card>

        <!-- Code Editor -->
        <Card class="mb-4">
          <template #title>
            <div class="flex align-items-center gap-2">
              <i class="pi pi-code"></i>
              <span>{{ t('codeEditor.title') }}</span>
            </div>
          </template>
          <template #content>
            <div class="code-editor-placeholder">
              <div
                class="flex flex-column align-items-center justify-content-center p-6 text-center"
              >
                <i class="pi pi-code text-5xl text-color-secondary mb-3"></i>
                <h3 class="text-xl font-semibold mb-2">{{ t('codeEditor.comingSoon') }}</h3>
                <p class="text-color-secondary mb-4">{{ t('codeEditor.editorDescription') }}</p>
                <div class="flex gap-2">
                  <Button
                    :label="t('codeEditor.runCode')"
                    icon="pi pi-play"
                    severity="secondary"
                    @click="handleRunCode"
                  />
                  <Button
                    :label="t('codeEditor.submit')"
                    icon="pi pi-check"
                    @click="handleSubmit"
                  />
                </div>
              </div>
            </div>
          </template>
        </Card>

        <Card class="mb-4">
          <template #title>
            <div class="flex align-items-center gap-2">
              <i class="pi pi-chart-bar"></i>
              <span>{{ t('problems.statistics') }}</span>
            </div>
          </template>
          <template #content>
            <div class="grid text-center">
              <div class="col-4">
                <div class="text-2xl font-bold text-primary">{{ problem.ratingCount || 0 }}</div>
                <div class="text-color-secondary text-sm">{{ t('problems.ratings') }}</div>
              </div>
              <div class="col-4">
                <div class="text-2xl font-bold text-green-500">85%</div>
                <div class="text-color-secondary text-sm">{{ t('problems.acceptance') }}</div>
              </div>
              <div class="col-4">
                <div class="text-2xl font-bold text-blue-500">1.2k</div>
                <div class="text-color-secondary text-sm">{{ t('problems.submissions') }}</div>
              </div>
            </div>
          </template>
        </Card>

        <Card v-if="authStore.isAuthenticated">
          <template #title>
            <div class="flex align-items-center gap-2">
              <i class="pi pi-cloud-upload"></i>
              <span>{{ t('files.title') }}</span>
            </div>
          </template>
          <template #content>
            <div class="file-upload-placeholder">
              <div
                class="flex flex-column align-items-center justify-content-center p-4 text-center"
              >
                <i class="pi pi-cloud-upload text-4xl text-color-secondary mb-2"></i>
                <p class="text-color-secondary">{{ t('files.uploadPlaceholder') }}</p>
              </div>
            </div>
          </template>
        </Card>
      </div>
    </div>

    <div
      v-else
      class="flex justify-content-center align-items-center p-4"
      style="min-height: 400px"
    >
      <Message severity="error" :closable="false" class="max-w-md text-center">
        <div class="flex flex-column align-items-center gap-3">
          <i class="pi pi-exclamation-circle text-5xl text-red-500"></i>
          <h3 class="text-xl font-semibold">{{ t('problems.notFound') }}</h3>
          <p class="text-color-secondary">{{ t('problems.notFoundDescription') }}</p>
          <Button
            :label="t('navigation.problems')"
            icon="pi pi-arrow-left"
            @click="$router.push('/')"
          />
        </div>
      </Message>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProblemsStore } from '@/stores/problems'
import { useAuthStore } from '@/stores/auth'
import { apiService } from '@/services/api'
import { useI18n } from '@/composables/useI18n'
import { useToast } from 'primevue/usetoast'
import type { Problem, Rating } from '@/types'

import CommentsSection from '@/components/comments/CommentsSection.vue'

import Card from 'primevue/card'
import Tag from 'primevue/tag'
import Chip from 'primevue/chip'
import ProgressSpinner from 'primevue/progressspinner'
import Message from 'primevue/message'
import Button from 'primevue/button'

const route = useRoute()
const router = useRouter()
const problemsStore = useProblemsStore()
const authStore = useAuthStore()
const toast = useToast()
const { t } = useI18n()

const problemId = parseInt(route.params.id as string)
const problem = ref<Problem | null>(null)
const loading = ref(false)
const userRating = ref<number>(0)
const userRatingData = ref<Rating | null>(null)

const formattedDescription = computed(() => {
  if (!problem.value?.description) return ''
  return problem.value.description
    .replace(/\n/g, '<br>')
    .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre class="code-block"><code>$2</code></pre>')
    .replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>')
})

const canEditProblem = computed(() => {
  return authStore.user?.role === 'admin' || authStore.user?.role === 'interviewer'
})

const getDifficultySeverity = (difficulty: string) => {
  switch (difficulty) {
    case 'easy':
      return 'success'
    case 'medium':
      return 'warning'
    case 'hard':
      return 'danger'
    default:
      return 'info'
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const handleRateProblem = async (rating: number) => {
  if (!authStore.isAuthenticated) {
    toast.add({
      severity: 'warn',
      summary: t('common.warning'),
      detail: t('auth.loginRequired'),
      life: 3000,
    })
    router.push('/login')
    return
  }

  try {
    await apiService.rateProblem({
      problemId: problemId,
      value: rating,
    })

    toast.add({
      severity: 'success',
      summary: t('common.success'),
      detail: t('problems.ratingSubmitted'),
      life: 2000,
    })

    // Reload problem to get updated ratings
    loadProblem()
  } catch (error: any) {
    console.error('Failed to rate problem:', error)
    toast.add({
      severity: 'error',
      summary: t('common.error'),
      detail: error.message || t('problems.failedToRate'),
      life: 5000,
    })
  }
}

const handleRunCode = () => {
  toast.add({
    severity: 'info',
    summary: t('codeEditor.comingSoon'),
    detail: t('codeEditor.featureInDevelopment'),
    life: 3000,
  })
}

const handleSubmit = () => {
  toast.add({
    severity: 'info',
    summary: t('codeEditor.comingSoon'),
    detail: t('codeEditor.featureInDevelopment'),
    life: 3000,
  })
}

const loadProblem = async () => {
  loading.value = true
  try {
    problem.value = await apiService.getProblem(problemId)

    // Load user's rating if authenticated
    if (authStore.isAuthenticated) {
      try {
        const ratingResponse = await apiService.getUserRating(problemId)
        userRatingData.value = ratingResponse.userRating
        userRating.value = ratingResponse.userRating?.value || 0
      } catch (error) {
        console.error('Failed to load user rating:', error)
      }
    }
  } catch (error: any) {
    console.error('Failed to load problem:', error)
    problem.value = null

    if (error.message?.includes('404')) {
      toast.add({
        severity: 'error',
        summary: t('common.error'),
        detail: t('problems.notFound'),
        life: 5000,
      })
    }
  } finally {
    loading.value = false
  }
}

// Watch for authentication changes to load user rating
watch(
  () => authStore.isAuthenticated,
  (isAuthenticated) => {
    if (isAuthenticated && problem.value) {
      loadUserRating()
    }
  },
)

const loadUserRating = async () => {
  try {
    const ratingResponse = await apiService.getUserRating(problemId)
    userRatingData.value = ratingResponse.userRating
    userRating.value = ratingResponse.userRating?.value || 0
  } catch (error) {
    console.error('Failed to load user rating:', error)
  }
}

onMounted(() => {
  loadProblem()
})
</script>

<style scoped>
.problem-view {
  min-height: calc(100vh - 100px);
  padding: 1rem;
}

.problem-content {
  line-height: 1.7;
}

.description-text {
  line-height: 1.8;
}

.description-text h1,
.description-text h2,
.description-text h3,
.description-text h4 {
  margin: 1.5rem 0 0.75rem 0;
  color: var(--surface-900);
}

.description-text h1 {
  font-size: 1.5rem;
}

.description-text h2 {
  font-size: 1.25rem;
}

.description-text h3 {
  font-size: 1.1rem;
}

.description-text h4 {
  font-size: 1rem;
  color: var(--surface-700);
}

.description-text p {
  margin-bottom: 1rem;
}

.description-text ul,
.description-text ol {
  margin: 1rem 0;
  padding-left: 2rem;
}

.description-text li {
  margin-bottom: 0.5rem;
}

.example-code {
  background: var(--surface-800);
  color: var(--surface-100);
  padding: 1rem;
  border-radius: 6px;
  overflow-x: auto;
  margin: 0.5rem 0;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.9rem;
  white-space: pre-wrap;
  border: 1px solid var(--surface-600);
}

.example-card {
  background: var(--surface-50);
  border-left: 4px solid var(--primary-color);
}

.example-section {
  border-radius: 8px;
}

.capitalize {
  text-transform: capitalize;
}

.code-editor-placeholder,
.file-upload-placeholder {
  background: var(--surface-50);
  border-radius: 6px;
  border: 2px dashed var(--surface-300);
}

:deep(.p-rating .p-rating-icon) {
  color: #ffb400;
}

:deep(.code-block) {
  background: var(--surface-800);
  color: var(--surface-100);
  padding: 1rem;
  border-radius: 6px;
  overflow-x: auto;
  margin: 1rem 0;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.9rem;
  border: 1px solid var(--surface-600);
}

:deep(.inline-code) {
  background: var(--surface-200);
  color: var(--surface-800);
  padding: 0.2rem 0.4rem;
  border-radius: 3px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.9rem;
  border: 1px solid var(--surface-300);
}
</style>
