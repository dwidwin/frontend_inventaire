import * as yup from 'yup'
import { StatusGroup } from '@/types'

export const statusSchema = yup.object({
  key: yup
    .string()
    .required('La clé du statut est obligatoire')
    .min(2, 'La clé doit contenir au moins 2 caractères')
    .max(50, 'La clé ne peut pas dépasser 50 caractères')
    .matches(/^[a-z0-9_-]+$/, 'La clé ne peut contenir que des lettres minuscules, chiffres, tirets et underscores'),
  label: yup
    .string()
    .required('Le libellé du statut est obligatoire')
    .min(2, 'Le libellé doit contenir au moins 2 caractères')
    .max(100, 'Le libellé ne peut pas dépasser 100 caractères'),
  group: yup
    .string()
    .oneOf<StatusGroup>(['commercial', 'audience', 'condition', 'lifecycle'], 'Le groupe doit être commercial, audience, condition ou lifecycle')
    .required('Le groupe est obligatoire'),
  color: yup
    .string()
    .matches(/^#[0-9A-Fa-f]{6}$/, 'La couleur doit être au format hexadécimal (#RRGGBB)')
    .optional()
    .nullable(),
  isActive: yup
    .boolean()
    .optional(),
  sortOrder: yup
    .number()
    .integer('L\'ordre de tri doit être un nombre entier')
    .min(0, 'L\'ordre de tri doit être positif ou nul')
    .optional(),
})

export type StatusFormValues = yup.InferType<typeof statusSchema>
