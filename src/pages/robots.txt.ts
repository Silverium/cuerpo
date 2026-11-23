// robots.txt: permite rastrear todo y anuncia el sitemap. Solo cuenta en la raíz de un dominio
// (cuerpo.soldeplata.dev/robots.txt); en GitHub Pages queda en /cuerpo/robots.txt y Google lo ignora.
import type { APIRoute } from 'astro';
import { CANONICAL_SITE } from '../lib/site.mjs';

export const GET: APIRoute = () =>
  new Response(['User-agent: *', 'Allow: /', '', `Sitemap: ${new URL('/sitemap.xml', CANONICAL_SITE)}`, ''].join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
