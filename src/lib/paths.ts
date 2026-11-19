const base = import.meta.env.BASE_URL.replace(/\/$/, '');

/** Ruta interna respetando el `base` configurado en astro.config.mjs. */
export const href = (path = '') => `${base}/${path.replace(/^\//, '')}`;
