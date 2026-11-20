// Datos del autor y de sus otras apps, servidos por www.soldeplata.dev (/api/about y /api/apps).
// Se leen al compilar: el sitio publicado no hace peticiones a otros dominios. Si la API falla,
// la compilación falla con el motivo, en vez de publicar páginas vacías.

const API = 'https://www.soldeplata.dev/api';
const SELF = 'cuerpo';

export interface Link {
  label: string;
  url: string;
  kind: string;
}

export interface App {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  url: string;
  highlights: string[];
  languages: string;
  cta: string;
  icon?: string;
}

export interface About {
  name: string;
  shortName: string;
  role: string;
  location: string;
  url: string;
  photo: { url: string; width: number; height: number; alt: string };
  bio: string[];
  stack: string[];
  principles: { quote: string; author?: string }[];
  writing: { intro: string; title: string; url: string; lang: string }[];
  contact: { title: string; links: Link[] };
  social: Link[];
}

async function get<T>(path: string): Promise<T> {
  const url = `${API}/${path}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(15_000) });
  if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
  const data = await res.json();
  if (data?.version !== 1) throw new Error(`${url}: versión de API inesperada (${data?.version})`);
  return data as T;
}

// Una sola petición por compilación, aunque lo usen todas las páginas.
let about: Promise<About> | undefined;
let otherApps: Promise<App[]> | undefined;

export const getAbout = () => (about ??= get<About>('about?lang=es'));

export const getOtherApps = () =>
  (otherApps ??= get<{ apps: App[] }>(`apps?lang=es&exclude=${SELF}`).then((d) => d.apps));

// Imágenes remotas copiadas al sitio al compilar (ver pages/img/[file].ts).

const extension = (url: string) => new URL(url).pathname.match(/\.\w+$/)?.[0] ?? '';

/** Ruta local (sin base) de la foto del autor. */
export const photoPath = (a: About) => `img/autor${extension(a.photo.url)}`;

/** Ruta local (sin base) del icono de una app, si tiene. */
export const iconPath = (app: App) => (app.icon ? `img/app-${app.slug}${extension(app.icon)}` : undefined);

/** Cada imagen remota con su ruta local. */
export async function remoteImages(): Promise<{ path: string; url: string }[]> {
  const [a, apps] = await Promise.all([getAbout(), getOtherApps()]);
  return [
    { path: photoPath(a), url: a.photo.url },
    ...apps.flatMap((app) => (app.icon ? [{ path: iconPath(app)!, url: app.icon }] : [])),
  ];
}
