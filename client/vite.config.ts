import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      base: "/",
      server: {
        port: 3000,
        host: true,
      },
      plugins: [react()],
      css: {
        postcss: {
          plugins: [
            tailwindcss({
              content: [
                "./index.html",
                "./src/**/*.{js,ts,jsx,tsx}",
              ],
              theme: {
                extend: {
                  fontFamily: {
                    sans: ['Plus Jakarta Sans', 'sans-serif'],
                  },
                },
              },
              plugins: [],
            }),
            autoprefixer(),
          ],
        },
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, 'src'),
        }
      }
    };
});
