/**
 * Sincroniza los campos de un formulario con la URL (query string) y con localStorage.
 *
 * Prioridad al cargar: parámetro en la URL > valor guardado en localStorage > valor por defecto del HTML.
 * Los campos del perfil (sexo, edad, altura, peso) se guardan en una clave compartida,
 * así que se rellenan solos al cambiar de calculadora.
 */

export type Values = Record<string, string>;

export const SHARED_FIELDS = ['sexo', 'edad', 'altura', 'peso'] as const;
const PROFILE_KEY = 'cuerpo:perfil';
const pageKey = (page: string) => `cuerpo:${page}`;

function readStore(key: string): Values {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) ?? '{}');
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writeStore(key: string, data: Values) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    /* modo privado o almacenamiento bloqueado: la URL sigue funcionando */
  }
}

const isShared = (name: string) => (SHARED_FIELDS as readonly string[]).includes(name);

function fieldNames(form: HTMLFormElement): string[] {
  const names = new Set<string>();
  for (const el of Array.from(form.elements)) {
    const name = (el as HTMLInputElement).name;
    if (name) names.add(name);
  }
  return [...names];
}

function setField(form: HTMLFormElement, name: string, value: string) {
  const field = form.elements.namedItem(name) as HTMLInputElement | RadioNodeList | null;
  if (!field) return;
  if (field instanceof HTMLInputElement && field.type === 'checkbox') field.checked = value === field.value;
  else field.value = value;
}

function readValues(form: HTMLFormElement, names: string[]): Values {
  const data = new FormData(form);
  const values: Values = {};
  for (const name of names) values[name] = String(data.get(name) ?? '').trim();
  return values;
}

export function syncForm(form: HTMLFormElement, page: string, onChange: (values: Values) => void) {
  const names = fieldNames(form);
  const params = new URLSearchParams(location.search);
  const profile = readStore(PROFILE_KEY);
  const pageData = readStore(pageKey(page));

  for (const name of names) {
    const value = params.has(name) ? params.get(name) : isShared(name) ? profile[name] : pageData[name];
    if (value != null) setField(form, name, value);
  }

  const update = () => {
    const values = readValues(form, names);

    const nextProfile = { ...readStore(PROFILE_KEY) };
    const nextPage: Values = {};
    for (const [name, value] of Object.entries(values)) {
      if (isShared(name)) nextProfile[name] = value;
      else nextPage[name] = value;
    }
    writeStore(PROFILE_KEY, nextProfile);
    writeStore(pageKey(page), nextPage);

    const query = new URLSearchParams();
    for (const [name, value] of Object.entries(values)) if (value !== '') query.set(name, value);
    const qs = query.toString();
    history.replaceState(history.state, '', `${location.pathname}${qs ? `?${qs}` : ''}${location.hash}`);

    onChange(values);
  };

  form.addEventListener('input', update);
  form.addEventListener('change', update);
  form.addEventListener('submit', (e) => e.preventDefault());
  // El evento reset se dispara antes de restaurar los valores por defecto.
  form.addEventListener('reset', () => setTimeout(update));

  update();
}

/** Convierte un valor de formulario en número; devuelve null si está vacío o no es válido. */
export function num(value: string | undefined): number | null {
  if (value == null || value === '') return null;
  const n = Number(value.replace(',', '.'));
  return Number.isFinite(n) ? n : null;
}

/** Botón "Copiar enlace": copia la URL actual (que ya lleva los parámetros). */
export function bindShareButton(button: HTMLButtonElement | null) {
  if (!button) return;
  const label = button.textContent;
  button.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(location.href);
      button.textContent = 'Enlace copiado';
    } catch {
      button.textContent = 'No se pudo copiar';
    }
    setTimeout(() => (button.textContent = label), 1800);
  });
}
