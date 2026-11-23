import { CANONICAL_SITE } from './site.mjs';

const base = import.meta.env.BASE_URL.replace(/\/$/, '');

/** Ruta interna respetando el `base` configurado en astro.config.mjs. */
export const href = (path = '') => `${base}/${path.replace(/^\//, '')}`;

/**
 * Ruta de página con barra final, que es como la sirven GitHub Pages y Cloudflare (redirigen
 * /imc a /imc/). Enlazar ya con la barra evita esa redirección.
 */
export const withSlash = (path: string) => (path.endsWith('/') ? path : `${path}/`);

/** Quita el `base` de una ruta (p. ej. Astro.url.pathname). */
export const stripBase = (pathname: string) => (pathname.startsWith(base) ? pathname.slice(base.length) : pathname);

/** URL canónica de una página (ruta sin `base`): dominio preferido, barra final y sin query. */
export const canonicalUrl = (path = '') => new URL(withSlash(`/${path.replace(/^\/+|\/+$/g, '')}`), CANONICAL_SITE).href;
