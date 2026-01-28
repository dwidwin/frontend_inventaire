import * as yup from 'yup'

export const userSchema = yup.object({
  username: yup
    .string()
    .required('Le nom d\'utilisateur est requis')
    .min(3, 'Le nom d\'utilisateur doit contenir au moins 3 caractères')
    .max(50, 'Le nom d\'utilisateur ne peut pas dépasser 50 caractères')
    .matches(/^[a-zA-Z0-9._-]+$/, 'Le nom d\'utilisateur ne peut contenir que des lettres, chiffres, points, tirets et underscores'),
  email: yup
    .string()
    .required('L\'adresse email est requise')
    .email('L\'adresse email n\'est pas valide')
    .max(255, 'L\'adresse email ne peut pas dépasser 255 caractères'),
  password: yup
    .string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Le mot de passe doit contenir au moins une minuscule, une majuscule, un chiffre et un caractère spécial'
    )
    .optional(),
  role: yup
    .string()
    .oneOf(['admin', 'manager', 'user'], 'Le rôle doit être admin, manager ou user')
    .optional(),
  isActive: yup
    .boolean()
    .optional(),
})

export const updateUserSchema = userSchema.omit(['password'])

export type UserFormValues = yup.InferType<typeof userSchema>
export type UpdateUserFormValues = yup.InferType<typeof updateUserSchema>
