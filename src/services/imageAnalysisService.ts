declare global {
  interface Window {
    puter: {
      ai: {
        chat: (prompt: string, imageUrl: string, options: { model: string }) => Promise<string>;
      };
    };
  }
}

export interface ImageAnalysisResult {
  isValid: boolean;
  reason?: string;
}

export const analyzeProfileImage = async (imageFile: File): Promise<ImageAnalysisResult> => {
  try {
    // Convertir le fichier en base64
    const base64Image = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(imageFile);
    });
    
    const prompt = `Analyze this image and determine if it's suitable for a profile picture. Check if:
1. It shows a clear, identifiable human face
2. The image is not AI-generated
3. The image is clear and sharp
4. The person is clearly visible and identifiable
5. It's actually a human face (not an object, animal, or cartoon)

Respond with ONLY "valid" (lowercase) if all criteria are met, or "invalid: [reason]" (lowercase) if any criteria fails.`;

    const response = await window.puter.ai.chat(prompt, base64Image, {
      model: "gpt-5-nano"
    });

    console.log('Puter response:', response);

    // Extraire le contenu du message de la réponse Puter
    let content = '';
    if (typeof response === 'string') {
      content = response;
    } else if (response?.toString && typeof response.toString === 'function') {
      content = response.toString();
    } else if (response?.valueOf && typeof response.valueOf === 'function') {
      content = response.valueOf();
    } else if (response?.result?.message?.content) {
      content = response.result.message.content;
    } else if (response?.content) {
      content = response.content;
    } else {
      console.error('Format de réponse inattendu:', response);
      return { 
        isValid: false, 
        reason: 'Format de réponse inattendu de l\'IA' 
      };
    }

    const result = content.trim().toLowerCase();
    console.log('Extracted content:', content);
    console.log('Processed result:', result);
    
    // Vérifier si la réponse contient "valid" (accepter valid, VALID, Valid, etc.)
    if (result.includes('valid') && !result.includes('invalid')) {
      return { isValid: true };
    } else if (result.includes('invalid')) {
      const colonIndex = content.indexOf(':');
      const reason = colonIndex !== -1 ? content.substring(colonIndex + 1).trim() : 'Image non conforme aux critères';
      return { 
        isValid: false, 
        reason: reason
      };
    } else {
      return { 
        isValid: false, 
        reason: `Réponse inattendue: ${content}`
      };
    }
  } catch (error) {
    console.error('Erreur lors de l\'analyse d\'image:', error);
    return { 
      isValid: false, 
      reason: 'Erreur technique lors de l\'analyse' 
    };
  }
};