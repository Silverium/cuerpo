# Cuerpo

Landing con calculadoras de medidas corporales, hecha con [Astro](https://astro.build).

- **`/imc`**: índice de masa corporal (clasificación de la OMS), rango de peso saludable, IMC prime e índice cintura-altura.
- **`/agua`**: agua corporal total (Watson y Hume-Weyers), reparto intracelular / intersticial / plasma, electrolitos disueltos (Na⁺, K⁺, Cl⁻, HCO₃⁻, Mg²⁺, Ca²⁺), hidratación (beber según la sed, con la proporción de electrolitos del sudor; la cifra de la EFSA solo como referencia poco fiable) y pérdidas por sudor. Si añades una analítica, calcula osmolalidad, anion gap, sodio corregido y déficit de agua libre.
- **`/sal-por-litro`**: gramos de sal para cualquier cantidad de agua (campo en ml y slider de 0 a 2 L), con botones rápidos para los sueros de la dieta Unani del Dr. David Duarte (2, 4, 6 y 12 g/L) o una concentración a medida (de 1 a 350 g/L, cerca de la saturación; por encima de 20 g/L, la tabla y el slider pasan a chupitos de compensación de 1 a 25 ml, con vasitos medidores de 20 ml), una tabla rápida de 50 ml a 1 L una explicación de la hipertensión sensible a la sal y los riesgos de comer poca sal, con su bibliografía. La URL guarda la cantidad y la concentración (`?ml=500&gl=2.34`).
- **`/sobre-mi`**: quién hace Cuerpo y sus otras apps, con los datos de `https://www.soldeplata.dev/api/about` y `/api/apps`. El pie de todas las páginas enlaza esas apps.

Esos datos (y la foto y los iconos, que se copian a `/img/`) se leen **al compilar**: el sitio publicado no hace peticiones a otros dominios. Por eso `npm run build` necesita red, y falla si la API no responde. La lógica está en [`src/lib/soldeplata.ts`](src/lib/soldeplata.ts).

## Estado

- Cada campo del formulario se refleja en la URL (`?sexo=mujer&edad=35&altura=170&peso=70`), así que un enlace reproduce los mismos valores.
- Todo se guarda en `localStorage`. El perfil (`sexo`, `edad`, `altura`, `peso`) se comparte entre las calculadoras que lo usan; el resto se guarda por página.
- Al cargar, la URL tiene prioridad sobre lo guardado, y lo guardado sobre los valores por defecto.

La lógica está en [`src/lib/sync.ts`](src/lib/sync.ts) y las fórmulas en [`src/lib/calc.ts`](src/lib/calc.ts).

## Desarrollo

```sh
npm install
npm run dev      # http://localhost:1983/cuerpo
npm run build    # genera ./dist
```

Hay dos despliegues en cada push a `main`:

- **GitHub Pages** (`silverium.github.io/cuerpo`): el workflow de `.github/workflows/deploy.yml`.
- **Cloudflare Workers** (`cuerpo.soldeplata.dev`): Workers Builds, conectado al repo desde el panel de Cloudflare. Compila con `npm run build:cf` y publica con `npx wrangler deploy`. Para desplegar a mano: `npm run deploy:cf`.

## SEO

Sigue la [guía de SEO de Google](https://developers.google.com/search/docs/fundamentals/seo-starter-guide):

- **Dominio canónico**: `https://cuerpo.soldeplata.dev` ([`src/lib/site.mjs`](src/lib/site.mjs)). Las dos copias (Cloudflare y GitHub Pages) declaran esa URL con `<link rel="canonical">`, siempre con barra final y sin la query de la calculadora, para que Google indexe una sola versión de cada página.
- **`/sitemap.xml`** y **`/robots.txt`** se generan al compilar con las URL canónicas ([`src/pages/sitemap.xml.ts`](src/pages/sitemap.xml.ts), [`src/pages/robots.txt.ts`](src/pages/robots.txt.ts)). El sitemap incluye automáticamente cada `.astro` de `src/pages`.
- Cada página pasa a `Layout` un `title` y una `description` propios y únicos.
- La portada lleva datos estructurados `WebSite` para que Google muestre «Cuerpo» como nombre del sitio.
- Los enlaces internos llevan barra final (`/imc/`), que es como los sirven los dos alojamientos, para evitar redirecciones.

## Aviso

Son estimaciones basadas en fórmulas poblacionales. No sustituyen una valoración médica, una bioimpedancia ni una analítica.
