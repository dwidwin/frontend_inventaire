import * as yup from 'yup'

export const categorySchema = yup.object({
  name: yup
    .string()
    .required('Le nom de la catégorie est obligatoire')
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(100, 'Le nom ne peut pas dépasser 100 caractères'),
  description: yup
    .string()
    .max(500, 'La description ne peut pas dépasser 500 caractères')
    .optional(),
  parentId: yup
    .string()
    .uuid('ID parent invalide')
    .optional()
    .nullable(),
})

export type CategoryFormValues = yup.InferType<typeof categorySchema>
