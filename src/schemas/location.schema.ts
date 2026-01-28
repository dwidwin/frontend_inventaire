import * as yup from 'yup'

export const locationSchema = yup.object({
  name: yup
    .string()
    .required('Le nom de l\'emplacement est obligatoire')
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(100, 'Le nom ne peut pas dépasser 100 caractères'),
  capacity: yup
    .number()
    .positive('La capacité doit être un nombre positif')
    .integer('La capacité doit être un nombre entier')
    .optional()
    .nullable(),
  notes: yup
    .string()
    .max(1000, 'Les notes ne peuvent pas dépasser 1000 caractères')
    .optional()
    .nullable(),
  parentId: yup
    .string()
    .uuid('ID parent invalide')
    .optional()
    .nullable(),
})

export type LocationFormValues = yup.InferType<typeof locationSchema>
