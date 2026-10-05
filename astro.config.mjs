import { defineConfig } from 'astro/config';
import alpinejs  from '@astrojs/alpinejs';
import sitemap   from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { satteri } from '@astrojs/markdown-satteri';
import { postMediaPlugin } from './src/plugins/post-media.mjs';

// Serwer deweloperski Astro nie serwuje public/admin/index.html pod /admin/
// (GitHub Pages robi to sam) — przepisujemy adres tylko w trybie dev.
const adminIndexInDev = {
  name: 'admin-index-in-dev',
  configureServer(server) {
    server.middlewares.use((req, _res, next) => {
      if (req.url === '/admin' || req.url === '/admin/') req.url = '/admin/index.html';
      next();
    });
  },
};

export default defineConfig({
  site: 'https://www.riversidegdansk.pl',
  integrations: [
  alpinejs(),
  sitemap({
    filter: (page) =>
      !page.includes('/privacy/') &&
      !page.includes('/offline/')
  }),
],
  image: {
    domains: ['res.cloudinary.com'],
  },
  markdown: {
    processor: satteri({ mdastPlugins: [postMediaPlugin] }),
  },
  output: 'static',
  vite: {
  server: {
    open: '/',
  },
  plugins: [tailwindcss(), adminIndexInDev],
},
});
