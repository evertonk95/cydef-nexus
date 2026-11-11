import type { BlogPost } from "./posts";

/**
 * Avance del rediseño de CyDef Inora (ES, traducido del PT canónico).
 * Fuente: registros internos de las fases 1 a 8 del rediseño (10 y 11/11/2026).
 */
export const cydefInoraRedesignPostEs: BlogPost = {
  slug: "cydef-inora-andamento-redesign",
  title: "CyDef Inora: el avance del rediseño de la plataforma",
  category: "SOC Engineering",
  excerpt:
    "Rediseño completo de la interfaz, migración a React 19 y Tailwind 4, base de conocimiento reconstruida y búsqueda nueva. Lo que ya está entregado en CyDef Inora, lo que cubrió la validación y lo que todavía falta.",
  date: "11 de Novembro, 2026",
  dateISO: "2026-11-11",
  readTime: "6 min",
  image: "/assets/blog/cydef-inora-redesign-thumb.webp",
  author: "Equipe CyDef",
  tags: [
    "CyDef Inora",
    "SOC",
    "Producto",
    "Ingeniería",
    "Diseño de Interfaz",
    "Calidad",
  ],
  toc: true,
  sections: [
    {
      blocks: [
        {
          type: "p",
          text: "CyDef Inora es la plataforma de operación de SOC que CyDef está construyendo en abierto. En las últimas semanas el trabajo pasó de la funcionalidad a la experiencia: cada pantalla principal fue reescrita, el front pasó a una base técnica nueva y la validación ahora cubre la plataforma en las dos bases de datos soportadas. Este texto es un relato de avance, no un anuncio de disponibilidad.",
        },
        {
          type: "callout",
          callout: {
            kind: "ponto",
            title: "Resumen en una frase",
            body: "La interfaz fue rehecha pantalla por pantalla, la base del front pasó a React 19 y Tailwind 4, y cada fase se entregó con la misma puerta de validación: tipado, lint, pruebas en las dos bases, aislamiento entre organizaciones, build, análisis de dependencias y escaneo de secretos.",
          },
        },
      ],
    },
    {
      heading: "Lo que se rehizo en la interfaz",
      blocks: [
        {
          type: "p",
          text: "El rediseño no fue un ajuste de colores. Cada pantalla ganó estructura propia, con estados vacíos, filtros y conteos que llegan de la API en lugar de calcularse en el navegador. La lista sigue el orden en que se entregaron las fases.",
        },
        {
          type: "list",
          title: "Pantallas entregadas",
          items: [
            "**Login**: layout en dos columnas, con panel de marca, marca propia en SVG y microinteracciones que respetan la preferencia de movimiento reducido del sistema.",
            "**Estructura y panel**: barra lateral con contadores y modo plegado, búsqueda global, campana de notificaciones y banda de indicadores con serie diaria de alertas por severidad.",
            "**Alertas y aprobaciones**: cola y detalle del alerta rehechos, con resumen por severidad, alertas relacionadas, filtro por responsable y una pantalla propia de aprobaciones.",
            "**Caso**: cabecera nueva, banda de resumen con responsable, SLA restante, riesgo y playbook, y las pestañas de tareas, observables, evidencias y respuesta gobernada separadas en archivos propios.",
            "**Fusionar alertas**: modal en el estándar del producto, con vista previa de lo que hará la fusión antes de confirmar, incluidos observables unificados y etiquetas nuevas.",
            "**Configuración**: el monolito pasó a secciones direccionables por URL, de organizaciones y usuarios a playbooks, SLA, SSO, webhooks, seguridad y preferencias.",
            "**Base de conocimiento**: se convirtió en biblioteca, con lectura en Markdown, índice lateral, edición con vista previa, historial con comparación entre versiones y verificación de integridad de la cadena.",
            "**Búsqueda**: paleta por atajo, con resultados agrupados por tipo, filtros escritos, búsquedas recientes y una página de resultados con panel de refinamiento y estado sin resultado que sugiere el siguiente paso.",
          ],
        },
        {
          type: "note",
          text: "Todas las pantallas nuevas usan los tres idiomas del producto (portugués, inglés y español) y el mismo conjunto de componentes, para que la identidad visual no se pierda entre páginas.",
        },
      ],
    },
    {
      heading: "La base técnica también cambió",
      blocks: [
        {
          type: "p",
          text: "La interfaz estaba en React 18 con una capa de estilos que crecía sin regla. La fase de migración llevó el proyecto a React 19 y Tailwind 4, con una entrada única de CSS y el estilo antiguo preservado en una capa de compatibilidad, justamente para que el rediseño no rompiera lo que ya funcionaba.",
        },
        {
          type: "p",
          text: "La consecuencia más visible fue el tamaño del paquete inicial: las rutas pasaron a cargarse bajo demanda, con límites de error en todas las páginas, y la primera carga bajó de unos 689 kB a unos 490 kB. En una herramienta que un analista usa durante todo el turno, eso se ve como apertura más rápida y navegación sin espera entre pantallas.",
        },
        {
          type: "list",
          title: "En la práctica",
          items: [
            "Rutas cargadas bajo demanda, con un fallback discreto durante la transición.",
            "Componentes de interfaz estandarizados, con los mismos estados de foco, error y carga en todas las pantallas.",
            "Estilos organizados por área, sin reglas duplicadas entre páginas.",
            "Ninguna dependencia nueva entró sin pasar el análisis de dependencias de la puerta.",
          ],
        },
      ],
    },
    {
      heading: "Calidad: lo que la validación encontró",
      blocks: [
        {
          type: "p",
          text: "Cada fase se entregó con el mismo conjunto de verificaciones, y ahí es donde el trabajo se vuelve interesante: el proceso encontró defectos reales, no solo problemas de estilo de código.",
        },
        {
          type: "list",
          items: [
            "Una actualización parcial de tarea borraba campos que no se habían enviado, porque el esquema de validación mantenía valores por defecto. El esquema pasó a declararse campo por campo.",
            "Al publicar un artículo de la base de conocimiento, la pantalla seguía mostrando el estado anterior, porque la lectura reutilizaba la caché de la edición. La publicación pasó a invalidar la lectura.",
            "Un panel desplazable de vista previa no tenía acceso por teclado. Ganó foco, rol de región y etiqueta accesible.",
          ],
        },
        {
          type: "p",
          text: "Las pruebas de integración corren en las dos bases soportadas, SQLite y PostgreSQL, con el mismo escenario y la misma expectativa de resultado, incluido el aislamiento entre organizaciones. La suite de punta a punta, que recorre las pantallas como lo haría un analista, cerró la fase más reciente con 38 de 38 escenarios aprobados.",
        },
      ],
    },
    {
      heading: "Lo que todavía no está listo",
      blocks: [
        {
          type: "p",
          text: "Para que el avance no se convierta en promesa: la plataforma no está abierta al público y hay frentes conocidas todavía abiertas.",
        },
        {
          type: "list",
          items: [
            "Segundo factor con llaves de seguridad (WebAuthn) y federación de identidad completa (OIDC y SAML) siguen en desarrollo.",
            "Canales de notificación más allá de lo que existe hoy.",
            "La prueba de carga en la franja de 10 mil eventos y el procedimiento de backup y restauración todavía no se ejecutaron.",
          ],
        },
        {
          type: "p",
          text: "Cuando esas frentes cierren, el próximo relato de avance mostrará el resultado medido, no la intención. Es el mismo criterio que usamos en los artículos técnicos: afirmar solo lo que fue verificado.",
        },
      ],
    },
  ],
  sources: [
    { label: "CyDef Labs", url: "https://cydef.com.br/es/labs" },
    { label: "CyDef Academy", url: "https://cydef.com.br/es/academy" },
  ],
  changelog: [
    "2026-11-11: primera versión, basada en los registros internos de las fases 1 a 8 del rediseño.",
  ],
};
