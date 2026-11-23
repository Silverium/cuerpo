# Cuerpo

Landing con calculadoras de medidas corporales, hecha con [Astro](https://astro.build).

- **`/imc`**: índice de masa corporal (clasificación de la OMS), rango de peso saludable, IMC prime e índice cintura-altura.
- **`/agua`**: agua corporal total (Watson y Hume-Weyers), reparto intracelular / intersticial / plasma, electrolitos disueltos (Na⁺, K⁺, Cl⁻, HCO₃⁻, Mg²⁺, Ca²⁺), necesidad diaria de agua y pérdidas por sudor. Si añades una analítica, calcula osmolalidad, anion gap, sodio corregido y déficit de agua libre.
- **`/sobre-mi`**: quién hace Cuerpo y sus otras apps, con los datos de `https://www.soldeplata.dev/api/about` y `/api/apps`. El pie de todas las páginas enlaza esas apps.

Esos datos (y la foto y los iconos, que se copian a `/img/`) se leen **al compilar**: el sitio publicado no hace peticiones a otros dominios. Por eso `npm run build` necesita red, y falla si la API no responde. La lógica está en [`src/lib/soldeplata.ts`](src/lib/soldeplata.ts).

## Estado

- Cada campo del formulario se refleja en la URL (`?sexo=mujer&edad=35&altura=170&peso=70`), así que un enlace reproduce los mismos valores.
- Todo se guarda en `localStorage`. El perfil (`sexo`, `edad`, `altura`, `peso`) se comparte entre las dos calculadoras; el resto se guarda por página.
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

## Aviso

Son estimaciones basadas en fórmulas poblacionales. No sustituyen una valoración médica, una bioimpedancia ni una analítica.
