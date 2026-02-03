<template>
  <div ref="dropdownRef" class="relative">
    <button
      @click="isOpen = !isOpen"
      :class="[
        'group flex items-center justify-between w-full px-2 py-2 text-sm font-medium rounded-md transition-colors',
        isActive
          ? 'bg-primary-100 text-primary-700'
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
      ]"
      @click.stop
    >
      <div class="flex items-center">
        <component
          :is="iconComponent"
          :class="[
            'mr-3 h-5 w-5 flex-shrink-0',
            isActive ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'
          ]"
        />
        {{ item.name }}
      </div>
      <ChevronDownIcon
        :class="[
          'h-4 w-4 transition-transform',
          isOpen ? 'transform rotate-180' : '',
          isActive ? 'text-primary-500' : 'text-gray-400'
        ]"
      />
    </button>
    
    <!-- Dropdown menu -->
    <Transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <div
        v-if="isOpen"
        class="mt-1 ml-4 space-y-1"
      >
        <RouterLink
          v-for="subItem in item.subItems"
          :key="subItem.name"
          :to="subItem.href"
          :class="[
            'flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors',
            isSubItemActive(subItem.href)
              ? 'bg-primary-50 text-primary-700'
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
          ]"
          @click="handleSubItemClick"
        >
          {{ subItem.label }}
        </RouterLink>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { ChevronDownIcon } from '@heroicons/vue/24/outline'
import {
  HomeIcon,
  Squares2X2Icon,
  CubeIcon,
  MapPinIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  UsersIcon,
  BellIcon,
  UserIcon,
  DocumentTextIcon,
  Cog6ToothIcon,
} from '@heroicons/vue/24/outline'

interface SubNavigationItem {
  name: string
  label: string
  href: string
}

interface NavigationItemWithDropdown {
  name: string
  href: string
  icon: string
  subItems: SubNavigationItem[]
}

interface Props {
  item: NavigationItemWithDropdown
}

const props = defineProps<Props>()
const route = useRoute()

// Ouvrir le menu automatiquement si on est sur une des sous-pages
const shouldBeOpenInitially = computed(() => {
  return props.item.subItems.some(subItem => {
    const basePath = subItem.href.split('?')[0]
    return route.path.startsWith(basePath)
  })
})

const isOpen = ref(shouldBeOpenInitially.value)
const dropdownRef = ref<HTMLElement | null>(null)

// Fonction pour vérifier si on est sur une page de paramètres
const isOnSettingsPage = () => {
  return props.item.subItems.some(subItem => {
    const basePath = subItem.href.split('?')[0]
    return route.path.startsWith(basePath)
  })
}

// Surveiller les changements de route pour ouvrir/fermer le menu
watch(() => route.path, () => {
  const shouldBeOpen = isOnSettingsPage()
  if (shouldBeOpen) {
    // Ouvrir le menu si on navigue vers une page de paramètres
    isOpen.value = true
  } else {
    // Fermer le menu uniquement si on quitte toutes les pages de paramètres
    isOpen.value = false
  }
})

// Icône dynamique
const iconComponent = computed(() => {
  const iconMap: Record<string, any> = {
    HomeIcon,
    Squares2X2Icon,
    CubeIcon,
    MapPinIcon,
    UserGroupIcon,
    CurrencyDollarIcon,
    UsersIcon,
    BellIcon,
    UserIcon,
    DocumentTextIcon,
    Cog6ToothIcon,
  }
  return iconMap[props.item.icon] || HomeIcon
})

// Vérifier si l'item parent est actif (si on est sur une de ses sous-pages)
const isActive = computed(() => {
  return props.item.subItems.some(subItem => isSubItemActive(subItem.href))
})

// Vérifier si un sous-item est actif
const isSubItemActive = (href: string) => {
  if (href === '/') {
    return route.path === '/'
  }
  const [basePath, queryPart] = href.split('?')
  if (!route.path.startsWith(basePath)) return false
  // Pour les routes avec query (ex. /settings?tab=locations), comparer le tab
  if (queryPart) {
    const tabValue = queryPart.split('=')[1]
    return route.query.tab === (tabValue ?? '')
  }
  return true
}

// Gérer le clic sur un sous-item - ne pas fermer le menu pour rester ouvert lors de la navigation
const handleSubItemClick = () => {
  // Ne pas fermer le menu - il doit rester ouvert lors de la navigation entre les pages de paramètres
  emit('click')
}

// Fermer le menu au clic extérieur - mais seulement si on n'est pas sur une page de paramètres
const handleClickOutside = (event: Event) => {
  const target = event.target as Element
  if (dropdownRef.value && !dropdownRef.value.contains(target)) {
    // Ne pas fermer le menu si on est sur une page de paramètres
    if (!isOnSettingsPage()) {
      isOpen.value = false
    }
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

const emit = defineEmits<{
  click: []
}>()
</script>

