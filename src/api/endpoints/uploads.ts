import { apiUpload } from '@/api/client'

export const uploadsApi = {
  // Upload image principale pour un modèle
  uploadModelImage: (modelId: string, file: File): Promise<{ url: string; modelId: string }> => {
    const formData = new FormData()
    formData.append('file', file)
    return apiUpload<{ url: string; modelId: string }>(`/api/uploads/model/${modelId}`, formData)
  },

  // Upload photo pour un modèle
  uploadModelPhoto: (modelId: string, file: File): Promise<{ url: string; modelId: string }> => {
    const formData = new FormData()
    formData.append('file', file)
    return apiUpload<{ url: string; modelId: string }>(`/api/uploads/model/${modelId}/photo`, formData)
  },
}
