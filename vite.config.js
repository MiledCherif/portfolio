import { defineConfig } from 'vite';
// Publié sur GitHub Pages à l'adresse /portfolio/
export default defineConfig({ base: process.env.BASE ?? '/portfolio/' });
