// Sitemap con las URL canónicas (dominio preferido) de todas las páginas, también en la copia de
// GitHub Pages. Se genera a partir de los .astro de src/pages, así que no hay que mantener la lista.
import type { APIRoute } from 'astro';
import { canonicalUrl } from '../lib/paths';

const urls = Object.keys(import.meta.glob('./**/*.astro'))
  .filter((file) => !file.includes('['))
  .map((file) => canonicalUrl(file.replace(/^\.\//, '').replace(/(index)?\.astro$/, '')))
  .sort();

export const GET: APIRoute = () =>
  new Response(
    [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
      ...urls.map((url) => `  <url><loc>${url}</loc></url>`),
      '</urlset>',
      '',
    ].join('\n'),
    { headers: { 'Content-Type': 'application/xml; charset=utf-8' } },
  );
