// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://christoph.roennecke.eu',
  integrations: [sitemap()],
  trailingSlash: 'always',
});
