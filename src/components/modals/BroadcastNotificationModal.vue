<template>
  <div
    v-if="open"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-2 sm:p-4"
    @click.self="handleClose"
    role="dialog"
    aria-modal="true"
    aria-labelledby="broadcast-modal-title"
  >
    <div class="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <h3 id="broadcast-modal-title" class="text-lg font-medium text-gray-900">
            Diffuser une notification
          </h3>
          <button
            type="button"
            class="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Fermer"
            @click="handleClose"
          >
            <XMarkIcon class="w-6 h-6" />
          </button>
        </div>
      </div>

      <form @submit.prevent="handleSubmit" class="px-6 py-4 space-y-4">
        <div>
          <label for="broadcast-role" class="form-label">Cible (rôle)</label>
          <select
            id="broadcast-role"
            v-model="form.targetRole"
            class="form-input"
            required
          >
            <option value="">Sélectionner un rôle</option>
            <option value="admin">Administrateurs</option>
            <option value="manager">Managers</option>
            <option value="user">Utilisateurs</option>
          </select>
        </div>

        <div>
          <label for="broadcast-title" class="form-label">Titre <span class="text-red-500">*</span></label>
          <input
            id="broadcast-title"
            v-model="form.title"
            type="text"
            class="form-input"
            required
            maxlength="150"
            placeholder="Titre de la notification"
          />
        </div>

        <div>
          <label for="broadcast-message" class="form-label">Description</label>
          <textarea
            id="broadcast-message"
            v-model="form.message"
            class="form-input"
            rows="4"
            placeholder="Message optionnel"
          />
        </div>

        <div>
          <label for="broadcast-scheduledAt" class="form-label">Date de diffusion (optionnel)</label>
          <input
            id="broadcast-scheduledAt"
            v-model="form.scheduledAt"
            type="datetime-local"
            class="form-input"
          />
          <p class="mt-1 text-xs text-gray-500">
            Si renseignée, la notification n'apparaîtra qu'à partir de cette date et heure.
          </p>
        </div>
      </form>

      <div class="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
        <button type="button" class="btn btn-secondary" @click="handleClose">
          Annuler
        </button>
        <button
          type="submit"
          class="btn btn-primary"
          :disabled="isSubmitting || !canSubmit"
          @click="handleSubmit"
        >
          <span v-if="isSubmitting">Envoi...</span>
          <span v-else>Diffuser</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { XMarkIcon } from '@heroicons/vue/24/outline'
import { useBroadcastNotification } from '@/composables/useNotifications'
import type { BroadcastDto } from '@/types'
import { logger } from '@/utils/logger'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  close: []
  success: []
}>()

const form = ref<BroadcastDto & { targetRole: BroadcastDto['targetRole'] }>({
  targetRole: undefined,
  title: '',
  message: '',
  scheduledAt: undefined,
})

const broadcastMutation = useBroadcastNotification()
const isSubmitting = computed(() => broadcastMutation.isPending.value)

const canSubmit = computed(() => {
  return !!(
    form.value.targetRole &&
    form.value.title?.trim()
  )
})

watch(() => props.open, (isOpen) => {
  if (isOpen) {
    form.value = {
      targetRole: undefined,
      title: '',
      message: '',
      scheduledAt: undefined,
    }
  }
})

function handleClose() {
  emit('close')
}

function toISOIfNeeded(value: string | undefined): string | undefined {
  if (!value?.trim()) return undefined
  try {
    const d = new Date(value)
    return isNaN(d.getTime()) ? undefined : d.toISOString()
  } catch {
    return undefined
  }
}

async function handleSubmit() {
  if (!canSubmit.value || broadcastMutation.isPending.value) return
  try {
    const payload = {
      role: form.value.targetRole!,
      title: form.value.title!.trim(),
      message: form.value.message?.trim() || undefined,
      scheduledAt: toISOIfNeeded(form.value.scheduledAt),
    }
    await broadcastMutation.mutateAsync(payload as BroadcastDto)
    emit('success')
    handleClose()
  } catch (err) {
    logger.error('Erreur lors de la diffusion de la notification:', err)
  }
}
</script>
