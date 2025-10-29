import { apiUpload } from '@/api/client'

export const uploadsApi = {
  // Upload image pour un modèle
  uploadModelImage: (modelId: string, file: File): Promise<{ imageUrl: string }> => {
    const formData = new FormData()
    formData.append('file', file)
    return apiUpload<{ imageUrl: string }>(`/api/uploads/model/${modelId}`, formData)
  },

  // Upload photo pour un item
  uploadItemImage: (itemId: string, file: File): Promise<{ imageUrl: string }> => {
    const formData = new FormData()
    formData.append('file', file)
    return apiUpload<{ imageUrl: string }>(`/api/uploads/item/${itemId}`, formData)
  },
}
