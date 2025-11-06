<template>
  <div class="comment-item border-1 surface-border border-round p-3">
    <div class="flex justify-content-between align-items-start mb-2">
      <div class="flex align-items-center gap-2">
        <Avatar :label="getUserInitial(comment.user)" shape="circle" size="normal" />
        <div>
          <div class="font-medium">{{ comment.user.username }}</div>
          <div class="text-color-secondary text-sm">
            {{ formatDate(comment.createdAt) }}
          </div>
        </div>
      </div>
      <div v-if="isCommentOwner" class="flex gap-1">
        <Button 
          icon="pi pi-pencil" 
          text 
          rounded 
          severity="secondary" 
          size="small"
          @click="startEditing"
        />
        <Button 
          icon="pi pi-trash" 
          text 
          rounded 
          severity="danger" 
          size="small"
          @click="deleteComment"
        />
      </div>
    </div>

    <div v-if="isEditing" class="editing-section">
      <Textarea 
        v-model="editContent" 
        rows="3" 
        class="w-full mb-2"
        autoResize
      />
      <div class="flex gap-2">
        <Button 
          label="Save" 
          size="small" 
          @click="saveEdit"
          :loading="loading"
        />
        <Button 
          label="Cancel" 
          severity="secondary" 
          size="small"
          @click="cancelEditing"
        />
      </div>
    </div>

    <div v-else class="comment-content">
      <p class="mb-2">{{ comment.content }}</p>
      
      <div class="flex gap-2">
        <Button 
          icon="pi pi-reply" 
          label="Reply" 
          text 
          size="small"
          @click="showReplyForm = !showReplyForm"
        />
        <Button 
          icon="pi pi-thumbs-up" 
          text 
          size="small"
          :severity="isLiked ? 'primary' : 'secondary'"
          @click="toggleLike"
        >
          <span class="ml-1">{{ likeCount }}</span>
        </Button>
      </div>

      <!-- Reply Form -->
      <div v-if="showReplyForm && authStore.isAuthenticated" class="reply-form mt-3 ml-3 pl-3 border-left-2 surface-border">
        <Textarea 
          v-model="replyContent" 
          rows="2" 
          placeholder="Write a reply..."
          class="w-full mb-2"
          autoResize
        />
        <div class="flex gap-2">
          <Button 
            label="Post Reply" 
            size="small" 
            @click="postReply"
            :disabled="!replyContent.trim()"
          />
          <Button 
            label="Cancel" 
            severity="secondary" 
            size="small"
            @click="cancelReply"
          />
        </div>
      </div>
    </div>

    <!-- Replies -->
    <div v-if="comment.replies && comment.replies.length > 0" class="replies-section mt-3 ml-3 pl-3 border-left-2 surface-border">
      <CommentItem 
        v-for="reply in comment.replies" 
        :key="reply.id" 
        :comment="reply"
        class="mb-2"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { apiService } from '@/services/api'
import type { Comment } from '@/types'

// PrimeVue components
import Avatar from 'primevue/avatar'
import Button from 'primevue/button'
import Textarea from 'primevue/textarea'

interface Props {
  comment: Comment
}

const props = defineProps<Props>()
const authStore = useAuthStore()

const isEditing = ref(false)
const editContent = ref('')
const showReplyForm = ref(false)
const replyContent = ref('')
const loading = ref(false)
const isLiked = ref(false)
const likeCount = ref(0)

const isCommentOwner = computed(() => {
  return authStore.user?.id === props.comment.userId
})

const getUserInitial = (user: any) => {
  return user?.username?.charAt(0).toUpperCase() || 'U'
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
  
  if (diffInHours < 1) {
    return 'Just now'
  } else if (diffInHours < 24) {
    return `${Math.floor(diffInHours)}h ago`
  } else if (diffInHours < 168) {
    return `${Math.floor(diffInHours / 24)}d ago`
  } else {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }
}

const startEditing = () => {
  isEditing.value = true
  editContent.value = props.comment.content
}

const cancelEditing = () => {
  isEditing.value = false
  editContent.value = ''
}

const saveEdit = async () => {
  if (!editContent.value.trim()) return

  loading.value = true
  try {
    await apiService.updateComment(props.comment.id, {
      content: editContent.value
    })
    props.comment.content = editContent.value
    isEditing.value = false
  } catch (error) {
    console.error('Failed to update comment:', error)
  } finally {
    loading.value = false
  }
}

const deleteComment = async () => {
  if (!confirm('Are you sure you want to delete this comment?')) return

  loading.value = true
  try {
    await apiService.deleteComment(props.comment.id)
    // Emit event to parent to remove comment from list
    // This would be handled by the parent component
  } catch (error) {
    console.error('Failed to delete comment:', error)
  } finally {
    loading.value = false
  }
}

const toggleLike = () => {
  isLiked.value = !isLiked.value
  likeCount.value += isLiked.value ? 1 : -1
}

const postReply = async () => {
  if (!replyContent.value.trim()) return

  loading.value = true
  try {
    await apiService.createComment({
      content: replyContent.value,
      problemId: props.comment.problemId,
      parentId: props.comment.id
    })
    replyContent.value = ''
    showReplyForm.value = false
    // Emit event to reload comments
  } catch (error) {
    console.error('Failed to post reply:', error)
  } finally {
    loading.value = false
  }
}

const cancelReply = () => {
  showReplyForm.value = false
  replyContent.value = ''
}
</script>

<style scoped>
.comment-item {
  background: var(--surface-50);
  transition: background-color 0.2s;
}

.comment-item:hover {
  background: var(--surface-100);
}

.reply-form {
  border-left-color: var(--primary-color) !important;
}

.replies-section {
  border-left-color: var(--surface-300) !important;
}

:deep(.p-avatar) {
  background: var(--primary-color);
  color: white;
}
</style>