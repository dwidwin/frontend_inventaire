<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
    <div class="bg-white rounded-lg shadow-xl w-full max-w-md">
      <div class="px-6 py-4 border-b border-gray-200">
        <h3 class="text-lg font-medium text-gray-900">Clôturer l'affectation</h3>
      </div>
      <div class="px-6 py-4">
        <p class="text-sm text-gray-600">
          Clôturer l'affectation « <strong>{{ assignment.model?.name ?? 'cette affectation' }}</strong> » ?
        </p>
      </div>
      <div class="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end space-x-3">
        <button type="button" class="btn btn-secondary" @click="$emit('close')">
          Annuler
        </button>
        <button
          type="button"
          :disabled="isClosing"
          class="btn btn-primary"
          @click="handleConfirm"
        >
          <span v-if="isClosing">Clôture...</span>
          <span v-else>Clôturer</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useCloseAssignment } from '@/composables/useAssignments'
import type { Assignment } from '@/types'

const props = defineProps<{
  assignment: Assignment
}>()

const emit = defineEmits<{
  close: []
  confirmed: []
}>()

const isClosing = ref(false)
const closeAssignmentMutation = useCloseAssignment()

const handleConfirm = async () => {
  isClosing.value = true
  try {
    await closeAssignmentMutation.mutateAsync({
      id: props.assignment.id,
      data: {},
    })
    emit('confirmed')
    emit('close')
  } catch (err: any) {
    const msg = err?.response?.data?.message || err?.message || 'Erreur lors de la clôture'
    alert(msg)
  } finally {
    isClosing.value = false
  }
}
</script>
