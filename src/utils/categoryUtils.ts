import type { Category } from '@/types'

/**
 * Interface pour une catégorie avec son niveau d'indentation
 */
export interface CategoryWithIndent {
  category: Category
  indentLevel: number
  displayText: string
}

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

/**
 * Construit une liste de catégories ordonnée hiérarchiquement avec indentation
 * pour l'affichage dans les listes déroulantes
 * 
 * @param allCategories - La liste complète des catégories
 * @returns Liste de catégories avec indentation, ordonnées hiérarchiquement
 */
export function getCategoriesWithIndent(
  allCategories: Category[] | undefined
): CategoryWithIndent[] {
  if (!allCategories || !allCategories.length) {
    return []
  }

  // Vérifier si l'API a déjà fourni l'arborescence avec children populés
  const hasAnyChildren = allCategories.some((c) => c.children && c.children.length > 0)
  
  let roots: Category[] = []
  
  if (hasAnyChildren) {
    // Si les enfants sont déjà populés, utiliser directement la structure
    roots = allCategories.filter((c) => !c.parentId && !c.parent)
  } else {
    // Sinon, construire l'arbre hiérarchique manuellement
    const idToNode = new Map<string, Category>()
    allCategories.forEach((c) => {
      idToNode.set(c.id, { ...c, children: [] })
    })

    const processed = new Set<string>()

    idToNode.forEach((node) => {
      if (processed.has(node.id)) return

      const parentId = node.parentId || node.parent?.id
      if (parentId) {
        const parent = idToNode.get(parentId)
        if (parent) {
          if (!parent.children) parent.children = []
          parent.children.push(node)
          processed.add(node.id)
        } else {
          // Parent introuvable, traiter comme racine
          roots.push(node)
          processed.add(node.id)
        }
      } else {
        roots.push(node)
        processed.add(node.id)
      }
    })
  }

  // Tri non mutant : retourne une copie triée (évite "target is readonly" avec Vue Query)
  const getSorted = (nodes: Category[]) =>
    [...nodes].sort((a, b) => a.name.localeCompare(b.name))

  // Parcourir l'arbre pour créer une liste plate avec indentation
  const result: CategoryWithIndent[] = []
  const indentChar = '\u00A0\u00A0' // Espaces non-break pour l'indentation

  const traverse = (node: Category, level: number, visited = new Set<string>()) => {
    // Éviter les références circulaires
    if (visited.has(node.id)) {
      return
    }
    visited.add(node.id)

    // Créer l'indentation visuelle
    const indent = level > 0 ? indentChar.repeat(level) + '└─ ' : ''
    result.push({
      category: node,
      indentLevel: level,
      displayText: `${indent}${node.name}`
    })

    // Parcourir les enfants récursivement (ordre trié, sans muter node.children)
    if (node.children && node.children.length > 0) {
      getSorted(node.children).forEach((child) => {
        traverse(child, level + 1, visited)
      })
    }
  }

  getSorted(roots).forEach((root) => {
    traverse(root, 0)
  })

  return result
}

