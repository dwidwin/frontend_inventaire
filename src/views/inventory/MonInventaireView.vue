<template>
  <div>
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900">Mon inventaire</h1>
      <p class="mt-1 text-sm text-gray-600">
        Matériel qui m'est affecté ou en location
      </p>
    </div>

    <!-- Chargement -->
    <div v-if="isLoading" class="space-y-4">
      <div v-for="i in 5" :key="i" class="card">
        <div class="card-body">
          <div class="skeleton h-5 w-48 mb-2"></div>
          <div class="skeleton h-4 w-32"></div>
        </div>
      </div>
    </div>

    <!-- État vide -->
    <div
      v-else-if="!rentalItems.length"
      class="card"
    >
      <div class="card-body text-center py-12">
        <p class="text-gray-500">Aucun matériel ne vous est actuellement affecté ou en location.</p>
        <RouterLink
          to="/catalogue"
          class="mt-4 inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-500"
        >
          Voir le catalogue
        </RouterLink>
      </div>
    </div>

    <!-- Liste des locations / affectations -->
    <div v-else class="space-y-4">
      <template v-for="item in rentalItems" :key="item.line.id">
        <RouterLink
          v-if="item.model?.id"
          :to="{ name: 'ModelDetail', params: { id: item.model.id } }"
          class="card hover:shadow-md transition-shadow cursor-pointer block"
        >
          <div class="card-body flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <!-- Miniature du modèle -->
            <div class="flex-shrink-0 w-24 h-24 rounded-lg bg-gray-100 overflow-hidden flex items-center justify-center">
              <img
                v-if="item.model?.mainImageUrl || item.model?.photoUrl"
                :src="item.model?.photoUrl || item.model?.mainImageUrl"
                :alt="item.model?.name ?? 'Matériel'"
                class="w-full h-full object-contain"
              />
              <CubeIcon v-else class="w-12 h-12 text-gray-400" />
            </div>
            <div class="min-w-0 flex-1">
              <h3 class="text-lg font-medium text-gray-900 truncate">
                {{ item.model?.name ?? 'Modèle inconnu' }}
              </h3>
              <p v-if="categoryLabel(item.model)" class="mt-0.5 text-sm text-gray-500">
                {{ categoryLabel(item.model) }}
              </p>
              <p class="mt-1 text-xs text-gray-400">
                {{ item.transaction.isAssignment ? 'Affecté' : 'En location' }} depuis le {{ formatDate(item.transaction.startAt) }}
              </p>
            </div>
            <div class="flex items-center gap-3 flex-shrink-0">
              <StatusBadge
                :status="item.transaction.closedAt ? 'Clôturée' : 'Active'"
                :color="item.transaction.closedAt ? 'gray' : 'success'"
              />
              <span class="text-sm font-medium text-primary-600 hover:text-primary-500">
                Voir le détail
              </span>
            </div>
          </div>
        </RouterLink>
        <div
          v-else
          class="card hover:shadow-md transition-shadow"
        >
          <div class="card-body flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <!-- Miniature du modèle -->
            <div class="flex-shrink-0 w-24 h-24 rounded-lg bg-gray-100 overflow-hidden flex items-center justify-center">
              <img
                v-if="item.model?.mainImageUrl || item.model?.photoUrl"
                :src="item.model?.photoUrl || item.model?.mainImageUrl"
                :alt="item.model?.name ?? 'Matériel'"
                class="w-full h-full object-contain"
              />
              <CubeIcon v-else class="w-12 h-12 text-gray-400" />
            </div>
            <div class="min-w-0 flex-1">
              <h3 class="text-lg font-medium text-gray-900 truncate">
                {{ item.model?.name ?? 'Modèle inconnu' }}
              </h3>
              <p v-if="categoryLabel(item.model)" class="mt-0.5 text-sm text-gray-500">
                {{ categoryLabel(item.model) }}
              </p>
              <p class="mt-1 text-xs text-gray-400">
                {{ item.transaction.isAssignment ? 'Affecté' : 'En location' }} depuis le {{ formatDate(item.transaction.startAt) }}
              </p>
            </div>
            <div class="flex items-center gap-3 flex-shrink-0">
              <StatusBadge
                :status="item.transaction.closedAt ? 'Clôturée' : 'Active'"
                :color="item.transaction.closedAt ? 'gray' : 'success'"
              />
              <RouterLink
                to="/catalogue"
                class="text-sm font-medium text-primary-600 hover:text-primary-500"
              >
                Voir le catalogue
              </RouterLink>
            </div>
          </div>
        </div>
      </template>
    </div>

    <div v-if="rentalItems.length" class="mt-6">
      <RouterLink
        to="/catalogue"
        class="text-sm font-medium text-primary-600 hover:text-primary-500"
      >
        Voir tout le catalogue
      </RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useQuery } from '@tanstack/vue-query'
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { transactionsApi } from '@/api/endpoints/transactions'
import StatusBadge from '@/components/StatusBadge.vue'
import { formatDate } from '@/utils/formatDate'
import { CubeIcon } from '@heroicons/vue/24/outline'
import type { Transaction, TransactionItem, MaterialModel } from '@/types'

const authStore = useAuthStore()

const { data: myRentals, isLoading } = useQuery({
  queryKey: ['transactions', 'rentals', 'me'],
  queryFn: () => transactionsApi.getMyRentals(),
})

const rentalItems = computed(() => {
  const txList = myRentals.value || []
  const items: { transaction: Transaction; line: TransactionItem; model: MaterialModel }[] = []
  for (const tx of txList) {
    for (const line of tx.lines || []) {
      if (!line.returnedAt && line.model) {
        items.push({
          transaction: tx,
          line,
          model: line.model as MaterialModel,
        })
      }
    }
  }
  return items
})

function categoryLabel(model?: MaterialModel | null): string {
  const categories = model?.categories
  if (!categories?.length) return ''
  return categories.map((c) => c.name).join(', ')
}
</script>
