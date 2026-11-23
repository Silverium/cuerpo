export type Sexo = 'hombre' | 'mujer';

/* ───────────────────────────── IMC ───────────────────────────── */

export interface Categoria {
  max: number;
  label: string;
  tone: 'low' | 'ok' | 'warn' | 'high';
}

/** Clasificación de la OMS para adultos. */
export const CATEGORIAS_IMC: Categoria[] = [
  { max: 16, label: 'Delgadez severa', tone: 'high' },
  { max: 17, label: 'Delgadez moderada', tone: 'warn' },
  { max: 18.5, label: 'Delgadez leve', tone: 'low' },
  { max: 25, label: 'Peso normal', tone: 'ok' },
  { max: 30, label: 'Sobrepeso', tone: 'low' },
  { max: 35, label: 'Obesidad grado I', tone: 'warn' },
  { max: 40, label: 'Obesidad grado II', tone: 'high' },
  { max: Infinity, label: 'Obesidad grado III', tone: 'high' },
];

export function imc(pesoKg: number, alturaCm: number): number {
  const m = alturaCm / 100;
  return pesoKg / (m * m);
}

export function categoriaImc(valor: number): Categoria {
  return CATEGORIAS_IMC.find((c) => valor < c.max) ?? CATEGORIAS_IMC[CATEGORIAS_IMC.length - 1];
}

/** Rango de peso con IMC entre 18,5 y 24,9 para una altura dada. */
export function pesoSaludable(alturaCm: number): [number, number] {
  const m2 = (alturaCm / 100) ** 2;
  return [18.5 * m2, 24.9 * m2];
}

/** Índice cintura-altura (ICA / WHtR). */
export function indiceCinturaAltura(cinturaCm: number, alturaCm: number) {
  const valor = cinturaCm / alturaCm;
  const estado =
    valor < 0.4
      ? { label: 'Bajo', tone: 'low' as const }
      : valor < 0.5
        ? { label: 'Saludable', tone: 'ok' as const }
        : valor < 0.6
          ? { label: 'Riesgo aumentado', tone: 'warn' as const }
          : { label: 'Riesgo alto', tone: 'high' as const };
  return { valor, ...estado };
}

/* ─────────────────────── Agua corporal ─────────────────────── */

/** Agua corporal total (L) según Watson et al. (1980). */
export function aguaWatson(sexo: Sexo, edad: number, alturaCm: number, pesoKg: number): number {
  return sexo === 'hombre'
    ? 2.447 - 0.09516 * edad + 0.1074 * alturaCm + 0.3362 * pesoKg
    : -2.097 + 0.1069 * alturaCm + 0.2466 * pesoKg;
}

/** Agua corporal total (L) según Hume y Weyers (1971). */
export function aguaHumeWeyers(sexo: Sexo, alturaCm: number, pesoKg: number): number {
  return sexo === 'hombre'
    ? 0.194786 * alturaCm + 0.296785 * pesoKg - 14.012934
    : 0.34454 * alturaCm + 0.183809 * pesoKg - 35.270121;
}

/** Reparto aproximado: 2/3 intracelular, 1/3 extracelular (3/4 intersticial, 1/4 plasma). */
export function compartimentos(aguaTotal: number) {
  const intracelular = (aguaTotal * 2) / 3;
  const extracelular = aguaTotal / 3;
  return {
    intracelular,
    extracelular,
    intersticial: extracelular * 0.75,
    plasma: extracelular * 0.25,
  };
}

/* ───────────────────────── Electrolitos ───────────────────────── */

export interface Electrolito {
  id: string;
  nombre: string;
  simbolo: string;
  /** Masa molar en g/mol. */
  masaMolar: number;
  /** Concentración típica en mmol/L. */
  extracelular: number;
  intracelular: number;
}

/** Concentraciones fisiológicas de referencia (valores de libro de texto, redondeados). */
export const ELECTROLITOS: Electrolito[] = [
  { id: 'na', nombre: 'Sodio', simbolo: 'Na⁺', masaMolar: 22.99, extracelular: 142, intracelular: 12 },
  { id: 'k', nombre: 'Potasio', simbolo: 'K⁺', masaMolar: 39.1, extracelular: 4.2, intracelular: 140 },
  { id: 'cl', nombre: 'Cloruro', simbolo: 'Cl⁻', masaMolar: 35.45, extracelular: 104, intracelular: 4 },
  { id: 'hco3', nombre: 'Bicarbonato', simbolo: 'HCO₃⁻', masaMolar: 61.02, extracelular: 24, intracelular: 10 },
  { id: 'mg', nombre: 'Magnesio', simbolo: 'Mg²⁺', masaMolar: 24.31, extracelular: 0.9, intracelular: 20 },
  { id: 'ca', nombre: 'Calcio', simbolo: 'Ca²⁺', masaMolar: 40.08, extracelular: 2.4, intracelular: 0.0001 },
];

/** Cantidad de cada electrolito disuelta en los líquidos corporales (mmol y gramos). */
export function contenidoElectrolitos(intracelularL: number, extracelularL: number) {
  return ELECTROLITOS.map((e) => {
    const mmolEc = e.extracelular * extracelularL;
    const mmolIc = e.intracelular * intracelularL;
    const mmol = mmolEc + mmolIc;
    return { ...e, mmolEc, mmolIc, mmol, gramos: (mmol * e.masaMolar) / 1000 };
  });
}

