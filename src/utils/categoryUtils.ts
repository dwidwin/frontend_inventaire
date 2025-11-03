import type { Category } from '@/types'

/**
 * Construit le chemin hiérarchique complet d'une catégorie
 * en remontant jusqu'à la racine
 * 
 * @param category - La catégorie pour laquelle construire le chemin
 * @param allCategories - La liste complète des catégories
 * @returns Une chaîne formatée : "Catégorie → Sous-catégorie → Sous-sous-catégorie"
 */
export function getCategoryHierarchyPath(
  category: Category,
  allCategories: Category[] | undefined
): string {
  if (!category || !allCategories || !allCategories.length) {
    return category?.name || ''
  }

  // Fonction récursive pour remonter la hiérarchie
  const buildPath = (cat: Category, visited = new Set<string>()): Category[] => {
    // Protection contre les références circulaires
    if (visited.has(cat.id)) {
      return []
    }
    visited.add(cat.id)

    const path: Category[] = [cat]

    // Chercher le parent soit via parentId, soit via la référence parent imbriquée
    let parentId = cat.parentId || cat.parent?.id

    if (parentId) {
      const parent = allCategories.find(c => c.id === parentId)
      if (parent) {
        const parentPath = buildPath(parent, visited)
        return [...parentPath, ...path]
      }
    }

    return path
  }

  const hierarchy = buildPath(category)

  // Retourner la chaîne formatée avec le séparateur " → "
  return hierarchy.map(c => c.name).join(' → ')
}

