import type { Location } from '@/types'

/**
 * Interface pour un emplacement avec son niveau d'indentation
 */
export interface LocationWithIndent {
  location: Location
  indentLevel: number
  displayText: string
}

/**
 * Construit le chemin hiérarchique complet d'un emplacement
 * en remontant jusqu'à la racine
 * 
 * @param location - L'emplacement pour lequel construire le chemin
 * @param allLocations - La liste complète des emplacements
 * @returns Une chaîne formatée : "Emplacement → Sous-emplacement → Sous-sous-emplacement"
 */
export function getLocationHierarchyPath(
  location: Location,
  allLocations: Location[] | undefined
): string {
  if (!location || !allLocations || !allLocations.length) {
    return location?.name || ''
  }

  // Fonction récursive pour remonter la hiérarchie
  const buildPath = (loc: Location, visited = new Set<string>()): Location[] => {
    // Protection contre les références circulaires
    if (visited.has(loc.id)) {
      return []
    }
    visited.add(loc.id)

    const path: Location[] = [loc]

    // Chercher le parent soit via parentId, soit via la référence parent imbriquée
    let parentId = loc.parentId || loc.parent?.id

    if (parentId) {
      const parent = allLocations.find(l => l.id === parentId)
      if (parent) {
        const parentPath = buildPath(parent, visited)
        return [...parentPath, ...path]
      }
    }

    return path
  }

  const hierarchy = buildPath(location)

  // Retourner la chaîne formatée avec le séparateur " → "
  return hierarchy.map(l => l.name).join(' → ')
}

/**
 * Construit une liste d'emplacements ordonnée hiérarchiquement avec indentation
 * pour l'affichage dans les listes déroulantes
 * 
 * @param allLocations - La liste complète des emplacements
 * @returns Liste d'emplacements avec indentation, ordonnée hiérarchiquement
 */
export function getLocationsWithIndent(
  allLocations: Location[] | undefined
): LocationWithIndent[] {
  if (!allLocations || !allLocations.length) {
    return []
  }

  // Vérifier si l'API a déjà fourni l'arborescence avec children populés
  const hasAnyChildren = allLocations.some((l) => l.children && l.children.length > 0)
  
  let roots: Location[] = []
  
  if (hasAnyChildren) {
    // Si les enfants sont déjà populés, utiliser directement la structure
    roots = allLocations.filter((l) => !l.parentId && !l.parent)
  } else {
    // Sinon, construire l'arbre hiérarchique manuellement
    const idToNode = new Map<string, Location>()
    allLocations.forEach((l) => {
      idToNode.set(l.id, { ...l, children: [] })
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

  // Trier récursivement
  const sortDeep = (nodes: Location[]) => {
    nodes.sort((a, b) => a.name.localeCompare(b.name))
    nodes.forEach((n) => n.children && n.children.length > 0 && sortDeep(n.children))
  }
  sortDeep(roots)

  // Parcourir l'arbre pour créer une liste plate avec indentation
  const result: LocationWithIndent[] = []
  const indentChar = '\u00A0\u00A0' // Espaces non-break pour l'indentation

  const traverse = (node: Location, level: number, visited = new Set<string>()) => {
    // Éviter les références circulaires
    if (visited.has(node.id)) {
      return
    }
    visited.add(node.id)

    // Créer l'indentation visuelle
    const indent = level > 0 ? indentChar.repeat(level) + '└─ ' : ''
    result.push({
      location: node,
      indentLevel: level,
      displayText: `${indent}${node.name}`
    })

    // Parcourir les enfants récursivement
    if (node.children && node.children.length > 0) {
      sortDeep(node.children)
      node.children.forEach((child) => {
        traverse(child, level + 1, visited)
      })
    }
  }

  roots.forEach((root) => {
    traverse(root, 0)
  })

  return result
}

/**
 * Construit l'arbre hiérarchique des emplacements à partir d'une liste plate
 * 
 * @param allLocations - La liste complète des emplacements
 * @returns Liste des emplacements racines avec leurs enfants
 */
export function buildLocationTree(
  allLocations: Location[] | undefined
): Location[] {
  if (!allLocations || !allLocations.length) {
    return []
  }

  // Vérifier si l'API a déjà fourni l'arborescence avec children populés
  const hasAnyChildren = allLocations.some((l) => l.children && l.children.length > 0)
  
  if (hasAnyChildren) {
    // Si les enfants sont déjà populés, utiliser directement la structure
    const roots = allLocations.filter((l) => !l.parentId && !l.parent)
    
    // Trier récursivement
    const sortDeep = (nodes: Location[]) => {
      nodes.sort((a, b) => a.name.localeCompare(b.name))
      nodes.forEach((n) => n.children && sortDeep(n.children || []))
    }
    sortDeep(roots)
    
    return roots
  }

  // Sinon, construire l'arbre hiérarchique manuellement
  const idToNode = new Map<string, Location>()
  allLocations.forEach((l) => {
    idToNode.set(l.id, { ...l, children: [] })
  })

  const roots: Location[] = []
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

  // Trier récursivement
  const sortDeep = (nodes: Location[]) => {
    nodes.sort((a, b) => a.name.localeCompare(b.name))
    nodes.forEach((n) => n.children && sortDeep(n.children || []))
  }
  sortDeep(roots)

  return roots
}