/* ───────────────────────── Necesidades ───────────────────────── */

/** Litros de sudor estimados por hora de ejercicio moderado (varía mucho entre personas: 0,5–2 L/h). */
export const SUDOR_L_POR_HORA = 0.8;
/** Concentraciones medias en sudor (mmol/L). */
export const SUDOR = { na: 40, k: 5 };
/**
 * Electrolitos por litro de bebida para reponer el sudor en su misma proporción (g/L).
 * Beber solo agua cuando se suda mucho diluye el sodio de la sangre (riesgo de hiponatremia).
 */
export const ELECTROLITOS_POR_LITRO = {
  sodioG: (SUDOR.na * 22.99) / 1000,
  potasioG: (SUDOR.k * 39.1) / 1000,
};

/**
 * Sodio diario para un adulto sano según James DiNicolantonio, «La solución está en la sal»
 * (The Salt Fix, 2017): 3–6 g de sodio, unos 8–15 g de sal, incluido el de los alimentos.
 * A esa base se suma el sodio que se pierde sudando.
 */
export const SODIO_BASE_G: [number, number] = [3, 6];
/** Edad mínima (años) a la que se muestra el rango de sodio, pensado para adultos. */
export const EDAD_MINIMA_SODIO = 16;
/** Edades en las que la sed avisa peor: por debajo de la primera y desde la segunda (años). */
export const EDAD_SED_NINO = 12;
export const EDAD_SED_MAYOR = 65;
/** Gramos de sal (NaCl) por gramo de sodio: 58,44 / 22,99. */
export const SAL_POR_SODIO = 58.44 / 22.99;
/** Gramos de sal en una cucharadita rasa de sal de mesa. */
export const SAL_POR_CUCHARADITA = 6;

/**
 * Referencia orientativa de agua total diaria (L), incluida la de los alimentos.
 * Base: ingesta adecuada de la EFSA (2,5 L hombres, 2,0 L mujeres) o 35 mL/kg si es mayor,
 * más la pérdida estimada por sudor y un extra si hace calor.
 *
 * La cifra de la EFSA es poco fiable como objetivo: se basa en la ingesta observada en la
 * población, no en una necesidad demostrada. La app recomienda guiarse por la sed y la muestra
 * solo como dato secundario.
 */
export function necesidadAgua(sexo: Sexo, pesoKg: number, ejercicioMin: number, calor: boolean) {
  const base = Math.max(sexo === 'hombre' ? 2.5 : 2.0, (pesoKg * 35) / 1000);
  const sudor = (ejercicioMin / 60) * SUDOR_L_POR_HORA * (calor ? 1.5 : 1);
  const clima = calor ? 0.5 : 0;
  const total = base + sudor + clima;
  const sodioPerdidoG = (sudor * SUDOR.na * 22.99) / 1000;
  return {
    base,
    sudor,
    clima,
    total,
    /** ~80 % de la ingesta total proviene de bebidas. */
    bebida: total * 0.8,
    sodioPerdidoG,
    /** Rango de sodio diario (g): base de DiNicolantonio más la reposición del sudor. */
    sodioRecomendadoG: SODIO_BASE_G.map((g) => g + sodioPerdidoG) as [number, number],
    potasioPerdidoG: (sudor * SUDOR.k * 39.1) / 1000,
  };
}

/* ───────────────────────── Analítica ───────────────────────── */

export interface Analitica {
  na?: number | null;
  k?: number | null;
  cl?: number | null;
  hco3?: number | null;
  glucosa?: number | null; // mg/dL
  urea?: number | null; // mg/dL
}

export type Estado = 'bajo' | 'normal' | 'alto';

export const RANGOS: Record<string, [number, number]> = {
  na: [135, 145],
  k: [3.5, 5.0],
  cl: [98, 107],
  hco3: [22, 29],
  glucosa: [70, 100],
  urea: [15, 45],
  osm: [275, 295],
  anionGap: [8, 12],
};

export function estado(valor: number, rango: [number, number]): Estado {
  return valor < rango[0] ? 'bajo' : valor > rango[1] ? 'alto' : 'normal';
}

/** Osmolalidad plasmática calculada (mOsm/kg). Urea → BUN dividiendo entre 2,14. */
export function osmolalidad(na: number, glucosa: number, urea: number): number {
  const bun = urea / 2.14;
  return 2 * na + glucosa / 18 + bun / 2.8;
}

export function anionGap(na: number, cl: number, hco3: number): number {
  return na - (cl + hco3);
}

/** Sodio corregido por glucosa (factor de Hillier, 2,4 mmol/L por cada 100 mg/dL sobre 100). */
export function sodioCorregido(na: number, glucosa: number): number {
  return na + (2.4 * (glucosa - 100)) / 100;
}

/** Déficit de agua libre (L) en hipernatremia. */
export function deficitAguaLibre(aguaTotal: number, na: number): number {
  return aguaTotal * (na / 140 - 1);
}
