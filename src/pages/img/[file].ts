// Copia a /img/ la foto del autor y los iconos de sus otras apps al compilar, para servirlos desde
// este dominio.
import type { APIRoute, GetStaticPaths } from 'astro';
import { remoteImages } from '../../lib/soldeplata';

export const getStaticPaths = (async () =>
  (await remoteImages()).map(({ path, url }) => ({
    params: { file: path.replace(/^img\//, '') },
    props: { url },
  }))) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ props }) => {
  const res = await fetch(props.url, { signal: AbortSignal.timeout(15_000) });
  if (!res.ok) throw new Error(`${props.url}: HTTP ${res.status}`);
  return new Response(await res.arrayBuffer(), {
    headers: { 'Content-Type': res.headers.get('content-type') ?? 'application/octet-stream' },
  });
};
