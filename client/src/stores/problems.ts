import { defineStore } from 'pinia'
import { ref } from 'vue'
import { apiService } from '@/services/api.ts'
import type { Problem, ProblemFilters } from '@/types'

export const useProblemsStore = defineStore('problems', () => {
  const problems = ref<Problem[]>([])
  const currentProblem = ref<Problem | null>(null)
  const loading = ref(false)
  const filters = ref<ProblemFilters>({
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  })

  const fetchProblems = async (newFilters?: ProblemFilters) => {
    if (newFilters) {
      filters.value = { ...filters.value, ...newFilters }
    }

    loading.value = true
    try {
      const response = await apiService.getProblems(filters.value)
      problems.value = response.problems
    } catch (error) {
      console.error('Failed to fetch problems:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const fetchProblem = async (id: number) => {
    loading.value = true
    try {
      currentProblem.value = await apiService.getProblem(id)
    } catch (error) {
      console.error('Failed to fetch problem:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const clearCurrentProblem = () => {
    currentProblem.value = null
  }

  return {
    problems,
    currentProblem,
    loading,
    filters,
    fetchProblems,
    fetchProblem,
    clearCurrentProblem,
  }
})
