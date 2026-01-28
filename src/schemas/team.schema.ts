import * as yup from 'yup'

export const teamSchema = yup.object({
  name: yup
    .string()
    .required('Le nom de l\'équipe est obligatoire')
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(100, 'Le nom ne peut pas dépasser 100 caractères'),
  categoryAge: yup
    .string()
    .max(50, 'La catégorie d\'âge ne peut pas dépasser 50 caractères')
    .optional()
    .nullable(),
  level: yup
    .string()
    .max(50, 'Le niveau ne peut pas dépasser 50 caractères')
    .optional()
    .nullable(),
})

export type TeamFormValues = yup.InferType<typeof teamSchema>
