import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import Icons from 'unplugin-icons/vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Icônes Iconify compilées AU BUILD en composants SVG.
    // Le composant <Icon> de @iconify/react télécharge sinon chaque jeu depuis
    // api.iconify.design à l'exécution : dépendance réseau tierce et icônes qui
    // apparaissent après coup. Ici, seules les icônes importées sont embarquées.
    Icons({ compiler: 'jsx', jsx: 'react', autoInstall: false }),
  ],
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
