import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    // Les drapeaux (sélecteur d'indicatif téléphonique) restent des fichiers
    // séparés : inlinés en base64 ils ajoutaient ~250 ko au bundle principal
    // pour tout le monde, alors que seuls les drapeaux affichés sont utiles.
    assetsInlineLimit: (filePath) => {
      if (filePath.includes('flag-icons')) return false;
      return undefined;
    },
  },
  server: {
    host: '0.0.0.0'
  }
});
