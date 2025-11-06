import { format, isValid } from 'date-fns'
import { fr } from 'date-fns/locale'

// Fonction utilitaire pour valider et formater une date de manière sécurisée
const safeFormatDate = (date: string | Date | null | undefined, formatString: string): string => {
  if (!date) {
    return 'Date inconnue'
  }
  
  const dateObj = new Date(date)
  if (!isValid(dateObj)) {
    return 'Date inconnue'
  }
  
  try {
    return format(dateObj, formatString, { locale: fr })
  } catch (error) {
    console.warn('Erreur lors du formatage de la date:', error)
    return 'Date inconnue'
  }
}

// Format par défaut : dd-MM-yyyy (sans heure)
export const formatDate = (date: string | Date | null | undefined) => {
  return safeFormatDate(date, 'dd-MM-yyyy')
}

// Format court : dd-MM-yyyy (sans heure) - alias pour formatDate
export const formatDateShort = (date: string | Date | null | undefined) => {
  return safeFormatDate(date, 'dd-MM-yyyy')
}

// Format avec heure : dd-MM-yyyy HH:mm (pour historique)
export const formatDateTime = (date: string | Date | null | undefined) => {
  return safeFormatDate(date, 'dd-MM-yyyy HH:mm')
}

// Format avec jour de la semaine : EEEE dd-MM-yyyy HH:mm (pour historique détaillé)
export const formatDateTimeWithDay = (date: string | Date | null | undefined) => {
  return safeFormatDate(date, 'EEEE dd-MM-yyyy HH:mm')
}