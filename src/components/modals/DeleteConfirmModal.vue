<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
    <div class="bg-white rounded-lg shadow-xl w-full max-w-md">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-gray-200">
        <h3 class="text-lg font-medium text-gray-900">
          Confirmer la suppression
        </h3>
      </div>

      <!-- Contenu -->
      <div class="px-6 py-4">
        <p class="text-sm text-gray-600 mb-4">
          Êtes-vous sûr de vouloir supprimer {{ entityLabel }} ?
        </p>
        
        <div v-if="entity" class="p-3 bg-gray-50 border border-gray-200 rounded-lg mb-4">
          <div class="flex items-center space-x-3">
            <img
              v-if="entity.mainImageUrl || entity.photoUrl"
              :src="entity.photoUrl || entity.mainImageUrl"
              :alt="entity.name"
              class="h-12 w-12 rounded-lg object-contain"
            />
            <div class="flex-1">
              <div class="text-sm font-medium text-gray-900">{{ entity.name }}</div>
              <div class="text-xs text-gray-500">
                <span v-if="entity.codeBarre">Code-barres: {{ entity.codeBarre }}</span>
                <span v-if="entity.location"> • {{ entity.location.name }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <p class="text-sm text-red-600 font-medium">
          Cette action est irréversible.
        </p>
      </div>

      <!-- Footer -->
      <div class="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end space-x-3">
        <button
          @click="$emit('close')"
          type="button"
          class="btn btn-secondary"
        >
          Annuler
        </button>
        <button
          @click="handleConfirm"
          type="button"
          class="btn btn-danger"
        >
          Supprimer
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/** Entité affichée dans la modale (modèle, catégorie, etc.). La suppression réelle est gérée par le parent via @confirmed. */
export interface DeleteConfirmEntity {
  id: string
  name: string
  mainImageUrl?: string | null
  photoUrl?: string | null
  codeBarre?: string | null
  location?: { name: string } | null
}

const props = withDefaults(
  defineProps<{
    entity: DeleteConfirmEntity | null | undefined
    /** Libellé pour le texte "Êtes-vous sûr de vouloir supprimer … ?" (ex. "ce modèle", "cette catégorie"). */
    entityLabel?: string
  }>(),
  { entityLabel: 'cet élément' }
)

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'confirmed'): void
}>()

const handleConfirm = () => {
  if (!props.entity) return
  emit('confirmed')
  emit('close')
}
</script>
