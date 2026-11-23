// @ts-check
import { defineConfig } from 'astro/config';
import { CANONICAL_SITE } from './src/lib/site.mjs';

// Dos destinos de despliegue:
// - GitHub Pages (por defecto): https://silverium.github.io/cuerpo/
// - Cloudflare Workers (DEPLOY_TARGET=cloudflare): https://cuerpo.soldeplata.dev/ (el canónico)
const cloudflare = process.env.DEPLOY_TARGET === 'cloudflare';

export default defineConfig({
  site: cloudflare ? CANONICAL_SITE : 'https://silverium.github.io',
  base: cloudflare ? '/' : '/cuerpo',
  trailingSlash: 'ignore',
  server: { port: 1983 },
});
