/**
 * Wrapper sécurisé pour localStorage avec gestion d'erreurs
 */

class Storage {
  private isAvailable(): boolean {
    try {
      const test = '__storage_test__'
      localStorage.setItem(test, test)
      localStorage.removeItem(test)
      return true
    } catch {
      return false
    }
  }

  getItem(key: string): string | null {
    if (!this.isAvailable()) {
      return null
    }

    try {
      return localStorage.getItem(key)
    } catch (error) {
      console.error(`Erreur lors de la lecture de ${key} depuis localStorage:`, error)
      return null
    }
  }

  setItem(key: string, value: string): boolean {
    if (!this.isAvailable()) {
      return false
    }

    try {
      localStorage.setItem(key, value)
      return true
    } catch (error) {
      // Gérer le cas où le quota est dépassé
      if (error instanceof DOMException && error.code === 22) {
        console.error('Quota de localStorage dépassé. Impossible de sauvegarder:', key)
      } else {
        console.error(`Erreur lors de l'écriture de ${key} dans localStorage:`, error)
      }
      return false
    }
  }

  removeItem(key: string): boolean {
    if (!this.isAvailable()) {
      return false
    }

    try {
      localStorage.removeItem(key)
      return true
    } catch (error) {
      console.error(`Erreur lors de la suppression de ${key} depuis localStorage:`, error)
      return false
    }
  }

  clear(): boolean {
    if (!this.isAvailable()) {
      return false
    }

    try {
      localStorage.clear()
      return true
    } catch (error) {
      console.error('Erreur lors du nettoyage de localStorage:', error)
      return false
    }
  }
}

export const storage = new Storage()
export default storage
