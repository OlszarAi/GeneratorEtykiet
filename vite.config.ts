import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/GeneratorEtykiet",
  optimizeDeps: {
    include: ['lucide-react', 'qrcode', 'qrcode.react', 'jspdf', 'html2canvas', 'uuid'],
  },
  build: {
    sourcemap: true,
    commonjsOptions: {
      include: [/node_modules/],
    },
  },
});