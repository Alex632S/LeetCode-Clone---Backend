<template>
  <div class="home-view">
    <div class="grid">
      <div class="col-12">
        <Card>
          <template #title>
            <div class="flex align-items-center gap-2">
              <i class="pi pi-list"></i>
              <span>Problems</span>
              <Tag value="Beta" severity="info" class="ml-2" />
            </div>
          </template>
          <template #subtitle> Practice coding problems and improve your skills </template>
          <template #content>
            <ProblemList />
          </template>
        </Card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useProblemsStore } from '@/stores/problems'
import ProblemList from '../components/problems/ProblemList.vue'
import Card from 'primevue/card'
import Tag from 'primevue/tag'

const problemsStore = useProblemsStore()

onMounted(() => {
  problemsStore.fetchProblems()
})
</script>
