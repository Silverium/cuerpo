// @ts-check
import { defineConfig } from 'astro/config';

// Dos destinos de despliegue:
// - GitHub Pages (por defecto): https://silverium.github.io/cuerpo/
// - Cloudflare Workers (DEPLOY_TARGET=cloudflare): https://cuerpo.soldeplata.dev/
const cloudflare = process.env.DEPLOY_TARGET === 'cloudflare';

export default defineConfig({
  site: cloudflare ? 'https://cuerpo.soldeplata.dev' : 'https://silverium.github.io',
  base: cloudflare ? '/' : '/cuerpo',
  trailingSlash: 'ignore',
});
