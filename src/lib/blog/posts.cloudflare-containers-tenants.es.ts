import type { BlogPost } from "./posts";

/**
 * Cloudflare Containers: exposición de datos residuales entre tenants (ES).
 * Traducción al español del canónico PT (posts.cloudflare-containers-tenants.ts).
 * Contenido elaborado a partir del análisis técnico publicado por Cloudflare el
 * 24/09/2026, del informe de Accomplish (divulgación responsable el 04/09/2026)
 * y de la publicación analizada por Cyber Security News.
 * Capa: public/assets/blog/cloudflare-containers-cross-tenant-thumb.webp
 */
export const cloudflareContainersTenantsPostEs: BlogPost = {
  slug: "cloudflare-containers-isolamento-entre-tenants",
  title:
    "Cloudflare Containers: falla de aislamiento entre tenants exponía datos residuales de cargas de trabajo anteriores",
  category: "Seguridad en la Nube",
  excerpt:
    "Una falla en la capa de almacenamiento de los pools compartidos de Cloudflare Containers permitía que una carga de trabajo recuperara bloques de disco residuales de contenedores de otros clientes en el mismo host físico. La exposición alcanzaba metadatos de sistema de archivos, páginas de base de datos y bases SQLite estructuralmente completas. La corrección ya se aplicó en toda la flota, sin alteración de configuración del lado del cliente.",
  date: "25 de septiembre de 2026",
  dateISO: "2026-09-25",
  readTime: "11 min de lectura",
  image: "/assets/blog/cloudflare-containers-cross-tenant-thumb.webp",
  author: "Equipo CyDef",
  tags: [
    "Cloudflare",
    "Cloudflare Containers",
    "Cloudflare Sandboxes",
    "Aislamiento entre tenants",
    "dm-thin",
    "Firecracker",
    "Seguridad en la Nube",
    "Exposición de datos",
    "Multi-tenant",
    "Blue Team",
  ],
  toc: true,
  sections: [
    {
      blocks: [
        {
          type: "p",
          text: "La Cloudflare corrigió una vulnerabilidad de exposición de datos entre tenants en la plataforma **Cloudflare Containers**, que también afectaba a **Cloudflare Sandboxes**, construido sobre Containers. La falla permitía que una carga de trabajo recuperara bloques de disco residuales dejados por contenedores de otros clientes en el mismo host físico.",
        },
        {
          type: "p",
          text: "El problema no estaba en un contenedor convencional ni en un escape de máquina virtual. El origen era la **capa de almacenamiento**: el aprovisionamiento fino del device mapper (**dm-thin**) operaba con la opción `skip_block_zeroing` habilitada en los pools compartidos, lo que hacía que bloques físicos reciclados se entregaran sin limpieza previa.",
        },
        {
          type: "p",
          text: "La divulgación responsable la realizó el **4 de septiembre de 2026** el investigador **Oren Yomtov**, de **Accomplish**, a través del programa de bug bounty de Cloudflare en HackerOne. La Cloudflare publicó el análisis técnico el **24 de septiembre de 2026** y afirma no haber encontrado, en la telemetría histórica de E/S de disco que retiene, evidencia de explotación maliciosa por terceros.",
        },
        {
          type: "callout",
          callout: {
            kind: "ponto",
            title: "Evaluación CyDef",
            body: "El caso es relevante menos por la técnica y más por la capa alcanzada. En el modelo de nube compartida, el aislamiento entre clientes es una promesa que la organización no controla y no puede verificar por sí sola: depende del proveedor. Por eso la respuesta correcta tiene dos partes. La primera es técnica, y la Cloudflare ya la ejecutó (puesta a cero de las nuevas asignaciones, retiro de los discos en ejecución y limpieza de los snapshots en caché). La segunda es de gobernanza: revisar qué secretos y datos sensibles estaban en cargas de trabajo multi-tenant y decidir sobre rotación preventiva, conforme a la política de riesgo de cada organización.",
          },
        },
        {
          type: "note",
          text: "Autor: Equipo CyDef. Fuentes consultadas y verificadas el 25 de septiembre de 2026.",
        },
      ],
    },
    {
      heading: "Resumen ejecutivo",
      blocks: [
        {
          type: "p",
          text: "Lo que se sabe hasta el 25 de septiembre de 2026, con base en el análisis técnico publicado por Cloudflare, en el informe de Accomplish y en la publicación consultada:",
        },
        {
          type: "list",
          items: [
            "**Productos afectados:** Cloudflare Containers y Cloudflare Sandboxes, en infraestructura compartida multi-tenant.",
            "**Capa de la falla:** almacenamiento, en el aprovisionamiento fino dm-thin, con la opción `skip_block_zeroing` habilitada en los pools compartidos.",
            "**Requisito previo de explotación:** cuenta Workers Paid. El atacante no podía elegir a la víctima, el host, la carga de trabajo ni el dato expuesto.",
            "**Mecanismo:** bloques físicos reciclados de 64 KiB se entregaban sin puesta a cero, lo que permitía leer hasta 60 KiB de datos residuales de otro cliente tras una escritura de apenas 4 KiB.",
            "**Escala observada en la validación:** material residual en 18 de 24 ubicaciones y en 20 de 22 nodos subyacentes, en cuatro continentes.",
            "**Tipos de dato recuperados:** estructuras de directorio, páginas de base de datos y bases SQLite estructuralmente completas.",
            "**Lo que la falla no permitía:** acceso a discos activamente conectados, alteración de datos activos de otro cliente o indisponibilidad de las cargas de trabajo.",
            "**Divulgación:** reporte el 4 de septiembre de 2026, vía HackerOne, por el investigador Oren Yomtov, de Accomplish.",
            "**Corrección:** eliminación global de `skip_block_zeroing`, retiro de los discos en ejecución, limpieza de los snapshots en caché y reinicio de las VM, sin acción necesaria del lado del cliente.",
            "**Explotación maliciosa:** ninguna actividad identificada aparte de las validaciones autorizadas de los investigadores y de los ingenieros de Cloudflare.",
          ],
        },
      ],
    },
    {
      heading: "Perfil del caso",
      blocks: [
        {
          type: "table",
          table: {
            headers: ["Atributo", "Detalle"],
            rows: [
              [
                "Nombre",
                "Exposición de datos residuales entre tenants en Cloudflare Containers",
              ],
              ["Tipo", "Falla de aislamiento entre tenants en la capa de almacenamiento"],
              [
                "Capa afectada",
                "Aprovisionamiento fino dm-thin con skip_block_zeroing habilitado",
              ],
              ["Productos", "Cloudflare Containers y Cloudflare Sandboxes"],
              [
                "Aislamiento de ejecución",
                "microVM dedicada de Firecracker por contenedor",
              ],
              ["Disco presentado a la VM", "/dev/vdc (disco raíz escribible)"],
              ["Tamaño del bloque fino", "64 KiB"],
              ["Requisito previo", "Cuenta Workers Paid"],
              ["Divulgación", "4 de septiembre de 2026, vía HackerOne"],
              ["Investigador", "Oren Yomtov, de Accomplish"],
              ["Publicación del análisis", "24 de septiembre de 2026, en el blog de Cloudflare"],
              ["CVE", "No informado en las fuentes consultadas"],
              ["Remediación", "Aplicada en toda la flota, sin configuración del cliente"],
            ],
          },
        },
      ],
    },
    {
      heading: "Cómo funcionaba el almacenamiento de los contenedores",
      blocks: [
        {
          type: "p",
          text: "Cada contenedor se ejecuta dentro de una **microVM dedicada** del monitor de máquinas virtuales **Firecracker**. La Cloudflare presenta el disco raíz escribible de esa VM como `/dev/vdc`. Cada contenedor recibe su propio disco, y es el `dm-thin` el que materializa ese disco en almacenamiento físico.",
        },
        {
          type: "p",
          text: "El aprovisionamiento fino asigna espacio físico **solo cuando** el disco virtual escribe en una región aún no mapeada. En los pools afectados, el tamaño del bloque fino era de **64 KiB**. Cuando el volumen fino que sostenía el disco raíz de un contenedor se eliminaba, sus bloques físicos volvían a un pool que atendía cargas de trabajo de **varias cuentas de clientes**.",
        },
        {
          type: "p",
          text: "El punto central está en una opción de configuración del pool, el `skip_block_zeroing`. Con esa opción habilitada, el `dm-thin` **dejaba de poner en cero** los bloques recién asignados antes de entregarlos. Una escritura del tamaño del bloque sustituía todo el contenido anterior, pero una escritura menor alteraba solo la parte escrita. El resto podía conservar datos del dueño anterior de aquel bloque físico.",
        },
      ],
    },
    {
      heading: "Cómo funcionaba la explotación",
      blocks: [
        {
          type: "p",
          text: "Leer una región no mapeada de un disco fino nuevo no revela datos residuales: en ese caso, el `dm-thin` devuelve ceros **sin asignar bloque físico**. Es por eso que la técnica reportada necesita un paso intermedio, casi contraintuitivo, para forzar la asignación.",
        },
        {
          type: "p",
          text: "La prueba de concepto identificaba regiones alineadas en **64 KiB** que correspondían a **espacio libre** en el sistema de archivos ext4 del invitado y escribía un bloque alineado de **4 KiB** en cada región. Esa escritura pequeña obligaba al `dm-thin` a asignar un bloque físico de 64 KiB reciclado, sustituyendo solo 4 KiB. Como la puesta a cero estaba deshabilitada, los **60 KiB restantes** podían conservar datos de un contenedor anterior. Una lectura cruda del dispositivo, a continuación, podía revelar bytes que el nuevo contenedor nunca había escrito.",
        },
        {
          type: "p",
          text: "La prueba de concepto ejecutaba, en orden:",
        },
        {
          type: "list",
          items: [
            "Crear un contenedor usando una cuenta Workers Paid.",
            "Abrir el disco raíz escribible en `/dev/vdc`.",
            "Leer el disco y registrar una línea base.",
            "Escribir un bloque de 4 KiB en cada región de 64 KiB correspondiente a espacio libre del ext4.",
            "Leer los bloques resultantes de nuevo.",
            "Examinar solo las porciones no sobrescritas por el nuevo contenedor.",
          ],
        },
        {
          type: "callout",
          callout: {
            kind: "aviso",
            title: "Por qué importa la lectura cruda",
            body: "El contenido recuperado no viene de una interfaz de aplicación ni de una API: viene de la lectura directa del dispositivo de bloque. Eso significa que ningún control de acceso de aplicación, permiso de archivo o cifrado de datos en reposo a nivel de aplicación interrumpe la técnica. La protección, en este caso, es la limpieza de los bloques en la capa de almacenamiento, exactamente lo que restaura la corrección.",
          },
        },
      ],
    },
    {
      heading: "Cómo se validó la falla",
      blocks: [
        {
          type: "p",
          text: "Los investigadores usaron los **checksums de bloques de directorio del ext4** (recurso `metadata_csum`) para separar bloques del propio sistema de archivos de prueba de los bloques originados de otros sistemas de archivos. Cuando el ext4 usa ese recurso, el checksum del bloque de directorio incorpora valores asociados al sistema de archivos y al inode, lo que permite atribuir un bloque a su origen.",
        },
        {
          type: "p",
          text: "El método se calibró antes contra bloques que los propios investigadores crearon y eliminaron en el sistema de archivos controlado de la prueba de concepto: **162 de 162** bloques se atribuyeron correctamente. Solo entonces la medición se aplicó a las ubicaciones de producción.",
        },
        {
          type: "table",
          table: {
            headers: ["Métrica", "Resultado reportado"],
            rows: [
              [
                "Bloques de directorio testables",
                "5.614, distribuidos en seis ubicaciones de producción",
              ],
              [
                "Bloques atribuidos al sistema de archivos de los investigadores",
                "0",
              ],
              [
                "Inodes de directorio ajenos identificados",
                "2.700",
              ],
              [
                "Control del método (bloques creados y eliminados por los investigadores)",
                "162 de 162 atribuidos correctamente",
              ],
              ["Ubicaciones con material residual", "18 de 24"],
              ["Nodos subyacentes con material residual", "20 de 22"],
              ["Cobertura geográfica", "Cuatro continentes"],
              [
                "Formatos observados",
                "Estructuras de directorio, páginas de base de datos y bases SQLite estructuralmente completas",
              ],
            ],
          },
        },
        {
          type: "p",
          text: "Según el reporte, los scripts usados producían solo **conteos agregados** y verificaciones de formato, sin contenido de archivos recuperados. Los materiales enviados a Cloudflare no contenían valores de contenido recuperado ni identificadores de terceros, y los investigadores confirmaron la eliminación segura de los datos recuperados tras la sumisión, conforme a la política de divulgación de HackerOne.",
        },
      ],
    },
    {
      heading: "Impacto potencial",
      blocks: [
        {
          type: "list",
          items: [
            "**Exposición de datos residuales:** posibilidad de recuperar bytes dejados por cargas de trabajo de otros clientes en el mismo host físico.",
            "**Metadatos de sistema de archivos:** estructuras de directorio y otros metadatos legibles en bloques reciclados.",
            "**Bases de datos:** páginas de base de datos y bases SQLite estructuralmente completas entre los formatos observados.",
            "**Ruptura del aislamiento:** la falla cruzaba el límite de aislamiento entre tenants en infraestructura compartida.",
            "**Secretos y datos de aplicación:** riesgo directo para cargas de trabajo que procesan credenciales, tokens o información sensible en ambientes multi-tenant.",
          ],
        },
      ],
    },
    {
      heading: "Lo que la falla no permitía",
      blocks: [
        {
          type: "p",
          text: "Delimitar el alcance de la falla es parte del análisis. Según las fuentes consultadas, la técnica:",
        },
        {
          type: "list",
          items: [
            "No permitía elegir a la víctima, el host, la carga de trabajo o el dato específico expuesto: la ubicación de las cargas de trabajo es automática y el cliente no selecciona el host.",
            "No permitía acceder a discos activamente conectados.",
            "No permitía modificar datos activos de otro cliente.",
            "No permitía afectar la disponibilidad de las cargas de trabajo.",
            "No garantizaba la presencia de datos residuales: la exposición dependía de qué bloques liberados reasignaba el asignador, lo que vuelve la extracción oportunista y no dirigida.",
          ],
        },
        {
          type: "p",
          text: "Aun con esas limitaciones, los fragmentos expuestos podían contener metadatos de sistema de archivos, información de aplicación y contenido sensible de base de datos. Es esa posibilidad, y no la certeza de acceso, la que justifica tratar el caso como incidente de severidad alta.",
        },
      ],
    },
    {
      heading: "Línea de tiempo",
      blocks: [
        {
          type: "table",
          table: {
            headers: ["Fecha (UTC)", "Evento"],
            rows: [
              [
                "4 de septiembre, 15:26 UTC",
                "Oren Yomtov, de Accomplish, reporta la falla mediante el programa de bug bounty en HackerOne.",
              ],
              [
                "4 de septiembre, 18:45 UTC",
                "Cloudflare abre el incidente de seguridad y confirma la configuración de producción que causaba la falla.",
              ],
              [
                "4 de septiembre, 21:27 UTC",
                "Merge de la corrección en el runtime y de la prueba de reutilización de bloques.",
              ],
              [
                "4 de septiembre, 22:03 UTC",
                "Merge de los cambios para pools nuevos y para pools activos.",
              ],
              ["4 de septiembre, 23:15 UTC", "Inicio de la distribución de los cambios."],
              [
                "7 de septiembre, 06:13 UTC",
                "Conclusión de la distribución de los cambios e inicio de la limpieza de los datos de los pools antiguos.",
              ],
              [
                "14 de septiembre, 10:50 UTC",
                "Los investigadores confirman que la prueba de concepto dejó de funcionar.",
              ],
              [
                "14 de septiembre, 12:52 UTC",
                "Cloudflare concede la recompensa al investigador.",
              ],
              [
                "19 de septiembre, 15:03 UTC",
                "Conclusión de la limpieza de todos los snapshots en caché anteriores a la corrección.",
              ],
              [
                "24 de septiembre, 15:00 UTC",
                "Publicación del análisis técnico en el blog de Cloudflare.",
              ],
            ],
          },
        },
      ],
    },
    {
      heading: "La corrección aplicada por Cloudflare",
      blocks: [
        {
          type: "p",
          text: "La primera medida fue eliminar el `skip_block_zeroing` de la configuración de los pools `dm-thin` en toda la flota, restaurando el comportamiento predeterminado de **poner en cero los bloques recién asignados** antes de exponerlos a un contenedor. Eso interrumpió la técnica reportada, en la que una escritura pequeña disparaba la asignación y una lectura mayor recuperaba los datos residuales del resto del bloque. Los investigadores confirmaron de forma independiente que la prueba de concepto dejó de funcionar tras el cambio.",
        },
        {
          type: "p",
          text: "Poner en cero las nuevas asignaciones, sin embargo, **no sanea bloques ya mapeados** en dispositivos finos existentes. Esos mapeos permanecían en los discos de contenedores en ejecución y en la caché de snapshots preparados de cada host para las capas de imágenes OCI. Un contenedor nuevo podía heredar mapeos de una capa en caché sin asignar aquellos bloques de nuevo, lo que mantenía bytes residuales legibles en regiones no usadas, incluido el espacio libre del ext4.",
        },
        {
          type: "p",
          text: "Por eso la remediación fue más allá de la opción de configuración:",
        },
        {
          type: "list",
          items: [
            "Retiro de todos los discos de contenedor en ejecución.",
            "Eliminación de los snapshots de imagen en caché creados antes de la corrección.",
            "Drenaje de los hosts en horarios de menor uso.",
            "Reinicio de las máquinas virtuales de cada host.",
            "Limpieza de la caché de imágenes de cada host, para que discos y capas se recrearan con asignaciones puestas a cero.",
          ],
        },
        {
          type: "p",
          text: "La limpieza se completó en toda la flota de Containers. La remediación **no exige alteración de configuración del lado del cliente**, aunque las organizaciones deben evaluar si los secretos tratados por las cargas de trabajo afectadas justifican rotación preventiva bajo sus propias políticas de riesgo.",
        },
      ],
    },
    {
      heading: "Detección y evidencia de explotación",
      blocks: [
        {
          type: "p",
          text: "La prueba de concepto producía una relación característica entre escrituras y lecturas: una escritura de 4 KiB en región no mapeada disparaba la asignación de un bloque reutilizado de 64 KiB y las lecturas siguientes recuperaban muchos más datos de los que el nuevo contenedor había sobrescrito.",
        },
        {
          type: "p",
          text: "Con base en esa característica, la Cloudflare desarrolló **firmas de detección** y las aplicó a la telemetría histórica de E/S de disco disponible. La revisión identificó actividad atribuible a los investigadores y a ingenieros de Cloudflare en validación autorizada, y **ninguna actividad adicional** compatible con la técnica reportada.",
        },
        {
          type: "callout",
          callout: {
            kind: "regra",
            title: "Señal útil para monitoreo",
            body: "La razón entre escritura pequeña y lectura mayor en el mismo bloque recién asignado es una señal barata de implementar en telemetría de disco de ambientes multi-tenant. El patrón es inusual en operación normal y sirve tanto para detección como para validación de hipótesis de reutilización de bloque.",
          },
        },
      ],
    },
    {
      heading: "Acciones recomendadas",
      blocks: [
        {
          type: "p",
          text: "La corrección es del lado del proveedor, pero la evaluación de exposición es del lado del cliente. Las acciones a continuación siguen las recomendaciones de las fuentes consultadas:",
        },
        {
          type: "list",
          items: [
            "Identificar cargas de trabajo que usan Cloudflare Containers o Cloudflare Sandboxes.",
            "Evaluar si los secretos procesados por cargas de trabajo afectadas exigen rotación preventiva.",
            "Revisar datos sensibles que podrían haberse almacenado o procesado en esas cargas de trabajo.",
            "Monitorear actividades anómalas de lectura y escritura en disco en las cargas de trabajo.",
            "Investigar patrones de escritura de 4 KiB seguidos por lecturas mayores en bloques recién asignados.",
            "Revisar logs y telemetría relacionados con las cargas de trabajo afectadas.",
            "Confirmar que las correcciones publicadas por Cloudflare se aplican al ambiente en uso.",
          ],
        },
      ],
    },
    {
      heading: "Cuando la evaluación no pueda completarse de inmediato",
      blocks: [
        {
          type: "list",
          items: [
            "Rotar secretos y credenciales procesados por cargas de trabajo potencialmente afectadas.",
            "Aislar o restringir cargas de trabajo que manipulan información sensible hasta la conclusión de la evaluación.",
            "Priorizar la rotación de los secretos con mayor radio de alcance, como tokens de proveedores de nube, claves de API de terceros y credenciales de base de datos.",
            "Registrar la decisión y el criterio usado, para que la elección sea auditable después.",
          ],
        },
      ],
    },
    {
      heading: "Lo que aún no sabemos / límites de este artículo",
      blocks: [
        {
          type: "p",
          text: "Este artículo se elaboró a partir del análisis técnico publicado por Cloudflare el 24 de septiembre de 2026, del informe de Accomplish y de la publicación consultada, con verificación el 25 de septiembre de 2026. No hay telemetría propia de CyDef sobre este caso, ninguna explotación observada internamente y ninguna atribución de autoría hecha aquí.",
        },
        {
          type: "p",
          text: "Las fuentes consultadas no informan **identificador CVE**, versiones o builds específicos, ni lista de ubicaciones afectadas por región. Los números de validación vienen de los propios investigadores y de Cloudflare. Tampoco hay, hasta la fecha de verificación, estimación pública de cuántos clientes o cargas de trabajo tuvieron datos residuales expuestos, ya que la exposición dependía de la ubicación de las cargas de trabajo y de la reasignación de bloques por el asignador. Este texto se actualizará cuando haya información nueva verificable.",
        },
      ],
    },
    {
      heading: "Próximos pasos",
      blocks: [
        {
          type: "list",
          items: [
            "Inventariar qué equipos usan Cloudflare Containers o Sandboxes y dónde existen secretos de producción en esas cargas de trabajo.",
            "Definir criterio de rotación preventiva de secretos para cuando un proveedor de nube reporte una falla de aislamiento entre tenants.",
            "Añadir detección del patrón de E/S anómalo (escritura pequeña seguida de lectura mayor en bloque recién asignado) al monitoreo de ambientes multi-tenant.",
            "Revisar la dependencia de aislamiento implícito del proveedor en los modelos de amenaza de aplicaciones multi-tenant.",
            "Seguir el análisis técnico de Cloudflare para incorporar los aprendizajes de arquitectura de almacenamiento a los requisitos de proveedor.",
          ],
        },
      ],
    },
  ],
  sources: [
    {
      label:
        "Cloudflare: How Cloudflare addressed a cross-tenant data exposure vulnerability in Containers",
      url: "https://blog.cloudflare.com/containers-cross-tenant-vulnerability/",
    },
    {
      label:
        "Cyber Security News: Cloudflare Containers Vulnerability Could Leak Data Between Customer Workloads",
      url: "https://cybersecuritynews.com/cloudflare-containers-vulnerability/",
    },
    {
      label: "Accomplish: Escaping the Cloudflare Sandbox",
      url: "https://accomplish.ai/blog/escaping-the-cloudflare-sandbox/",
    },
  ],
  changelog: [
    "2026-09-25: primera versión, basada en el análisis técnico de Cloudflare, en el informe de Accomplish y en la publicación consultada.",
  ],
};
