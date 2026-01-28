<template>
  <div class="card">
    <!-- Header avec recherche et actions -->
    <div v-if="showHeader" class="card-header">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
        <div class="flex-1 min-w-0">
          <h3 class="text-lg font-medium text-gray-900">{{ title }}</h3>
          <p v-if="description" class="mt-1 text-sm text-gray-500">{{ description }}</p>
        </div>
        <div class="flex items-center space-x-3">
          <!-- Recherche -->
          <div v-if="searchable" class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon class="h-5 w-5 text-gray-400" />
            </div>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Rechercher..."
              class="form-input pl-10 w-64"
            />
          </div>
          
          <!-- Actions -->
          <slot name="actions" />
        </div>
      </div>
    </div>

    <!-- Tableau -->
    <div class="overflow-x-auto">
      <table class="table" role="table" aria-label="Tableau de données">
        <thead>
          <tr role="row">
            <th
              v-for="column in columns"
              :key="column.key"
              :class="[
                'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
                column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''
              ]"
              @click="column.sortable ? handleSort(column.key) : null"
              :aria-sort="column.sortable && sortBy === column.key ? (sortOrder === 'asc' ? 'ascending' : 'descending') : 'none'"
              :tabindex="column.sortable ? 0 : -1"
              @keydown.enter="column.sortable ? handleSort(column.key) : null"
              @keydown.space.prevent="column.sortable ? handleSort(column.key) : null"
              role="columnheader"
            >
              <div class="flex items-center space-x-1">
                <span>{{ column.label }}</span>
                <div v-if="column.sortable" class="flex flex-col">
                  <ChevronUpIcon
                    :class="[
                      'h-3 w-3',
                      sortBy === column.key && sortOrder === 'asc' ? 'text-primary-500' : 'text-gray-400'
                    ]"
                  />
                  <ChevronDownIcon
                    :class="[
                      'h-3 w-3 -mt-1',
                      sortBy === column.key && sortOrder === 'desc' ? 'text-primary-500' : 'text-gray-400'
                    ]"
                  />
                </div>
              </div>
            </th>
            <th 
              v-if="hasActions" 
              class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
              role="columnheader"
            >
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="isLoading">
            <td :colspan="columns.length + (hasActions ? 1 : 0)" class="px-6 py-12 text-center">
              <div class="flex justify-center">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            </td>
          </tr>
          <tr v-else-if="!filteredData?.length">
            <td :colspan="columns.length + (hasActions ? 1 : 0)" class="px-6 py-12 text-center text-gray-500">
              {{ emptyMessage }}
            </td>
          </tr>
          <tr
            v-else
            v-for="(item, index) in paginatedData"
            :key="getItemKey(item, index)"
            class="hover:bg-gray-50"
            role="row"
          >
            <td
              v-for="column in columns"
              :key="column.key"
              class="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
            >
              <slot
                :name="`cell-${column.key}`"
                :item="item"
                :value="getNestedValue(item, column.key)"
                :column="column"
              >
                {{ formatCellValue(item, column) }}
              </slot>
            </td>
            <td v-if="hasActions" class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <slot name="actions" :item="item" :index="index">
                <div class="flex items-center justify-end space-x-2">
                  <button
                    v-if="showEdit"
                    @click="$emit('edit', item)"
                    class="text-primary-600 hover:text-primary-900"
                  >
                    Modifier
                  </button>
                  <button
                    v-if="showDelete"
                    @click="$emit('delete', item)"
                    class="text-danger-600 hover:text-danger-900"
                  >
                    Supprimer
                  </button>
                </div>
              </slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div v-if="paginated && totalPages > 1" class="card-footer">
      <div class="flex items-center justify-between">
        <div class="text-sm text-gray-700">
          Affichage de {{ startItem }} à {{ endItem }} sur {{ totalItems }} résultats
        </div>
        <div class="flex items-center space-x-2">
          <button
            @click="currentPage = Math.max(1, currentPage - 1)"
            :disabled="currentPage === 1"
            class="btn btn-secondary btn-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Précédent
          </button>
          <span class="text-sm text-gray-700">
            Page {{ currentPage }} sur {{ totalPages }}
          </span>
          <button
            @click="currentPage = Math.min(totalPages, currentPage + 1)"
            :disabled="currentPage === totalPages"
            class="btn btn-secondary btn-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Suivant
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { MagnifyingGlassIcon, ChevronUpIcon, ChevronDownIcon } from '@heroicons/vue/24/outline'

