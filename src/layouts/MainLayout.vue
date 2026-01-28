<template>
  <div class="h-screen flex overflow-hidden bg-gray-100">
    <!-- Skip to main content link -->
    <a 
      href="#main-content" 
      class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary-600 focus:text-white focus:rounded-md"
    >
      Aller au contenu principal
    </a>
    
    <!-- Sidebar -->
    <nav 
      :class="[
        'fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      ]"
      aria-label="Navigation principale"
    >
      <div class="flex items-center justify-between h-16 px-4 border-b border-gray-200">
        <h1 class="text-xl font-semibold text-gray-900">Inventaire Club</h1>
        <button
          @click="sidebarOpen = false"
          class="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
        >
          <XMarkIcon class="h-6 w-6" />
        </button>
      </div>
      
      <nav class="mt-5 px-2 space-y-1">
        <template v-for="item in navigationItems" :key="item.name">
          <NavigationItemWithDropdown
            v-if="item.subItems"
            :item="item"
            @click="sidebarOpen = false"
          />
          <NavigationItem
            v-else
            :item="item"
            @click="sidebarOpen = false"
          />
        </template>
      </nav>
    </nav>

    <!-- Overlay pour mobile -->
    <div
      v-if="sidebarOpen"
      @click="sidebarOpen = false"
      class="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
    ></div>

    <!-- Contenu principal -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Header -->
      <header class="bg-white shadow-sm border-b border-gray-200">
        <div class="h-16">
          <div class="max-w-7xl mx-auto flex items-center justify-between h-full px-3 sm:px-6 lg:px-8">
          <div class="flex items-center">
            <button
              @click="sidebarOpen = true"
              class="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <Bars3Icon class="h-6 w-6" />
            </button>
            <h2 class="ml-2 text-lg font-medium text-gray-900">
              {{ currentPageTitle }}
            </h2>
          </div>
          
          <div class="flex items-center space-x-4">
            <!-- Notifications -->
            <NotificationBell />
            
            <!-- Menu utilisateur -->
            <div class="relative">
              <button
                @click="userMenuOpen = !userMenuOpen"
                class="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <span class="sr-only">Ouvrir le menu utilisateur</span>
                <div class="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center">
                  <span class="text-sm font-medium text-white">
                    {{ userInitials }}
                  </span>
                </div>
              </button>
              
              <!-- Dropdown menu -->
              <div
                v-if="userMenuOpen"
                @click="userMenuOpen = false"
                class="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
              >
                <div class="py-1">
                  <div class="px-4 py-2 text-sm text-gray-700 border-b">
                    <p class="font-medium">{{ authStore.user?.username }}</p>
                    <p class="text-gray-500">{{ authStore.user?.email }}</p>
                    <p class="text-xs text-gray-400">{{ authStore.user?.role }}</p>
                  </div>
                  <button
                    @click="handleLogout"
                    class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Se déconnecter
                  </button>
                </div>
              </div>
            </div>
          </div>
          </div>
        </div>
      </header>

      <!-- Contenu -->
      <main id="main-content" class="flex-1 overflow-y-auto" role="main">
        <div class="py-6">
          <div class="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
            <RouterView />
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Bars3Icon, XMarkIcon, Cog6ToothIcon } from '@heroicons/vue/24/outline'
import { useAuthStore } from '@/stores/auth'
import NavigationItem from '@/components/NavigationItem.vue'
import NavigationItemWithDropdown from '@/components/NavigationItemWithDropdown.vue'
import NotificationBell from '@/components/NotificationBell.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

// État local
const sidebarOpen = ref(false)
const userMenuOpen = ref(false)

// Navigation items de base (accessibles à tous)
const navigationItems = computed(() => {
  const items = [
    { name: 'Dashboard', href: '/', icon: 'HomeIcon' },
    { name: 'Catalogue', href: '/catalogue', icon: 'Squares2X2Icon' },
    { name: 'Notifications', href: '/notifications', icon: 'BellIcon' },
  ]

  // Items accessibles aux managers
  if (authStore.isManager) {
    items.push(
      { name: 'Équipes', href: '/teams', icon: 'UsersIcon' },
      { name: 'Emplacements', href: '/locations', icon: 'MapPinIcon' },
      { name: 'Affectations', href: '/assignments', icon: 'UserGroupIcon' },
      { name: 'Buvette', href: '/buvette', icon: 'CubeIcon' }
    )
  }

  // Items accessibles aux admins
  if (authStore.isAdmin) {
    items.push({
      name: 'Paramètres',
      href: '/settings',
      icon: 'Cog6ToothIcon',
      subItems: [
        { name: 'categories', label: 'Catégories', href: '/categories' },
        { name: 'models', label: 'Modèles', href: '/models' },
        { name: 'transactions', label: 'Transactions', href: '/transactions' },
        { name: 'statuses', label: 'Statuts', href: '/statuses' },
        { name: 'users', label: 'Gestion des utilisateurs', href: '/users' },
      ]
    })
  }

  return items
})

// Titre de la page actuelle
const currentPageTitle = computed(() => {
  // Vérifier d'abord les sous-items
  for (const item of navigationItems.value) {
    if ('subItems' in item && item.subItems) {
      const subItem = item.subItems.find(sub => {
        const basePath = sub.href.split('?')[0]
        return route.path.startsWith(basePath)
      })
      if (subItem) {
        return subItem.label
      }
    }
  }
  
  // Sinon, chercher l'item principal
  const item = navigationItems.value.find(item => {
    if (item.href === '/') {
      return route.path === '/'
    }
    return route.path.startsWith(item.href)
  })
  return item?.name || 'Inventaire Club'
})

// Initiales de l'utilisateur
const userInitials = computed(() => {
  if (!authStore.user?.username) return 'U'
  return authStore.user.username
    .split('.')
    .map(part => part.charAt(0).toUpperCase())
    .join('')
    .slice(0, 2)
})

// Déconnexion
const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}

// Fermer les menus au clic extérieur
const handleClickOutside = (event: Event) => {
  if (!(event.target as Element).closest('.relative')) {
    userMenuOpen.value = false
  }
}

// Ajouter l'écouteur d'événements
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
