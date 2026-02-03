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

  // Tri non mutant : retourne une copie triée (évite "target is readonly" avec Vue Query)
  const getSorted = (nodes: Location[]) =>
    [...nodes].sort((a, b) => a.name.localeCompare(b.name))

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
    // Si les enfants sont déjà populés, cloner l'arbre puis trier le clone
    // (les données Vue Query sont readonly, on ne peut pas muter en place)
    const roots = allLocations.filter((l) => !l.parentId && !l.parent)
    const cloneTree = (nodes: Location[]): Location[] =>
      [...nodes].sort((a, b) => a.name.localeCompare(b.name)).map((n) => ({
        ...n,
        children: n.children?.length ? cloneTree(n.children) : n.children
      }))
    return cloneTree(roots)
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

  // Trier récursivement (roots est construit par nous, donc mutable)
  const sortDeep = (nodes: Location[]) => {
    nodes.sort((a, b) => a.name.localeCompare(b.name))
    nodes.forEach((n) => n.children && sortDeep(n.children || []))
  }
  sortDeep(roots)

  return roots
}

/**
 * Construit le chemin parent-enfant d'un emplacement
 * au format "emplacement parent - emplacement enfant"
 * 
 * @param location - L'emplacement pour lequel construire le chemin
 * @param allLocations - La liste complète des emplacements
 * @returns Une chaîne formatée : "Parent - Enfant" ou juste "Enfant" s'il n'y a pas de parent
 */
export function getLocationParentChildPath(
  location: Location | undefined,
  allLocations: Location[] | undefined
): string {
  if (!location) {
    return 'Non localisé'
  }

  if (!allLocations || !allLocations.length) {
    return location.name
  }

  // Résoudre l'emplacement complet depuis la liste (l'API peut renvoyer location sans parentId sur le modèle)
  const fullLocation = allLocations.find(l => l.id === location.id) || location
  const parentId = fullLocation.parentId || fullLocation.parent?.id

  if (parentId) {
    const parent = allLocations.find(l => l.id === parentId)
    if (parent) {
      return `${parent.name} - ${location.name}`
    }
  }

  // Pas de parent trouvé, retourner juste le nom de l'emplacement
  return location.name
}

/**
 * Retourne l'ID d'un emplacement et tous les IDs de ses sous-emplacements (récursif).
 * Utile pour filtrer par emplacement "parent" et inclure tous les modèles des enfants.
 *
 * @param locationId - ID de l'emplacement parent
 * @param allLocations - Liste complète des emplacements (plate, avec parentId)
 * @returns Tableau d'IDs : [locationId, ...ids des descendants]
 */
export function getLocationIdsIncludingDescendants(
  locationId: string,
  allLocations: Location[] | undefined
): string[] {
  if (!locationId || !allLocations?.length) {
    return locationId ? [locationId] : []
  }

  const byParent = new Map<string, Location[]>()
  for (const loc of allLocations) {
    const pid = loc.parentId ?? loc.parent?.id ?? ''
    if (!byParent.has(pid)) byParent.set(pid, [])
    byParent.get(pid)!.push(loc)
  }

  const result: string[] = []
  const collect = (id: string) => {
    result.push(id)
    const children = byParent.get(id) ?? []
    for (const child of children) {
      collect(child.id)
    }
  }
  collect(locationId)
  return result
}






