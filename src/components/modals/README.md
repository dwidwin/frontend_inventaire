# Formulaire de Création de Catégorie

## Vue d'ensemble

Le composant `CreateCategoryModal.vue` est un formulaire modal responsive et réutilisable pour créer de nouvelles catégories dans l'application d'inventaire. Il supporte la création de catégories racines et de sous-catégories avec une hiérarchie jusqu'à 2 niveaux de profondeur.

## Fonctionnalités

### ✅ Responsive Design
- **Mobile-first** : Optimisé pour les écrans mobiles
- **Adaptatif** : S'adapte automatiquement aux différentes tailles d'écran
- **Touch-friendly** : Boutons et champs adaptés aux interactions tactiles

### ✅ Validation en Temps Réel
- **Nom obligatoire** : Validation du champ nom avec messages d'erreur
- **Longueur minimale** : Vérification de la longueur minimale (2 caractères)
- **Feedback visuel** : Indicateurs visuels pour les erreurs de validation

### ✅ Gestion de la Hiérarchie
- **Catégories parentes** : Sélection d'une catégorie parente existante
- **Aperçu hiérarchique** : Visualisation de la hiérarchie en temps réel
- **Limitation de profondeur** : Maximum 2 niveaux de profondeur
- **Affichage intelligent** : Noms des catégories avec indication de la hiérarchie

### ✅ Accessibilité
- **Labels appropriés** : Tous les champs ont des labels associés
- **Navigation clavier** : Support complet de la navigation au clavier
- **Focus management** : Gestion appropriée du focus
- **ARIA attributes** : Attributs ARIA pour les lecteurs d'écran

## Utilisation

### Import du composant

```vue
<script setup lang="ts">
import CreateCategoryModal from '@/components/modals/CreateCategoryModal.vue'
</script>
```

### Template - Mode Création

```vue
<template>
  <div>
    <!-- Bouton pour ouvrir le modal -->
    <button @click="showModal = true" class="btn btn-primary">
      Créer une catégorie
    </button>

    <!-- Modal de création -->
    <CreateCategoryModal
      v-if="showModal"
      @close="showModal = false"
      @created="handleCategoryCreated"
    />
  </div>
</template>
```

### Template - Mode Édition

```vue
<template>
  <div>
    <!-- Bouton pour ouvrir le modal d'édition -->
    <button @click="openEditModal(category)" class="btn btn-secondary">
      Modifier
    </button>

    <!-- Modal d'édition -->
    <CreateCategoryModal
      v-if="showEditModal && selectedCategory"
      :category="selectedCategory"
      @close="showEditModal = false"
      @updated="handleCategoryUpdated"
    />
  </div>
</template>
```

### Script - Mode Création

```vue
<script setup lang="ts">
import { ref } from 'vue'

const showModal = ref(false)

const handleCategoryCreated = () => {
  showModal.value = false
  console.log('Catégorie créée avec succès!')
}
</script>
```

### Script - Mode Édition

