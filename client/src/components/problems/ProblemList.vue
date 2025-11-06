<template>
  <div class="problem-list">
    <div class="filters-section mb-4">
      <div class="grid p-fluid">
        <div class="col-12 md:col-4">
          <InputText 
            v-model="localFilters.search" 
            placeholder="Search problems..." 
            class="w-full"
          />
        </div>
        <div class="col-12 md:col-2">
          <Dropdown 
            v-model="localFilters.difficulty" 
            :options="difficultyOptions" 
            optionLabel="label"
            optionValue="value"
            placeholder="Difficulty"
            showClear
            class="w-full"
          />
        </div>
        <div class="col-12 md:col-3">
          <MultiSelect 
            v-model="localFilters.tags" 
            :options="availableTags" 
            placeholder="Tags"
            display="chip"
            class="w-full"
          />
        </div>
        <div class="col-12 md:col-3">
          <div class="flex gap-2">
            <Button 
              label="Search" 
              icon="pi pi-search" 
              @click="applyFilters"
              class="flex-1"
            />
            <Button 
              label="Clear" 
              severity="secondary" 
              @click="clearFilters"
              icon="pi pi-refresh"
            />
          </div>
        </div>
      </div>
    </div>

    <div class="problems-table">
      <DataTable 
        :value="problems" 
        :loading="loading"
        @row-click="onProblemSelect"
        class="cursor-pointer"
        responsiveLayout="scroll"
      >
        <Column field="title" header="Title" style="min-width: 200px">
          <template #body="{ data }">
            <div class="flex align-items-center gap-2">
              <span class="font-medium">{{ data.title }}</span>
              <Tag 
                :value="data.difficulty" 
                :severity="getDifficultySeverity(data.difficulty)"
              />
            </div>
          </template>
        </Column>
        <Column field="tags" header="Tags" style="min-width: 150px">
          <template #body="{ data }">
            <div class="flex flex-wrap gap-1">
              <Chip 
                v-for="tag in data.tags?.slice(0, 2)" 
                :key="tag" 
                :label="tag"
                class="text-xs"
              />
              <span v-if="data.tags?.length > 2" class="text-xs text-color-secondary">
                +{{ data.tags.length - 2 }}
              </span>
            </div>
          </template>
        </Column>
        <Column field="averageRating" header="Rating" style="min-width: 120px">
          <template #body="{ data }">
            <div class="flex align-items-center gap-1">
              <Rating :modelValue="data.averageRating || 0" readonly :cancel="false" />
              <span class="text-sm text-color-secondary">
                ({{ data.ratingCount || 0 }})
              </span>
            </div>
          </template>
        </Column>
        <Column header="Actions" style="width: 120px">
          <template #body="{ data }">
            <Button 
              icon="pi pi-play" 
              label="Solve" 
              size="small"
              @click.stop="$router.push(`/problem/${data.id}`)"
            />
          </template>
        </Column>
        <template #empty>
          <div class="text-center p-4">
            <i class="pi pi-search text-4xl text-color-secondary mb-2"></i>
            <p class="text-color-secondary">No problems found</p>
          </div>
        </template>
      </DataTable>
    </div>

    <div class="mt-3 flex justify-content-between align-items-center">
      <Button 
        label="Previous" 
        icon="pi pi-chevron-left" 
        :disabled="!hasPrev"
        @click="loadPage(currentPage - 1)"
        severity="secondary"
      />
      <span class="text-color-secondary">Page {{ currentPage }} of {{ totalPages }}</span>
      <Button 
        label="Next" 
        icon="pi pi-chevron-right" 
        iconPos="right"
        :disabled="!hasNext"
        @click="loadPage(currentPage + 1)"
        severity="secondary"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useProblemsStore } from '@/stores/problems'
import type { ProblemFilters } from '@/types'

// PrimeVue components
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Dropdown from 'primevue/dropdown'
import MultiSelect from 'primevue/multiselect'
import Tag from 'primevue/tag'
import Chip from 'primevue/chip'
import Rating from 'primevue/rating'

const router = useRouter()
const problemsStore = useProblemsStore()

const availableTags = ref(['array', 'hash-table', 'dynamic-programming', 'string', 'math', 'tree', 'graph'])
const filterTimeout = ref<number>() // ← Корректный тип для браузера

const totalPages = ref(1)
const currentPage = ref(1)
const hasNext = ref(false)
const hasPrev = ref(false)

// Автоматическая очистка таймера
onUnmounted(() => {
  if (filterTimeout.value) {
    clearTimeout(filterTimeout.value)
  }
})

const localFilters = reactive<ProblemFilters>({
  page: 1,
  limit: 10,
  sortBy: 'createdAt',
  sortOrder: 'desc'
})

const difficultyOptions = ref([
  { label: 'Easy', value: 'easy' },
  { label: 'Medium', value: 'medium' }, 
  { label: 'Hard', value: 'hard' }
])

const problems = computed(() => problemsStore.problems)
const loading = computed(() => problemsStore.loading)

const getDifficultySeverity = (difficulty: string) => {
  switch (difficulty) {
    case 'easy': return 'success'
    case 'medium': return 'warning'
    case 'hard': return 'danger'
    default: return 'info'
  }
}

const applyFilters = () => {
  problemsStore.fetchProblems(localFilters)
}

const clearFilters = () => {
  Object.assign(localFilters, {
    search: undefined,
    difficulty: undefined,
    tags: undefined,
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  })
  applyFilters()
}

const loadPage = (page: number) => {
  localFilters.page = page
  applyFilters()
}

const onProblemSelect = (event: any) => {
  router.push(`/problem/${event.data.id}`)
}

// Debounced watch для фильтров
watch(
  () => [localFilters.search, localFilters.difficulty, localFilters.tags],
  () => {
    if (filterTimeout.value) {
      clearTimeout(filterTimeout.value)
    }
    
    filterTimeout.value = window.setTimeout(() => { // ← Используем window.setTimeout
      localFilters.page = 1
      applyFilters()
    }, 500)
  },
  { deep: true }
)

// Initial load
applyFilters()
</script>

<style scoped>
.problem-list {
  min-height: 400px;
}

:deep(.p-datatable) {
  font-size: 0.9rem;
}

:deep(.p-datatable-tbody > tr) {
  cursor: pointer;
  transition: background-color 0.2s;
}

:deep(.p-datatable-tbody > tr:hover) {
  background-color: var(--surface-50) !important;
}
</style>