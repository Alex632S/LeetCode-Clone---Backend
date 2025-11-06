<template>
  <Card>
    <template #title>Discussion</template>
    <template #content>
      <div v-if="authStore.isAuthenticated" class="mb-4">
        <Textarea v-model="newComment" rows="3" placeholder="Add a comment..." class="w-full" />
        <Button
          label="Post Comment"
          class="mt-2"
          @click="postComment"
          :disabled="!newComment.trim()"
        />
      </div>

      <div v-else class="mb-4 p-3 border-round bg-gray-100 text-center">
        <p>Please log in to join the discussion</p>
        <Button label="Login" @click="$router.push('/login')" class="mt-2" />
      </div>

      <div v-if="loading" class="flex justify-content-center p-4">
        <ProgressSpinner />
      </div>

      <div v-else>
        <div v-for="comment in comments" :key="comment.id" class="comment mb-3">
          <CommentItem :comment="comment" />
        </div>

        <div v-if="comments.length === 0" class="text-center p-4 text-color-secondary">
          <i class="pi pi-comments text-4xl mb-2"></i>
          <p>No comments yet. Be the first to comment!</p>
        </div>
      </div>
    </template>
  </Card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { apiService } from '@/services/api'
import type { Comment } from '@/types'
import CommentItem from '@/components/comments/CommentItem.vue'

import Card from 'primevue/card'
import Textarea from 'primevue/textarea'
import Button from 'primevue/button'
import ProgressSpinner from 'primevue/progressspinner'

const props = defineProps<{
  problemId: number
}>()

const authStore = useAuthStore()
const comments = ref<Comment[]>([])
const newComment = ref('')
const loading = ref(false)

const loadComments = async () => {
  loading.value = true
  try {
    const response = await apiService.getProblemComments(props.problemId)
    comments.value = response.comments
  } catch (error) {
    console.error('Failed to load comments:', error)
  } finally {
    loading.value = false
  }
}

const postComment = async () => {
  if (!newComment.value.trim()) return

  try {
    await apiService.createComment({
      content: newComment.value,
      problemId: props.problemId,
    })
    newComment.value = ''
    await loadComments()
  } catch (error) {
    console.error('Failed to post comment:', error)
  }
}

onMounted(() => {
  loadComments()
})
</script>
