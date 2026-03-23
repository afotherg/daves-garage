import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('three/examples/jsm/controls')) {
            return 'controls';
          }

          if (id.includes('/three/')) {
            return 'three';
          }

          if (id.includes('/cannon-es/')) {
            return 'physics';
          }

          if (id.includes('/lil-gui/')) {
            return 'ui';
          }

          return undefined;
        },
      },
    },
  },
});
