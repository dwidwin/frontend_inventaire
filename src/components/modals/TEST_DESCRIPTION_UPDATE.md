# Test de Mise à Jour de Description Vide

## Problème Identifié

Lors de la modification d'une catégorie, si l'utilisateur supprime le contenu du champ description, la requête PATCH n'incluait pas le champ `description`, empêchant la mise à jour.

## Solution Implémentée

### Avant (Problématique)
```javascript
const updateData: UpdateCategoryDto = {
  name: form.name.trim(),
  description: form.description.trim() || undefined, // ❌ undefined exclut le champ
  parentId: form.parentId || undefined
}
```

### Après (Corrigé)
```javascript
const updateData: UpdateCategoryDto = {
  name: form.name.trim(),
  description: form.description.trim(), // ✅ Toujours inclus, même si vide
  parentId: form.parentId || null
}
```

## Comportement Attendu

### Scénario 1: Description avec contenu
- **Input**: `"Description de la catégorie"`
- **Output**: `{"name": "Matériel", "description": "Description de la catégorie", "parentId": null}`

### Scénario 2: Description vide (supprimée)
- **Input**: `""` (champ vide)
- **Output**: `{"name": "Matériel", "description": "", "parentId": null}`

### Scénario 3: Description non définie (création)
- **Input**: `undefined` (pas de description)
- **Output**: `{"name": "Matériel", "parentId": null}` (description exclue)

## Test Manuel

1. Ouvrir une catégorie existante en mode édition
2. Supprimer tout le contenu du champ description
3. Cliquer sur "Modifier la catégorie"
4. Vérifier dans la console que la requête contient `"description": ""`
5. Vérifier que la catégorie est mise à jour avec une description vide

## Logs de Débogage

Un log de débogage a été ajouté pour vérifier les données envoyées :

```javascript
console.log('Données de mise à jour envoyées:', updateData)
```

Ce log affichera :
- `{"name": "Matériel", "description": "", "parentId": null}` pour une description vide
- `{"name": "Matériel", "description": "Texte", "parentId": null}` pour une description avec contenu

## Notes Techniques

- Le champ `description` est maintenant toujours inclus dans les requêtes de mise à jour
- Seul `parentId` peut être `null` (pour les catégories racines)
- La logique de création reste inchangée (peut exclure la description si non définie)
