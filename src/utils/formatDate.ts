import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

export const formatDate = (date: string | Date, formatString: string = 'dd/MM/yyyy HH:mm') => {
  return format(new Date(date), formatString, { locale: fr })
}

export const formatDateShort = (date: string | Date) => {
  return format(new Date(date), 'dd/MM/yyyy', { locale: fr })
}

export const formatDateTime = (date: string | Date) => {
  return format(new Date(date), 'dd/MM/yyyy HH:mm', { locale: fr })
}
