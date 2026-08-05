export interface ImageAnalysisResult {
  isValid: boolean;
  reason?: string;
}

/**
 * Valide une image de profil côté client (taille et type uniquement).
 */
export const analyzeProfileImage = async (imageFile: File): Promise<ImageAnalysisResult> => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

  if (!allowedTypes.includes(imageFile.type)) {
    return {
      isValid: false,
      reason: 'Format non supporté. Utilisez JPG, PNG, WEBP ou GIF.',
    };
  }

  if (imageFile.size > 2 * 1024 * 1024) {
    return {
      isValid: false,
      reason: 'L\'image ne doit pas dépasser 2 MB.',
    };
  }

  return { isValid: true };
};
