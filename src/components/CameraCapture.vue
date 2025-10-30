<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
    <div class="relative w-full h-full max-w-md mx-auto bg-black sm:rounded-lg sm:overflow-hidden">
      <!-- Header avec bouton fermer -->
      <div class="absolute top-0 left-0 right-0 z-10 flex justify-between items-center p-4 bg-gradient-to-b from-black/50 to-transparent">
        <h3 class="text-white font-medium">Prendre une photo</h3>
        <button
          @click="handleCancel"
          class="p-2 text-white hover:bg-white/20 rounded-full transition-colors"
        >
          <XMarkIcon class="w-6 h-6" />
        </button>
      </div>

      <!-- Zone de capture -->
      <div class="relative w-full h-full">
        <!-- Prévisualisation vidéo -->
        <video
          ref="videoRef"
          v-show="!capturedImage"
          class="w-full h-full object-cover"
          autoplay
          muted
          playsinline
        />

        <!-- Image capturée -->
        <canvas
          ref="canvasRef"
          class="hidden"
        />

        <!-- Image capturée affichée -->
        <div
          v-if="capturedImage"
          class="w-full h-full flex items-center justify-center bg-gray-900"
        >
          <img
            :src="capturedImage"
            alt="Photo capturée"
            class="max-w-full max-h-full object-contain"
          />
        </div>

        <!-- Message d'erreur -->
        <div
          v-if="error"
          class="absolute inset-0 flex items-center justify-center bg-black/75"
        >
          <div class="text-center text-white p-4">
            <ExclamationTriangleIcon class="w-12 h-12 mx-auto mb-4 text-red-400" />
            <p class="text-lg font-medium mb-2">Erreur d'accès à la caméra</p>
            <p class="text-sm text-gray-300 mb-4">{{ error }}</p>
            <button
              @click="startCamera"
              class="btn btn-primary"
            >
              Réessayer
            </button>
          </div>
        </div>

        <!-- Loading -->
        <div
          v-if="isLoading"
          class="absolute inset-0 flex items-center justify-center bg-black/75"
        >
          <div class="text-center text-white">
            <div class="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
            <p>Initialisation de la caméra...</p>
          </div>
        </div>
      </div>

      <!-- Contrôles en bas -->
      <div class="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/50 to-transparent">
        <div class="flex justify-center space-x-4">
          <!-- Bouton capture -->
          <button
            v-if="!capturedImage && !error"
            @click="capturePhoto"
            :disabled="isLoading"
            class="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            <CameraIcon class="w-8 h-8 sm:w-10 sm:h-10 text-gray-800" />
          </button>

          <!-- Boutons après capture -->
          <template v-if="capturedImage">
            <div class="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              <button
                @click="retakePhoto"
                class="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
              >
                Reprendre
              </button>
              <button
                @click="confirmCapture"
                class="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
              >
                Confirmer
              </button>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { XMarkIcon, CameraIcon, ExclamationTriangleIcon } from '@heroicons/vue/24/outline'

const emit = defineEmits<{
  captured: [file: File]
  cancel: []
}>()

// Refs
const videoRef = ref<HTMLVideoElement>()
const canvasRef = ref<HTMLCanvasElement>()

// État
const isLoading = ref(false)
const error = ref('')
const capturedImage = ref('')
const stream = ref<MediaStream>()

// Démarrer la caméra
const startCamera = async () => {
  isLoading.value = true
  error.value = ''
  capturedImage.value = ''

  try {
    // Demander l'accès à la caméra arrière sur mobile
    const constraints = {
      video: {
        facingMode: 'environment', // Caméra arrière
        width: { ideal: 1280 },
        height: { ideal: 720 }
      }
    }

    stream.value = await navigator.mediaDevices.getUserMedia(constraints)
    
    if (videoRef.value) {
      videoRef.value.srcObject = stream.value
    }
  } catch (err) {
    console.error('Erreur accès caméra:', err)
    error.value = 'Impossible d\'accéder à la caméra. Vérifiez les permissions.'
  } finally {
    isLoading.value = false
  }
}

// Capturer la photo
const capturePhoto = () => {
  if (!videoRef.value || !canvasRef.value) return

  const video = videoRef.value
  const canvas = canvasRef.value
  const context = canvas.getContext('2d')

  if (!context) return

  // Définir la taille du canvas
  canvas.width = video.videoWidth
  canvas.height = video.videoHeight

  // Dessiner l'image de la vidéo sur le canvas
  context.drawImage(video, 0, 0, canvas.width, canvas.height)

  // Convertir en blob JPEG
  canvas.toBlob((blob) => {
    if (blob) {
      // Créer une URL pour l'aperçu
      capturedImage.value = URL.createObjectURL(blob)
    }
  }, 'image/jpeg', 0.8) // Compression à 80%
}

// Reprendre la photo
const retakePhoto = () => {
  capturedImage.value = ''
  if (capturedImage.value) {
    URL.revokeObjectURL(capturedImage.value)
  }
}

// Confirmer la capture
const confirmCapture = () => {
  if (!canvasRef.value) return

  canvasRef.value.toBlob((blob) => {
    if (blob) {
      // Créer un fichier avec un nom de fichier approprié
      const file = new File([blob], `photo-${Date.now()}.jpg`, {
        type: 'image/jpeg'
      })
      
      emit('captured', file)
      
      // Nettoyer l'URL
      if (capturedImage.value) {
        URL.revokeObjectURL(capturedImage.value)
      }
    }
  }, 'image/jpeg', 0.8)
}

// Annuler
const handleCancel = () => {
  // Nettoyer l'URL
  if (capturedImage.value) {
    URL.revokeObjectURL(capturedImage.value)
  }
  emit('cancel')
}

// Nettoyer les ressources
const cleanup = () => {
  if (stream.value) {
    stream.value.getTracks().forEach(track => track.stop())
  }
  if (capturedImage.value) {
    URL.revokeObjectURL(capturedImage.value)
  }
}

// Lifecycle
onMounted(() => {
  startCamera()
})

onUnmounted(() => {
  cleanup()
})
</script>