interface Column {
  key: string
  label: string
  sortable?: boolean
  formatter?: (value: any, item: any) => string
}

interface Props {
  data: any[]
  columns: Column[]
  title?: string
  description?: string
  searchable?: boolean
  paginated?: boolean
  pageSize?: number
  showEdit?: boolean
  showDelete?: boolean
  showHeader?: boolean
  emptyMessage?: string
  itemKey?: string | ((item: any) => string)
  isLoading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  searchable: true,
  paginated: true,
  pageSize: 10,
  showEdit: true,
  showDelete: true,
  showHeader: true,
  emptyMessage: 'Aucun élément trouvé',
  itemKey: 'id',
  isLoading: false,
})

const emit = defineEmits<{
  edit: [item: any]
  delete: [item: any]
  sort: [key: string, order: 'asc' | 'desc']
}>()

// État local
const searchQuery = ref('')
const currentPage = ref(1)
const sortBy = ref<string>('')
const sortOrder = ref<'asc' | 'desc'>('asc')

// Données filtrées
const filteredData = computed(() => {
  let result = (props.data ?? []).filter(Boolean)
  
  // Recherche
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(item => {
      return props.columns.some(column => {
        const value = getNestedValue(item, column.key)
        return String(value).toLowerCase().includes(query)
      })
    })
  }
  
  // Tri
  if (sortBy.value) {
    result.sort((a, b) => {
      const aValue = getNestedValue(a, sortBy.value)
      const bValue = getNestedValue(b, sortBy.value)
      
      if (aValue < bValue) return sortOrder.value === 'asc' ? -1 : 1
      if (aValue > bValue) return sortOrder.value === 'asc' ? 1 : -1
      return 0
    })
  }
  
  return result
})

// Données paginées
const paginatedData = computed(() => {
  if (!props.paginated) return filteredData.value
  
  const start = (currentPage.value - 1) * props.pageSize
  const end = start + props.pageSize
  return filteredData.value.slice(start, end).filter(Boolean)
})

// Pagination info
const totalItems = computed(() => filteredData.value.length)
const totalPages = computed(() => Math.ceil(totalItems.value / props.pageSize))
const startItem = computed(() => (currentPage.value - 1) * props.pageSize + 1)
const endItem = computed(() => Math.min(currentPage.value * props.pageSize, totalItems.value))

// Actions
const hasActions = computed(() => props.showEdit || props.showDelete || !!$slots.actions)

// Utilitaires
const getItemKey = (item: any, index: number) => {
  if (!item) return index
  if (typeof props.itemKey === 'function') {
    try {
      const key = props.itemKey(item)
      return key ?? index
    } catch {
      return index
    }
  }
  const key = props.itemKey as string
  const value = item?.[key]
  return value ?? index
}

const getNestedValue = (obj: any, path: string) => {
  return path.split('.').reduce((current, key) => current?.[key], obj)
}

const formatCellValue = (item: any, column: Column) => {
  const value = getNestedValue(item, column.key)
  if (column.formatter) {
    return column.formatter(value, item)
  }
  return value
}

const handleSort = (key: string) => {
  if (sortBy.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortBy.value = key
    sortOrder.value = 'asc'
  }
  emit('sort', key, sortOrder.value)
}

// Reset pagination quand les données changent
watch(() => props.data, () => {
  currentPage.value = 1
})
</script>
