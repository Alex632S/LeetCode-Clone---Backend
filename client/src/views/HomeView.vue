<template>
  <div class="home-view">
    <div class="grid">
      <div class="col-12">
        <Card>
          <template #title>
            <div class="flex align-items-center gap-2">
              <i class="pi pi-list"></i>
              <span>{{ t('problems.title') }}</span>
            </div>
          </template>
          <template #subtitle>
            {{ t('problems.subtitle', { app: t('common.appName') }) }}
          </template>
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
import ProblemList from '@/components/problems/ProblemList.vue'
import { useI18n } from '@/composables/useI18n'
import Card from 'primevue/card'

const problemsStore = useProblemsStore()
const { t } = useI18n()

onMounted(() => {
  problemsStore.fetchProblems()
})
</script>