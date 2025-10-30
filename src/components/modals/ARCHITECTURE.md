# Architecture du Formulaire de Création de Catégorie

## Diagramme de l'Architecture

```mermaid
graph TB
    A[CreateCategoryModal.vue] --> B[Template Responsive]
    A --> C[Script Logic]
    A --> D[Style Classes]
    
    B --> E[Header avec titre et bouton fermer]
    B --> F[Formulaire avec champs]
    B --> G[Footer avec boutons d'action]
    
    F --> H[Champ Nom - Obligatoire]
    F --> I[Champ Description - Optionnel]
    F --> J[Select Catégorie Parente]
    F --> K[Aperçu Hiérarchie]
    
    C --> L[useCategories Hook]
    C --> M[useCreateCategory Hook]
    C --> N[Validation Logic]
    C --> O[Form State Management]
    
    L --> P[API Categories]
    M --> Q[API Create Category]
    
    N --> R[Validation Nom]
    N --> S[Validation Longueur]
    
    O --> T[Reactive Form Data]
    O --> U[Error State]
    O --> V[Loading State]
    
    D --> W[Tailwind CSS Classes]
    D --> X[Custom Form Styles]
    D --> Y[Responsive Utilities]
    
    W --> Z[btn, form-input, form-label]
    X --> AA[form-error, card styles]
    Y --> BB[mobile-first, sm:, lg:]
```

## Flux de Données

```mermaid
sequenceDiagram
    participant U as User
    participant M as Modal
    participant V as Validation
    participant A as API
    participant C as Cache
    
    U->>M: Ouvre le modal
    M->>A: Récupère les catégories existantes
    A-->>M: Retourne la liste des catégories
    
    U->>M: Saisit le nom de la catégorie
    M->>V: Valide en temps réel
    V-->>M: Retourne l'état de validation
    
    U->>M: Sélectionne une catégorie parente
    M->>M: Met à jour l'aperçu hiérarchique
    
    U->>M: Clique sur "Créer"
    M->>V: Valide le formulaire complet
    V-->>M: Validation OK
    
    M->>A: Envoie la requête de création
    A-->>M: Retourne la catégorie créée
    M->>C: Invalide le cache des catégories
    M->>U: Affiche le succès et ferme le modal
```

## Structure des Composants

```mermaid
graph LR
    A[CreateCategoryModal] --> B[Header Section]
    A --> C[Form Section]
    A --> D[Footer Section]
    
    B --> E[Title]
    B --> F[Close Button]
    
    C --> G[Name Input]
    C --> H[Description Textarea]
    C --> I[Parent Select]
    C --> J[Hierarchy Preview]
    
    D --> K[Cancel Button]
    D --> L[Create Button]
    
    G --> M[Validation Error]
    I --> N[Category Options]
    J --> O[Visual Hierarchy Tree]
```

## Responsive Design

```mermaid
graph TB
    A[Screen Size] --> B{Mobile < 640px}
    A --> C{Tablet 640px - 1024px}
    A --> D{Desktop > 1024px}
    
    B --> E[Vertical Layout]
    B --> F[Full Width Buttons]
    B --> G[Stacked Elements]
    
    C --> H[Adaptive Layout]
    C --> I[Mixed Button Sizes]
    C --> J[Flexible Grid]
    
    D --> K[Horizontal Layout]
    D --> L[Compact Buttons]
    D --> M[Optimized Spacing]
    
    E --> N[px-4 py-4]
    F --> O[w-full sm:w-auto]
    G --> P[space-y-4]
```

## Gestion des États

```mermaid
stateDiagram-v2
    [*] --> Closed
    Closed --> Open: User clicks create button
    Open --> Validating: User types in form
    Validating --> Valid: Form is valid
    Validating --> Invalid: Form has errors
    Valid --> Submitting: User clicks create
    Submitting --> Success: API call succeeds
    Submitting --> Error: API call fails
    Success --> Closed: Modal closes
    Error --> Open: User can retry
    Invalid --> Open: User can fix errors
    Open --> Closed: User clicks cancel/close
```

## Intégration avec l'Écosystème

```mermaid
graph TB
    A[CreateCategoryModal] --> B[Vue 3 Composition API]
    A --> C[Vue Query]
    A --> D[Tailwind CSS]
    A --> E[TypeScript]
    
    B --> F[Reactive State]
    B --> G[Computed Properties]
    B --> H[Event Handling]
    
    C --> I[useCategories Query]
    C --> J[useCreateCategory Mutation]
    C --> K[Cache Invalidation]
    
    D --> L[Utility Classes]
    D --> M[Responsive Design]
    D --> N[Component Styles]
    
    E --> O[Type Safety]
    E --> P[Interface Definitions]
    E --> Q[Error Handling]
```

## Points d'Extension

Le formulaire est conçu pour être facilement extensible :

1. **Nouveaux champs** : Ajouter dans `form` reactive et `CreateCategoryDto`
2. **Nouvelles validations** : Étendre la fonction `validateForm()`
3. **Nouveaux styles** : Utiliser les classes Tailwind existantes
4. **Nouvelles fonctionnalités** : Ajouter des computed properties et méthodes

## Performance

- **Lazy loading** : Le modal ne se charge que quand nécessaire
- **Validation optimisée** : Validation en temps réel sans surcharge
- **Cache intelligent** : Utilisation de Vue Query pour la gestion du cache
- **Rendu minimal** : Seuls les éléments nécessaires sont rendus
