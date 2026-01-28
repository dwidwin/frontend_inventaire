import * as yup from 'yup'

export const modelSchema = yup.object({
  name: yup
    .string()
    .required('Le nom du modèle est obligatoire')
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(200, 'Le nom ne peut pas dépasser 200 caractères'),
  categoryIds: yup
    .array()
    .of(yup.string().uuid('ID de catégorie invalide'))
    .min(1, 'Au moins une catégorie doit être sélectionnée')
    .required('Les catégories sont obligatoires'),
  locationId: yup
    .string()
    .uuid('ID d\'emplacement invalide')
    .optional()
    .nullable(),
  codeBarre: yup
    .string()
    .max(100, 'Le code-barres ne peut pas dépasser 100 caractères')
    .optional()
    .nullable(),
  etat: yup
    .string()
    .max(50, 'L\'état ne peut pas dépasser 50 caractères')
    .optional()
    .nullable(),
  referenceFournisseur: yup
    .string()
    .max(100, 'La référence fournisseur ne peut pas dépasser 100 caractères')
    .optional()
    .nullable(),
  description: yup
    .string()
    .max(2000, 'La description ne peut pas dépasser 2000 caractères')
    .optional()
    .nullable(),
  photoUrl: yup
    .string()
    .url('L\'URL de la photo n\'est pas valide')
    .optional()
    .nullable(),
})

export type ModelFormValues = yup.InferType<typeof modelSchema>
