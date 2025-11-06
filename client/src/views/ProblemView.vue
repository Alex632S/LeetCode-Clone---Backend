<template>
  <div class="problem-view">
    <div v-if="loading" class="flex justify-content-center p-4">
      <ProgressSpinner />
    </div>

    <div v-else-if="problem" class="grid">
      <!-- Problem Description -->
      <div class="col-12 lg:col-6">
        <Card class="problem-description-card">
          <template #title>
            <div class="flex align-items-center gap-2">
              <span>{{ problem.title }}</span>
              <Tag
                :value="problem.difficulty"
                :severity="getDifficultySeverity(problem.difficulty)"
                class="capitalize"
              />
            </div>
          </template>
          <template #subtitle>
            <div class="flex align-items-center gap-3 mt-2">
              <div class="flex align-items-center gap-1">
                <i class="pi pi-star-fill text-yellow-500"></i>
                <span>{{ problem.averageRating?.toFixed(1) || 'No ratings' }}</span>
                <span class="text-color-secondary text-sm">({{ problem.ratingCount || 0 }})</span>
              </div>
              <div class="flex align-items-center gap-1">
                <i class="pi pi-calendar"></i>
                <span class="text-color-secondary text-sm">
                  {{ formatDate(problem.createdAt) }}
                </span>
              </div>
            </div>
          </template>
          <template #content>
            <!-- Problem Description -->
            <div class="problem-content">
              <div v-html="formattedDescription" class="mb-4"></div>

              <!-- Examples -->
              <div
                v-for="(example, index) in problem.examples"
                :key="index"
                class="example-section mb-4"
              >
                <h4>Example {{ index + 1 }}</h4>
                <Card class="example-card">
                  <template #content>
                    <div class="grid">
                      <div class="col-12 md:col-6">
                        <strong>Input:</strong>
                        <pre class="example-code">{{ example.input }}</pre>
                      </div>
                      <div class="col-12 md:col-6">
                        <strong>Output:</strong>
                        <pre class="example-code">{{ example.output }}</pre>
                      </div>
                      <div v-if="example.explanation" class="col-12">
                        <strong>Explanation:</strong>
                        <p class="mt-2">{{ example.explanation }}</p>
                      </div>
                    </div>
                  </template>
                </Card>
              </div>

              <!-- Tags -->
              <div class="tags-section mt-4">
                <h4>Tags</h4>
                <div class="flex flex-wrap gap-2 mt-2">
                  <Chip v-for="tag in problem.tags" :key="tag" :label="tag" class="capitalize" />
                </div>
              </div>
            </div>
          </template>
        </Card>

        <!-- Comments Section -->
        <CommentsSection :problem-id="problemId" class="mt-4" />
      </div>

      <!-- Code Editor & Rating -->
      <div class="col-12 lg:col-6">
        <!-- User Rating -->
        <Card v-if="authStore.isAuthenticated" class="mb-4">
          <template #title>Rate this problem</template>
          <template #content>
            <div class="flex align-items-center gap-3">
              <Rating v-model="userRating" :cancel="false" @update:modelValue="handleRateProblem" />
              <span class="text-color-secondary text-sm">
                {{ userRating ? `You rated ${userRating} stars` : 'Rate this problem' }}
              </span>
            </div>
          </template>
        </Card>

        <!-- Code Editor -->
        <Card>
          <template #title>
            <div class="flex align-items-center gap-2">
              <i class="pi pi-code"></i>
              <span>Code Editor</span>
            </div>
          </template>
          <template #content>
            <CodeEditor :problem-id="problemId" @code-submit="handleCodeSubmit" />
          </template>
        </Card>

        <!-- Problem Stats -->
        <Card class="mt-4">
          <template #title>Problem Statistics</template>
          <template #content>
            <div class="grid text-center">
              <div class="col-4">
                <div class="text-2xl font-bold text-primary">{{ problem.ratingCount || 0 }}</div>
                <div class="text-color-secondary text-sm">Ratings</div>
              </div>
              <div class="col-4">
                <div class="text-2xl font-bold text-primary">85%</div>
                <div class="text-color-secondary text-sm">Acceptance</div>
              </div>
              <div class="col-4">
                <div class="text-2xl font-bold text-primary">1.2k</div>
                <div class="text-color-secondary text-sm">Submissions</div>
              </div>
            </div>
          </template>
        </Card>
      </div>
    </div>

    <!-- Error State -->
    <div v-else class="flex justify-content-center p-4">
      <Message severity="error" :closable="false"> Problem not found or failed to load. </Message>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProblemsStore } from '@/stores/problems'
import { useAuthStore } from '@/stores/auth'
import { apiService } from '@/services/api'
import type { Problem, Rating } from '@/types'

// Components
import CommentsSection from '../components/comments/CommentsSection.vue'
import CodeEditor from '@/components/problems/CodeEditor.vue'

// PrimeVue components
import Card from 'primevue/card'
import Tag from 'primevue/tag'
import Chip from 'primevue/chip'
import ProgressSpinner from 'primevue/progressspinner'
import Message from 'primevue/message'

const route = useRoute()
const router = useRouter()
const problemsStore = useProblemsStore()
const authStore = useAuthStore()

const problemId = parseInt(route.params.id as string)
const problem = ref<Problem | null>(null)
const loading = ref(false)
const userRating = ref<number>(0)
const userRatingData = ref<Rating | null>(null)

const formattedDescription = computed(() => {
  if (!problem.value?.description) return ''
  return problem.value.description
    .replace(/\n/g, '<br>')
    .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
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
    router.push('/login')
    return
  }

  try {
    await apiService.rateProblem({
      problemId: problemId,
      value: rating,
    })

    // Reload problem to get updated ratings
    loadProblem()
  } catch (error) {
    console.error('Failed to rate problem:', error)
  }
}

const handleCodeSubmit = (code: string) => {
  console.log('Code submitted for problem', problemId, ':', code)
  // Here you would typically send the code to your execution service
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
  } catch (error) {
    console.error('Failed to load problem:', error)
    problem.value = null
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
}

.problem-content {
  line-height: 1.7;
}

.problem-content h1,
.problem-content h2,
.problem-content h3,
.problem-content h4 {
  margin: 1.5rem 0 0.75rem 0;
  color: var(--surface-900);
}

.problem-content h1 {
  font-size: 1.5rem;
}

.problem-content h2 {
  font-size: 1.25rem;
}

.problem-content h3 {
  font-size: 1.1rem;
}

.problem-content h4 {
  font-size: 1rem;
  color: var(--surface-700);
}

.problem-content p {
  margin-bottom: 1rem;
}

.problem-content ul,
.problem-content ol {
  margin: 1rem 0;
  padding-left: 2rem;
}

.problem-content li {
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
}

.example-card {
  background: var(--surface-50);
}

.example-section {
  border-left: 4px solid var(--primary-color);
  padding-left: 1rem;
}

.capitalize {
  text-transform: capitalize;
}

:deep(.p-rating .p-rating-icon) {
  color: #ffb400;
}
</style>
