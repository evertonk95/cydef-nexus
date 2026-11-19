import type { BlogPost } from "./posts";

/**
 * WordPress 7.1.5 corrige 20 fallas de seguridad (ES).
 * Fuente: anuncio oficial de WordPress.org (18/11/2026) y análisis de Cyber Security News.
 * Portada: public/assets/blog/wordpress-7-1-5-correcoes-seguranca-capa.webp
 */
export const wordpress715CorrecoesSegurancaPostEs: BlogPost = {
  slug: "wordpress-7-1-5-correcoes-seguranca",
  title:
    "WordPress 7.1.5 corrige 20 fallas, incluidas escalada de privilegios y posible ejecución de código",
  category: "Inteligencia de Amenazas",
  excerpt:
    "WordPress publicó la versión 7.1.5 con correcciones para 20 problemas de seguridad en el núcleo, entre ellos una escalada de privilegios sin autenticación mediante atributos del bloque Template Part que puede llevar a la ejecución remota de código, dos inyecciones SQL y una falla de Multisite que permite a un administrador de sitio asumir la cuenta Super Admin.",
  date: "19 de Noviembre, 2026",
  dateISO: "2026-11-19",
  readTime: "8 min",
  image: "/assets/blog/wordpress-7-1-5-correcoes-seguranca-capa.webp",
  author: "Equipo CyDef",
  tags: [
    "WordPress",
    "Vulnerabilidades",
    "Ejecución de Código",
    "Inyección SQL",
    "Elevación de Privilegios",
    "Actualización de Seguridad",
    "Inteligencia de Amenazas",
  ],
  toc: true,
  sections: [
    {
      blocks: [
        {
          type: "p",
          text: "El 18 de noviembre de 2026, WordPress publicó la versión 7.1.5 con correcciones para 20 problemas de seguridad en el núcleo de la plataforma. El paquete incluye una falla que permite a un atacante sin cuenta obtener permisos indebidos mediante atributos del bloque Template Part y que, según el anuncio oficial, puede llevar a la ejecución remota de código.",
        },
        {
          type: "p",
          text: "La misma versión corrige dos inyecciones SQL, ocho fallas de XSS, cuatro casos de exposición de información, una denegación de servicio por XML-RPC, un bypass de autorización en la edición de comentarios y una escalada de privilegios en instalaciones Multisite. WordPress clasifica la actualización como prioridad inmediata y no reporta explotación activa de las fallas.",
        },
        {
          type: "callout",
          callout: {
            kind: "ponto",
            title: "Evaluación CyDef",
            body: "WordPress concentra dos riesgos a la vez: es el CMS más usado del mundo y funciona sobre plugins y temas de terceros que rara vez siguen el mismo ritmo de actualización del núcleo. Una falla de escalada de privilegios sin autenticación en el núcleo vale más que diez fallas que exigen cuenta, porque convierte cualquier sitio desactualizado en un objetivo inmediato. El trabajo aquí no termina al actualizar un sitio: termina al probar la versión en cada instalación del inventario, incluidas las olvidadas en hosting compartido.",
          },
        },
        {
          type: "note",
          text: "Autor: Equipo CyDef. Anuncio oficial de WordPress.org y reportaje de Cyber Security News consultados el 19 de Noviembre de 2026.",
        },
      ],
    },
    {
      heading: "Resumen ejecutivo",
      blocks: [
        {
          type: "p",
          text: "Lo que se sabe sobre la actualización, con base en las dos fuentes consultadas:",
        },
        {
          type: "list",
          items: [
            "**Producto y versión corregida:** WordPress 7.1.5, con versiones de mantenimiento para ramas anteriores.",
            "**Ramas corregidas:** 7.0.9, 6.9.12 y 4.7.40, además de la 7.1.5. WordPress 4.6 y anteriores ya no reciben actualizaciones de seguridad.",
            "**Volumen de correcciones:** 20 problemas de seguridad en el núcleo.",
            "**Fecha de publicación:** 18 de noviembre de 2026.",
            "**Falla más grave:** escalada de privilegios sin autenticación mediante atributos del bloque Template Part, con posibilidad de ejecución remota de código.",
            "**Explotación activa:** el anuncio no reporta ataques en curso.",
            "**Próxima versión:** la 7.2 está prevista para el 8 de diciembre y el Release Candidate 2 ya contiene las correcciones.",
          ],
        },
        {
          type: "table",
          table: {
            headers: ["Ítem", "Situación"],
            rows: [
              ["Versión principal corregida", "7.1.5"],
              ["Ramas con corrección", "7.0.9, 6.9.12 y 4.7.40"],
              ["Total de fallas en el núcleo", "20"],
              ["Fallas sin autenticación", "4 (privilegio, XSS, exposición y DoS)"],
              ["Explotación activa confirmada", "No informada"],
              ["Próxima versión estable", "7.2, prevista para el 8 de diciembre"],
            ],
          },
        },
      ],
    },
    {
      heading: "Las fallas de mayor impacto",
      blocks: [
        {
          type: "p",
          text: "El anuncio oficial lista las 20 correcciones con el crédito de quien reportó cada una, pero no detalla la ruta de explotación. Las seis siguientes son las que cambian el nivel de exposición de una instalación:",
        },
        {
          type: "table",
          table: {
            headers: ["Falla", "Componente", "Impacto", "Crédito"],
            rows: [
              ["Escalada de privilegios sin autenticación", "Atributos del bloque Template Part", "Posible ejecución remota de código", "Logan Homolka"],
              ["Inyección SQL", "WP_Meta_Query con valores de relación anidados", "Manipulación de consultas a la base", "Christiaan Swiers"],
              ["Inyección SQL", "Previews de changeset del Customizer", "Manipulación de consultas a la base", "Rudy Faile"],
              ["Escalada de privilegios", "Previews de menú del Customizer en Multisite", "El administrador de sitio asume la cuenta Super Admin", "Yuval Miller"],
              ["Exposición de información sin autenticación", "Endpoint de búsqueda de la REST API", "Divulgación de términos de taxonomía privados", "Anthropic"],
              ["Denegación de servicio sin autenticación", "Pingbacks en lote por XML-RPC", "Indisponibilidad del sitio", "Giovanni Cintolo"],
            ],
          },
        },
        {
          type: "p",
          text: "La falla del bloque Template Part es la que más pesa. El bloque se usa para elementos compartidos de diseño, como cabecera y pie, y la validación inadecuada de sus atributos permite que alguien sin cuenta obtenga permisos indebidos. El anuncio no informa qué configuraciones de sitio permiten llegar a la ejecución de código, lo que limita la planificación defensiva a tratar toda instalación desactualizada como potencialmente explotable.",
        },
        {
          type: "p",
          text: "Las dos inyecciones SQL afectan rutas diferentes: consultas de metadatos con relaciones anidadas y la vista previa de cambios del Customizer, en el ajuste de página de inicio. La falla de Multisite merece atención separada porque su alcance no es un sitio, es la red entera: un administrador de sitio puede asumir la cuenta Super Admin.",
        },
      ],
    },
    {
      heading: "El resto del paquete",
      blocks: [
        {
          type: "p",
          text: "Las otras 14 correcciones se distribuyen entre XSS, exposición de información, bypass de autorización y dos cambios preventivos:",
        },
        {
          type: "list",
          items: [
            "**XSS reflejado en la biblioteca de medios heredada**, reportado por Anthropic.",
            "**XSS en wp_interactivity_data_wp_context()** por el namespace de store, reportado por Juliette Reinders Folmer.",
            "**XSS almacenado sin autenticación** mediante atributos de shortcode en comentarios, reportado por Rafie Muhammad, de Awesome Motive.",
            "**XSS para Contributor o superior** mediante scripts en respuestas de proveedores oEmbed, reportado por vvh1te3zz.",
            "**XSS almacenado para administrador** en los previews del Customizer, reportado por Weston Ruter.",
            "**XSS almacenado en el bloque Comment Date** por el formato de fecha, reportado por Weston Ruter y Jeremy Felt.",
            "**XSS en el editor de bloques** mediante metadatos de imágenes de Openverse y mediante nombres de archivos de medios al convertir un bloque de medios en bloque File, reportados por Shu Takahashi y CryptoFox.",
            "**Exposición de información y autorización:** correos de usuarios por la REST API de comentarios (Author+), asignación de autor en posts y plantillas (Editor+), wp.getComments por XML-RPC (Subscriber+) y bypass de autorización en la edición de comentarios en el admin (Author+).",
            "**Cambios preventivos:** endurecimiento en la validación de expresiones regulares de tipos de medios JSON y eliminación de la variación de embed de Imgur en el editor de bloques, cuyo proveedor ya no existía.",
          ],
        },
        {
          type: "p",
          text: "Ninguno de estos ítems tiene el impacto aislado de la falla del bloque Template Part, pero el conjunto importa para quien opera sitios con muchos autores. El XSS almacenado en comentarios y en previews del Customizer es el tipo de falla que aparece en cadena con ingeniería social, y la exposición de correos de usuarios alimenta campañas de phishing dirigidas.",
        },
      ],
    },
    {
      heading: "Productos y versiones corregidas",
      blocks: [
        {
          type: "p",
          text: "La corrección está disponible en la versión principal y en ramas anteriores, para quien no puede migrar de inmediato:",
        },
        {
          type: "table",
          table: {
            headers: ["Rama", "Versión corregida"],
            rows: [
              ["7.1", "7.1.5 o superior"],
              ["7.0", "7.0.9 o superior"],
              ["6.9", "6.9.12 o superior"],
              ["4.7", "4.7.40 o superior"],
              ["4.6 y anteriores", "Sin actualización de seguridad"],
              ["7.2", "Release Candidate 2 ya contiene las correcciones"],
            ],
          },
        },
        {
          type: "p",
          text: "WordPress refuerza que solo la versión más reciente tiene soporte activo. Las versiones de mantenimiento cierran las fallas de esta ronda, pero no sustituyen la migración. La 7.1.5 es una versión de ciclo corto: la próxima versión principal, 7.2, está prevista para el 8 de diciembre.",
        },
      ],
    },
    {
      heading: "Por qué importa la falla del bloque Template Part",
      blocks: [
        {
          type: "p",
          text: "El bloque Template Part es la pieza que permite reutilizar cabecera, pie y otras áreas entre plantillas. Como esos atributos se procesan en el servidor para montar la página, una validación inadecuada convierte un campo de configuración en ruta de ejecución.",
        },
        {
          type: "p",
          text: "El punto crítico es no exigir autenticación. Las fallas que piden cuenta de autor o editor reducen mucho el universo de atacantes; una falla anónima, no. En sitios con comentarios abiertos y REST API expuesta, que es el estándar de WordPress, la superficie queda accesible para cualquiera que encuentre la instalación.",
        },
        {
          type: "callout",
          callout: {
            kind: "aviso",
            title: "Impacto posible, no confirmado",
            body: "El anuncio no reporta explotación activa ni informa qué configuraciones permiten llegar a la ejecución de código. El escenario descrito aquí es el impacto potencial de una escalada de privilegios sin autenticación en el núcleo, no un incidente observado. Tratarlo como riesgo a reducir con la actualización, no como compromiso comprobado.",
          },
        },
        {
          type: "list",
          title: "Qué permitiría una cuenta administrativa indebida, en teoría",
          items: [
            "Instalar y modificar plugins y temas, incluido código propio.",
            "Crear o promover otras cuentas y persistir el acceso después de la corrección.",
            "Leer y exportar contenido, usuarios y configuraciones del sitio.",
            "En Multisite, alcanzar la red entera cuando la cuenta obtenida es Super Admin.",
          ],
        },
      ],
    },
    {
      heading: "Recomendaciones de mitigación",
      blocks: [
        {
          type: "p",
          text: "La corrección oficial existe y la actualización es simple. Lo que falla en la práctica es comprobar que llegó a todos los sitios:",
        },
        {
          type: "list",
          items: [
            "**Actualizar a WordPress 7.1.5** desde el panel, en Actualizaciones, o descargar la versión en WordPress.org.",
            "**Confirmar la versión instalada** después de la actualización, en el pie del panel o en Herramientas e Información del sitio.",
            "**Aplicar la versión corregida de la rama** cuando la migración a 7.1.5 no sea posible: 7.0.9, 6.9.12 o 4.7.40.",
            "**Revisar instalaciones Multisite** y comprobar las cuentas con Super Admin, buscando accesos que no deberían existir.",
            "**Verificar los sitios con actualización automática en segundo plano**, porque el proceso no siempre concluye y el panel sigue mostrando la versión antigua.",
            "**Mantener inventario de las versiones de WordPress en uso**, incluidos los sitios olvidados en hosting compartido y los entornos de prueba.",
            "**Confirmar con el proveedor de hosting** la disponibilidad de las versiones de seguridad cuando la actualización es gestionada por él.",
            "**Priorizar la migración a la versión más reciente**, que es la única con soporte activo, en lugar de tratar las ramas antiguas como destino.",
          ],
        },
        {
          type: "p",
          text: "Para quien administra varios sitios, la pregunta que cierra el ciclo es siempre la misma: qué versión está en ejecución ahora, en cada instalación, y cuántas siguen en ramas que ya recibieron corrección pero no fueron aplicadas.",
        },
      ],
    },
    {
      heading: "Qué aún no se sabe y límites del artículo",
      blocks: [
        {
          type: "p",
          text: "WordPress no afirma que las fallas estén en explotación activa y no publica el detalle técnico de cada corrección. Tampoco informa qué configuraciones de sitio permiten que la escalada de privilegios llegue a la ejecución de código, lo que impide una priorización por tipo de instalación.",
        },
        {
          type: "p",
          text: "Este artículo no cubre plugins y temas de terceros, que siguen su propio ciclo de correcciones, ni sustituye la lectura del anuncio oficial por quien necesita evaluar una exposición específica. CyDef actualizará el análisis si WordPress o los investigadores publican nuevos datos sobre explotación.",
        },
      ],
    },
  ],
  sources: [
    {
      label: "WordPress.org: WordPress 7.1.5 Release (18/11/2026)",
      url: "https://wordpress.org/news/2026/11/wordpress-7-1-5-release/",
    },
    {
      label: "Cyber Security News: WordPress 7.1.5 Patches 20 Security Issues, Including Potential RCE and SQL Injection Flaws",
      url: "https://cybersecuritynews.com/wordpress-7-1-5-patches-20-security-issues/",
    },
  ],
  changelog: [
    "2026-11-19: primera versión publicada, basada en el anuncio oficial de WordPress.org y en el análisis de Cyber Security News.",
  ],
};
