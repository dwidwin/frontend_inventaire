<template>
  <RouterLink
    :to="item.href"
    :class="[
      'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors',
      isActive
        ? 'bg-primary-100 text-primary-700'
        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
    ]"
    @click="$emit('click')"
  >
    <component
      :is="iconComponent"
      :class="[
        'mr-3 h-5 w-5 flex-shrink-0',
        isActive ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'
      ]"
    />
    {{ item.name }}
  </RouterLink>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
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
} from '@heroicons/vue/24/outline'

interface NavigationItem {
  name: string
  href: string
  icon: string
}

interface Props {
  item: NavigationItem
}

const props = defineProps<Props>()
const route = useRoute()

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
  }
  return iconMap[props.item.icon] || HomeIcon
})

// Vérifier si l'item est actif
const isActive = computed(() => {
  if (props.item.href === '/') {
    return route.path === '/'
  }
  return route.path.startsWith(props.item.href)
})

defineEmits<{
  click: []
}>()
</script>
