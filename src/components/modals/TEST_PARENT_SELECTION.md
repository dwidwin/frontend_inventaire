# Test de Sélection Automatique de la Catégorie Parente

## Problème Identifié

Lors de l'ouverture d'une catégorie en mode édition, le select de la catégorie parente n'était pas automatiquement sélectionné avec la bonne valeur.

## Solution Implémentée

### Ajout d'un Watcher pour les Catégories

```javascript
// Réinitialiser le formulaire quand les catégories sont chargées
watch(() => categories.value, () => {
  if (categories.value && props.category) {
    // Réinitialiser seulement le parentId pour s'assurer qu'il est correctement sélectionné
    form.parentId = props.category.parentId || ''
    console.log('Catégorie parente sélectionnée:', form.parentId, 'pour la catégorie:', props.category.name)
  }
}, { immediate: true })
```

### Logique de Sélection

1. **Au montage du composant** : `initializeForm()` est appelé
2. **Quand la catégorie change** : `initializeForm()` est appelé
3. **Quand les catégories sont chargées** : Le `parentId` est réinitialisé

## Comportement Attendu

### Scénario 1: Catégorie Racine
- **Catégorie**: `{ id: "1", name: "Matériel", parentId: null }`
- **Select affiché**: "Aucune (catégorie racine)" sélectionné
- **Valeur**: `""`

### Scénario 2: Sous-catégorie
- **Catégorie**: `{ id: "2", name: "Textiles", parentId: "1" }`
- **Select affiché**: "Matériel" sélectionné
- **Valeur**: `"1"`

### Scénario 3: Sous-sous-catégorie
- **Catégorie**: `{ id: "3", name: "T-shirts", parentId: "2" }`
- **Select affiché**: "Matériel → Textiles" sélectionné
- **Valeur**: `"2"`

## Test Manuel

1. Ouvrir une catégorie existante en mode édition
2. Vérifier que le select de la catégorie parente est correctement sélectionné
3. Vérifier dans la console que le log affiche la bonne sélection
4. Modifier la catégorie parente et sauvegarder
5. Rouvrir la catégorie et vérifier que la nouvelle sélection est correcte

## Logs de Débogage

Un log de débogage a été ajouté pour vérifier la sélection :

```javascript
console.log('Catégorie parente sélectionnée:', form.parentId, 'pour la catégorie:', props.category.name)
```

Ce log affichera :
- `Catégorie parente sélectionnée: "" pour la catégorie: Matériel` (catégorie racine)
- `Catégorie parente sélectionnée: "1" pour la catégorie: Textiles` (sous-catégorie)

## Notes Techniques

- Le watcher se déclenche quand `categories.value` change (données chargées)
- La sélection se fait seulement si `props.category` existe (mode édition)
- La valeur `parentId` est réinitialisée même si elle était déjà correcte
- Le watcher utilise `{ immediate: true }` pour se déclencher immédiatement