```vue
<script setup lang="ts">
import { ref } from 'vue'
import type { Category } from '@/types'

const showEditModal = ref(false)
const selectedCategory = ref<Category | null>(null)

const openEditModal = (category: Category) => {
  selectedCategory.value = category
  showEditModal.value = true
}

const handleCategoryUpdated = () => {
  showEditModal.value = false
  selectedCategory.value = null
  console.log('Catégorie modifiée avec succès!')
}
</script>
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `category` | `Category` | No | Catégorie à modifier (pour le mode édition). Si fournie, le formulaire s'ouvre en mode édition avec les champs pré-remplis. |

## Events

| Event | Description | Payload |
|-------|-------------|---------|
| `close` | Émis quand le modal est fermé | `void` |
| `created` | Émis quand une catégorie est créée avec succès | `void` |
| `updated` | Émis quand une catégorie est modifiée avec succès | `void` |

## Structure des Données

### CreateCategoryDto

```typescript
interface CreateCategoryDto {
  name: string           // Nom de la catégorie (obligatoire)
  description?: string   // Description (optionnelle)
  parentId?: string     // ID de la catégorie parente (optionnel)
}
```

### Exemple de Données

```json
{
  "name": "Textiles",
  "description": "Catégorie pour tous les textiles",
  "parentId": "8048fc5e-47e7-4e37-8967-7ff7f08e1311"
}
```

## Styles et Classes CSS

Le composant utilise les classes Tailwind CSS définies dans `src/style.css` :

- `.btn` : Styles de base pour les boutons
- `.btn-primary` : Style pour le bouton principal
- `.btn-secondary` : Style pour le bouton secondaire
- `.form-input` : Style pour les champs de saisie
- `.form-textarea` : Style pour les zones de texte
- `.form-select` : Style pour les listes déroulantes
- `.form-label` : Style pour les labels
- `.form-error` : Style pour les messages d'erreur

## Responsive Breakpoints

- **Mobile** : `< 640px` - Layout vertical, boutons pleine largeur
- **Tablet** : `640px - 1024px` - Layout adaptatif
- **Desktop** : `> 1024px` - Layout horizontal optimisé

## Gestion des Erreurs

Le composant gère automatiquement :
- Les erreurs de validation des champs
- Les erreurs de soumission de l'API
- L'affichage des messages d'erreur appropriés
- La réinitialisation du formulaire en cas d'erreur

## Intégration avec Vue Query

Le composant s'intègre parfaitement avec Vue Query :
- Utilise `useCategories()` pour récupérer les catégories existantes
- Utilise `useCreateCategory()` pour créer de nouvelles catégories
- Invalidation automatique du cache après création
- Gestion des états de chargement

## Exemples d'Utilisation

### Dans une Vue de Catalogue

```vue
<template>
  <div>
    <button @click="showCreateCategory = true" class="btn btn-primary">
      <PlusIcon class="w-5 h-5 mr-2" />
      Ajouter une catégorie
    </button>

    <CreateCategoryModal
      v-if="showCreateCategory"
      @close="showCreateCategory = false"
      @created="handleCategoryCreated"
    />
  </div>
</template>
```

### Dans un Menu Contextuel

```vue
<template>
  <div>
    <button @click="showContextMenu = !showContextMenu">
      Actions
    </button>
    
    <div v-if="showContextMenu" class="context-menu">
      <button @click="openCreateCategory">
        Créer une catégorie
      </button>
    </div>

    <CreateCategoryModal
      v-if="showCreateCategory"
      @close="showCreateCategory = false"
      @created="handleCategoryCreated"
    />
  </div>
</template>
```

## Maintenance et Évolutions

### Ajout de Nouveaux Champs

Pour ajouter de nouveaux champs au formulaire :

1. Mettre à jour l'interface `CreateCategoryDto` dans `src/types/index.ts`
2. Ajouter le champ dans le formulaire `form` reactive
3. Ajouter la validation dans `validateForm()`
4. Mettre à jour l'API endpoint si nécessaire

### Modification de la Validation

Pour modifier les règles de validation :

1. Éditer la fonction `validateForm()`
2. Ajouter les nouvelles règles de validation
3. Mettre à jour les messages d'erreur
4. Tester sur différents types de données

### Personnalisation du Style

Pour personnaliser l'apparence :

1. Modifier les classes Tailwind dans le template
2. Ajouter de nouveaux styles dans `src/style.css`
3. Utiliser les variables CSS personnalisées si nécessaire

## Tests

Le composant peut être testé de plusieurs façons :

1. **Tests unitaires** : Tester la logique de validation
2. **Tests d'intégration** : Tester l'interaction avec l'API
3. **Tests E2E** : Tester le flux complet de création
4. **Tests de responsive** : Vérifier l'adaptabilité sur différents écrans

## Dépannage

### Problèmes Courants

1. **Modal ne s'ouvre pas** : Vérifier que `v-if` est correctement configuré
2. **Validation ne fonctionne pas** : Vérifier les règles dans `validateForm()`
3. **API ne répond pas** : Vérifier la configuration de l'API et les endpoints
4. **Styles cassés** : Vérifier l'import de Tailwind CSS et les classes utilisées

### Logs de Débogage

Le composant inclut des logs de débogage pour faciliter le développement :

```javascript
console.error('Erreur lors de la création de la catégorie:', error)
```

Ces logs peuvent être activés/désactivés selon l'environnement.
