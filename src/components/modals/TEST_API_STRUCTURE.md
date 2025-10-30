# Test avec la Vraie Structure de l'API

## Structure de Données de l'API

L'API renvoie les catégories avec cette structure :

```json
{
  "id": "868cd6e9-ad3a-48c0-8ff8-1a56b8b36983",
  "name": "Boissons",
  "description": null,
  "parent": {
    "id": "828bb1bb-3ba4-47d0-92f8-25646b6929ef",
    "name": "🍴 Buvette",
    "description": "Tout ce qui concerne la buvette",
    "createdAt": "2025-10-30T16:35:03.012Z",
    "updatedAt": "2025-10-30T16:53:18.000Z"
  },
  "children": [],
  "createdAt": "2025-10-30T16:50:09.514Z",
  "updatedAt": "2025-10-30T16:50:09.514Z"
}
```

## Problème Identifié

Le formulaire cherchait `props.category.parentId` mais l'API renvoie `props.category.parent.id`.

## Solution Implémentée

### Avant (Incorrect)
```javascript
form.parentId = props.category.parentId || ''  // ❌ parentId n'existe pas
```

### Après (Corrigé)
```javascript
form.parentId = props.category.parent?.id || ''  // ✅ Utilise parent.id
```

## Tests avec les Données Réelles

### Test 1: Catégorie "Boissons"
- **Données API**: `parent: { id: "828bb1bb-3ba4-47d0-92f8-25646b6929ef", name: "🍴 Buvette" }`
- **Résultat attendu**: Select sur "🍴 Buvette"
- **Valeur**: `"828bb1bb-3ba4-47d0-92f8-25646b6929ef"`

### Test 2: Catégorie "Matériel"
- **Données API**: `parent: null`
- **Résultat attendu**: Select sur "Aucune (catégorie racine)"
- **Valeur**: `""`

### Test 3: Catégorie "Textiles"
- **Données API**: `parent: null`
- **Résultat attendu**: Select sur "Aucune (catégorie racine)"
- **Valeur**: `""`

## Logs de Débogage Attendus

```
Catégorie parente sélectionnée: "828bb1bb-3ba4-47d0-92f8-25646b6929ef" pour la catégorie: Boissons
Catégorie parente sélectionnée: "" pour la catégorie: Matériel
Catégorie parente sélectionnée: "" pour la catégorie: Textiles
```

## Vérification Manuelle

1. Ouvrir la catégorie "Boissons" en mode édition
2. Vérifier que le select affiche "🍴 Buvette" sélectionné
3. Vérifier dans la console que le log affiche l'ID correct
4. Ouvrir la catégorie "Matériel" en mode édition
5. Vérifier que le select affiche "Aucune (catégorie racine)" sélectionné

## Notes Techniques

- Utilisation de l'opérateur de chaînage optionnel `?.` pour éviter les erreurs
- La logique fonctionne pour les catégories avec et sans parent
- Le mapping est cohérent dans `initializeForm()` et le watcher
