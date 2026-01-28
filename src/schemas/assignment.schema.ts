import * as yup from 'yup'

export const assignmentSchema = yup.object({
  modelId: yup
    .string()
    .uuid('ID de modèle invalide')
    .required('Le modèle est obligatoire'),
  userId: yup
    .string()
    .uuid('ID d\'utilisateur invalide')
    .optional()
    .nullable(),
  teamId: yup
    .string()
    .uuid('ID d\'équipe invalide')
    .optional()
    .nullable(),
  startAt: yup
    .date()
    .required('La date de début est obligatoire'),
  notes: yup
    .string()
    .max(1000, 'Les notes ne peuvent pas dépasser 1000 caractères')
    .optional()
    .nullable(),
}).test(
  'user-or-team',
  'Soit un utilisateur, soit une équipe doit être sélectionné',
  function(value) {
    return !!(value.userId || value.teamId)
  }
)

export type AssignmentFormValues = yup.InferType<typeof assignmentSchema>
