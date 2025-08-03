export interface Video {
  title: string;
  duration: string;
  bunnyVideoId?: string; // Will be populated from Bunny.net API
}

export interface Module {
  title: string;
  description: string;
  videos: Video[];
  bunnyLibraryId?: string; // Will be provided by user
}

export interface Course {
  id: string;
  slug: string;
  title: string;
  description: string;
  longDescription: string;
  price: number;
  level: string;
  duration: string;
  imageUrl: string;
  modules: Module[];
}

export const coursesData: Course[] = [
  {
    id: 'ciencias',
    slug: 'ciencias',
    title: 'Matemáticas Ciencias',
    description: 'Curso completo de matemáticas para estudiantes de Ciencias',
    longDescription: `Este curso está diseñado específicamente para estudiantes de Ciencias, cubriendo todos los temas fundamentales de matemáticas necesarios para el éxito académico. Incluye álgebra y matrices, geometría en el espacio, y análisis matemático completo.`,
    price: 89.99,
    level: 'Avanzado',
    duration: '6 meses',
    imageUrl: '/images/course-ciencias.jpg',
    modules: [
      {
        title: 'Álgebra y Matrices',
        description: 'Fundamentos del álgebra lineal y teoría de matrices',
        videos: [
          { title: 'Definición de matriz', duration: '03:40' },
          { title: 'Tipos de matrices', duration: '05:10' },
          { title: 'Operaciones con matrices', duration: '05:28' },
          { title: 'Rango de una matriz', duration: '05:43' },
          { title: 'Cálculo del rango (Gauss)', duration: '05:50' },
          { title: 'Matriz inversa', duration: '08:49' },
          { title: 'Determinantes (Parte 1)', duration: '04:58' },
          { title: 'Determinantes (Parte 2)', duration: '04:13' },
          { title: 'Propiedades de los determinantes', duration: '09:44' },
          { title: 'Cálculo de determinantes', duration: '06:16' },
          { title: 'Cálculo del rango (Determinantes)', duration: '05:07' },
          { title: 'Cálculo matriz inversa (Determinantes)', duration: '06:32' },
          { title: 'Ecuaciones matriciales', duration: '05:19' },
          { title: 'Sistemas de ecuaciones lineales (SEL)', duration: '05:35' },
          { title: 'Resolución de SEL (Gauss)', duration: '06:48' },
          { title: 'Resolución de SEL (Cramer)', duration: '05:19' },
          { title: 'Teorema de Rouché-Frobenius', duration: '04:12' },
          { title: 'Resolución SCI', duration: '06:37' }
        ]
      },
      {
        title: 'Geometría',
        description: 'Geometría analítica en el espacio tridimensional',
        videos: [
          { title: 'Vectores en el espacio', duration: '06:18' },
          { title: 'Operaciones con vectores libres', duration: '03:41' },
          { title: 'Dependencia e independencia lineal', duration: '03:48' },
          { title: 'Producto escalar', duration: '06:43' },
          { title: 'Producto vectorial', duration: '06:53' },
          { title: 'Producto mixto', duration: '05:00' },
          { title: 'Elementos geométricos en el espacio', duration: '03:54' },
          { title: 'Recta y ecuaciones de la recta', duration: '07:30' },
          { title: 'Cambio de ec. Parametricas a ec. Implicita', duration: '11:04' },
          { title: 'Plano y ecuaciones del plano', duration: '06:21' },
          { title: 'Calculo de la ec. Implicita del plano', duration: '06:23' },
          { title: 'Posicion relativa entre dos planos', duration: '05:26' },
          { title: 'Posicion relativa entre tres planos', duration: '05:19' },
          { title: 'Posicion relativa entre recta y plano', duration: '06:10' },
          { title: 'Posicion relativa entre dos rectas', duration: '07:54' },
          { title: 'Comprobar si tres puntos estan alineados', duration: '04:59' },
          { title: 'Comprobar si cuatro puntos son coplanarios', duration: '07:09' },
          { title: 'Plano determinado por recta y punto', duration: '03:00' },
          { title: 'Ángulo entre rectas y planos', duration: '06:59' },
          { title: 'Perpendicularidad y paralelismo entre recta y plano', duration: '02:40' },
          { title: 'Proyecciones ortogonales y puntos simétricos (Parte 1)', duration: '07:38' },
          { title: 'Proyecciones ortogonales y puntos simétricos (Parte 2)', duration: '10:25' },
          { title: 'Proyecciones ortogonales y puntos simétricos (Parte 3)', duration: '08:37' },
          { title: 'Distancia entre dos puntos', duration: '01:47' },
          { title: 'Distancia entre punto y plano', duration: '03:50' },
          { title: 'Distancia entre dos planos', duration: '02:57' },
          { title: 'Distancia entre punto y recta', duration: '01:24' },
          { title: 'Distancia entre dos rectas paralelas', duration: '01:43' },
          { title: 'Distancia entre recta y plano', duration: '01:43' },
          { title: 'Distancia entre dos rectas que se cruzan', duration: '02:48' },
          { title: 'Perpendicular a dos rectas que se cruzan', duration: '05:21' },
          { title: 'Plano mediador de dos puntos', duration: '07:02' }
        ]
      },
      {
        title: 'Análisis',
        description: 'Cálculo diferencial e integral completo',
        videos: [
          { title: 'Funciones', duration: '09:00' },
          { title: 'Límites', duration: '06:18' },
          { title: 'Propiedades de los límites', duration: '06:08' },
          { title: 'Cálculo de límites I', duration: '07:41' },
          { title: 'Cálculo de límites II (Parte 1)', duration: '08:45' },
          { title: 'Cálculo de límites II (Parte 2)', duration: '06:04' },
          { title: 'Continuidad', duration: '05:10' },
          { title: 'Continuidad de funciones elementales', duration: '03:12' },
          { title: 'Tipos de discontinuidades', duration: '03:28' },
          { title: 'Teoremas relacionados con la continuidad', duration: '06:25' },
          { title: 'Derivadas', duration: '06:24' },
          { title: 'Cálculo de la recta tangente a una función', duration: '04:39' },
          { title: 'Operaciones y tipos de derivadas', duration: '08:02' },
          { title: 'Método para calcular derivadas', duration: '04:54' },
          { title: 'Aplicaciones de las derivadas', duration: '06:19' },
          { title: 'Problemas de optimización', duration: '06:07' },
          { title: 'Teoremas relacionados con las derivadas', duration: '04:03' },
          { title: 'Representación de funciones', duration: '03:54' },
          { title: 'Dominio de una función', duration: '06:37' },
          { title: 'Corte con los ejes de coordenadas', duration: '03:37' },
          { title: 'Crecimiento y decrecimiento de una función (Máx. y min.)', duration: '05:27' },
          { title: 'Concavidad (Puntos de inflexión)', duration: '03:55' },
          { title: 'Asíntotas (Parte 1)', duration: '03:28' },
          { title: 'Asíntotas (Parte 2)', duration: '06:38' },
          { title: 'Asíntotas (Parte 3)', duration: '05:10' },
          { title: 'Interpretación de los datos', duration: '05:40' },
          { title: 'Integrales', duration: '04:38' },
          { title: 'Integrales inmediatas (Parte 1)', duration: '06:31' },
          { title: 'Integrales inmediatas (Parte 2)', duration: '05:50' },
          { title: 'Integración por partes', duration: '08:08' },
          { title: 'Integración por cambio de variable (Parte 1)', duration: '05:29' },
          { title: 'Integración por cambio de variable (Parte 2)', duration: '05:08' },
          { title: 'Integración de funciones racionales (Parte 1)', duration: '07:08' },
          { title: 'Integración de funciones racionales (Parte 2)', duration: '06:10' },
          { title: 'Integración de funciones racionales (Parte 3)', duration: '10:23' },
          { title: 'Integrales definidas', duration: '05:09' },
          { title: 'Propiedades de las integrales definidas', duration: '08:30' },
          { title: 'Área de una función que corta al eje OX', duration: '07:24' },
          { title: 'Área comprendida entre dos funciones', duration: '11:43' },
          { title: 'Cálculo de cualquier área', duration: '09:37' }
        ]
      }
    ]
  },
  {
    id: 'ccss',
    slug: 'ccss',
    title: 'Matemáticas CCSS',
    description: 'Curso completo de matemáticas para estudiantes de Ciencias Sociales',
    longDescription: `Este curso está diseñado específicamente para estudiantes de Ciencias Sociales, cubriendo todos los temas fundamentales de matemáticas necesarios para el éxito académico. Incluye álgebra y matrices, análisis matemático, y estadística y probabilidad.`,
    price: 89.99,
    level: 'Avanzado',
    duration: '6 meses',
    imageUrl: '/images/course-ccss.jpg',
    modules: [
      {
        title: 'Álgebra y Matrices',
        description: 'Fundamentos del álgebra lineal y teoría de matrices',
        videos: [
          { title: 'Definición de matriz', duration: '03:40' },
          { title: 'Tipos de matrices', duration: '05:11' },
          { title: 'Operaciones con matrices', duration: '05:29' },
          { title: 'Rango de una matriz', duration: '05:44' },
          { title: 'Cálculo del rango (Gauss)', duration: '05:51' },
          { title: 'Matriz inversa', duration: '08:50' },
          { title: 'Determinantes (Parte 1)', duration: '04:59' },
          { title: 'Determinantes (Parte 2)', duration: '04:14' },
          { title: 'Propiedades de los determinantes', duration: '09:45' },
          { title: 'Cálculo de determinantes', duration: '06:17' },
          { title: 'Cálculo del rango (Determinantes)', duration: '05:08' },
          { title: 'Cálculo matriz inversa (Determinantes)', duration: '06:33' },
          { title: 'Ecuaciones matriciales', duration: '05:20' },
          { title: 'Sistemas de ecuaciones lineales (SEL)', duration: '05:36' },
          { title: 'Resolución de SEL (Gauss)', duration: '06:49' },
          { title: 'Resolución de SEL (Cramer)', duration: '05:20' },
          { title: 'Teorema de Rouché-Frobenius', duration: '04:13' },
          { title: 'Resolución SCI', duration: '06:38' },
          { title: 'Desigualdades e inecuaciones', duration: '04:46' },
          { title: 'Inecuaciones lineales', duration: '03:03' },
          { title: 'Inecuaciones polinómicas', duration: '04:36' },
          { title: 'Inecuaciones racionales', duration: '08:21' },
          { title: 'Sistemas de inecuaciones con una incógnita', duration: '06:08' },
          { title: 'Inecuaciones con dos incógnitas', duration: '04:39' },
          { title: 'Sistemas de inecuaciones con dos incógnitas', duration: '04:40' },
          { title: 'Problemas de programación lineal (Parte 1)', duration: '09:44' },
          { title: 'Problemas de programación lineal (Parte 2)', duration: '08:51' }
        ]
      },
      {
        title: 'Análisis',
        description: 'Cálculo diferencial e integral completo',
        videos: [
          { title: 'Funciones', duration: '09:01' },
          { title: 'Límites', duration: '06:19' },
          { title: 'Propiedades de los límites', duration: '06:09' },
          { title: 'Cálculo de límites I', duration: '07:42' },
          { title: 'Cálculo de límites II (Parte 1)', duration: '08:46' },
          { title: 'Cálculo de límites II (Parte 2)', duration: '06:05' },
          { title: 'Continuidad', duration: '05:11' },
          { title: 'Continuidad de funciones elementales', duration: '03:13' },
          { title: 'Tipos de discontinuidades', duration: '03:29' },
          { title: 'Teoremas relacionados con la continuidad', duration: '06:26' },
          { title: 'Derivadas', duration: '06:25' },
          { title: 'Cálculo de la recta tangente a una función', duration: '04:40' },
          { title: 'Operaciones y tipos de derivadas', duration: '08:03' },
          { title: 'Método para calcular derivadas', duration: '04:55' },
          { title: 'Aplicaciones de las derivadas', duration: '06:20' },
          { title: 'Problemas de optimización', duration: '06:08' },
          { title: 'Teoremas relacionados con las derivadas', duration: '04:04' },
          { title: 'Representación de funciones', duration: '03:55' },
          { title: 'Dominio de una función', duration: '06:38' },
          { title: 'Corte con los ejes de coordenadas', duration: '03:38' },
          { title: 'Crecimiento y decrecimiento de una función (Máx. y min.)', duration: '05:28' },
          { title: 'Concavidad (Puntos de inflexión)', duration: '03:56' },
          { title: 'Asíntotas (Parte 1)', duration: '03:29' },
          { title: 'Asíntotas (Parte 2)', duration: '06:39' },
          { title: 'Asíntotas (Parte 3)', duration: '05:11' },
          { title: 'Interpretación de los datos', duration: '05:41' },
          { title: 'Integrales', duration: '04:39' },
          { title: 'Integrales inmediatas (Parte 1)', duration: '06:41' },
          { title: 'Integrales inmediatas (Parte 2)', duration: '05:51' },
          { title: 'Integración por partes', duration: '00:00' },
          { title: 'Integración por cambio de variable (Parte 1)', duration: '05:30' },
          { title: 'Integración por cambio de variable (Parte 2)', duration: '05:09' },
          { title: 'Integración de funciones racionales (Parte 1)', duration: '07:09' },
          { title: 'Integración de funciones racionales (Parte 2)', duration: '06:11' },
          { title: 'Integración de funciones racionales (Parte 3)', duration: '10:23' },
          { title: 'Integrales definidas', duration: '06:10' },
          { title: 'Propiedades de las integrales definidas', duration: '08:31' },
          { title: 'Área de una función que corta al eje OX', duration: '07:25' },
          { title: 'Área comprendida entre dos funciones', duration: '11:44' },
          { title: 'Cálculo de cualquier área', duration: '09:38' }
        ]
      },
      {
        title: 'Estadística y Probabilidad',
        description: 'Fundamentos de estadística y teoría de probabilidad',
        videos: [
          { title: 'Experimento aleatorio. Sucesos', duration: '10:56' },
          { title: 'Operaciones con sucesos', duration: '08:21' },
          { title: 'Probabilidad. Regla de Laplace', duration: '07:02' },
          { title: 'Axiomas y propiedades de la probabilidad', duration: '07:57' },
          { title: 'Aplicaciones de las propiedades de la probabilidad', duration: '08:26' },
          { title: 'Probabilidad condicionada e independencia de sucesos', duration: '09:37' },
          { title: 'Probabilidad total y teorema de Bayes', duration: '12:44' },
          { title: 'Variable aleatoria. Distribución de probabilidad', duration: '07:21' },
          { title: 'Distribución de probabilidad de una v.a. discreta', duration: '11:16' },
          { title: 'Esperanza matemática y varianza de una v.a. discreta', duration: '09:20' },
          { title: 'Distribución de Bernoulli (Variables discretas)', duration: '08:01' },
          { title: 'Distribución Binomial (Variables discretas) (Parte 1)', duration: '08:44' },
          { title: 'Distribución Binomial (Variables discretas) (Parte 2)', duration: '06:06' },
          { title: 'Distribución Binomial (Variables discretas) (Parte 3)', duration: '06:05' },
          { title: 'Distribución de probabilidad de una v.a. continua (Parte 1)', duration: '07:41' },
          { title: 'Distribución de probabilidad de una v.a. continua (Parte 2)', duration: '05:14' },
          { title: 'Distribución Normal (Variables continuas) (Parte 1)', duration: '06:13' },
          { title: 'Distribución Normal (Variables continuas) (Parte 2)', duration: '06:45' },
          { title: 'Distribución Normal (Variables continuas) (Parte 3)', duration: '10:23' },
          { title: 'Distribución Normal (Variables continuas) (Parte 4)', duration: '06:00' },
          { title: 'Cálculo de probabilidades de una Normal general', duration: '07:34' },
          { title: 'Aproximación de la binomial por la normal', duration: '09:34' },
          { title: 'Población y muestra', duration: '09:07' },
          { title: 'Estadístico y distribuciones muestrales', duration: '11:38' },
          { title: 'Otras distribuciones muestrales (Parte 1)', duration: '07:01' },
          { title: 'Otras distribuciones muestrales (Parte 2)', duration: '04:56' },
          { title: 'Estimación puntual', duration: '10:18' },
          { title: 'Intervalos de confianza', duration: '12:40' },
          { title: 'Otros intervalos de confianza', duration: '08:42' },
          { title: 'Error de estimación. Tamaño de la muestra', duration: '09:52' }
        ]
      }
    ]
  }
]; 