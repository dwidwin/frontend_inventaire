<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
    <div class="bg-white rounded-lg shadow-xl w-full max-w-md">
      <div class="px-6 py-4 border-b border-gray-200">
        <h3 class="text-lg font-medium text-gray-900">Retour de location</h3>
      </div>
      <div class="px-6 py-4">
        <p class="text-sm text-gray-600 mb-4">
          Contrepartie : <strong>{{ counterpartyLabel }}</strong>
        </p>
        <div v-if="linesNotReturned.length" class="mb-4">
          <p class="text-sm text-gray-600 mb-2">Modèles à retourner :</p>
          <ul class="list-disc list-inside text-sm text-gray-900">
            <li v-for="line in linesNotReturned" :key="line.id">
              {{ line.model?.name ?? line.modelId }}
            </li>
          </ul>
        </div>
        <div v-else class="mb-4 text-sm text-gray-500">
          Tous les modèles sont déjà retournés.
        </div>
        <label for="return-notes" class="form-label">Notes (optionnel)</label>
        <textarea
          id="return-notes"
          v-model="notes"
          rows="2"
          class="form-input mt-1"
          placeholder="Notes de retour..."
        />
        <label for="return-penalty" class="form-label mt-3">Pénalité (€, optionnel)</label>
        <input
          id="return-penalty"
          v-model.number="penaltyAmount"
          type="number"
          min="0"
          step="0.01"
          class="form-input mt-1"
        />
      </div>
      <div class="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end space-x-3">
        <button type="button" class="btn btn-secondary" @click="$emit('close')">
          Annuler
        </button>
        <button
          type="button"
          :disabled="isSubmitting || !linesNotReturned.length"
          class="btn btn-primary"
          @click="handleReturn"
        >
          <span v-if="isSubmitting">Retour en cours...</span>
          <span v-else>Retourner</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useReturnRental, useTransaction } from '@/composables/useTransactions'
import type { Transaction, TransactionItem } from '@/types'

const props = defineProps<{
  transaction: Transaction
}>()

const emit = defineEmits<{
  close: []
  returned: []
}>()

const notes = ref('')
const penaltyAmount = ref<number | ''>('')
const isSubmitting = ref(false)
const returnRentalMutation = useReturnRental()

// Charger le détail si les lignes ne sont pas présentes
const { data: transactionDetail } = useTransaction(props.transaction.id)
const fullTransaction = computed(() => {
  const detail = transactionDetail.value
  if (detail?.lines?.length) return detail
  return props.transaction
})

const counterpartyLabel = computed(() => {
  const t = fullTransaction.value
  if (t.counterpartyUser?.username) return t.counterpartyUser.username
  if (t.counterpartyTeam?.name) return t.counterpartyTeam.name
  if (t.externalName) return t.externalName
  return '-'
})

const linesNotReturned = computed(() => {
  const lines = fullTransaction.value?.lines ?? []
  return lines.filter((line: TransactionItem) => !line.returnedAt)
})

const handleReturn = async () => {
  const modelIds = linesNotReturned.value
    .map((l: TransactionItem) => l.modelId ?? l.model?.id)
    .filter(Boolean)
  if (!modelIds.length) return
  isSubmitting.value = true
  try {
    // Backend attend penaltyAmount en string, format \d+\.?\d{0,2} (max 2 décimales)
    const numPenalty =
      penaltyAmount.value !== '' && Number(penaltyAmount.value) >= 0
        ? Number(penaltyAmount.value)
        : null
    const penalty =
      numPenalty !== null ? Number(numPenalty).toFixed(2) : undefined
    const data = {
      modelIds,
      notes: notes.value?.trim() || undefined,
      ...(penalty !== undefined && { penaltyAmount: penalty }),
    }
    await returnRentalMutation.mutateAsync({
      id: fullTransaction.value.id,
      data,
    })
    emit('returned')
    emit('close')
  } catch (err: any) {
    const msg = err?.message || 'Erreur lors du retour'
    alert(msg)
  } finally {
    isSubmitting.value = false
  }
}
</script>
