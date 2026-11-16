import type { BlogPost } from "./posts";

/**
 * NoisyTCP: condición de carrera en el TCP de Linux permite panic del kernel
 * por paquetes remotos (CVE-2026-99288, ES). Contenido elaborado a partir del
 * aviso del investigador Hyunwoo Kim (@v4bel) en GitHub y en oss-security, y de
 * la publicación del Cyber Security News, verificados el 16 de noviembre de 2026.
 * Portada: public/assets/blog/noisytcp-linux-kernel-tcp-dos-thumb.webp
 */
export const noisytcpLinuxPostEs: BlogPost = {
  slug: "noisytcp-linux-kernel-tcp-dos-cve-2026-99288",
  title:
    "NoisyTCP: falla de 11 años en el TCP de Linux permite tumbar servidores remotamente sin autenticación",
  category: "Inteligencia de Amenazas",
  excerpt:
    "Tras el fin del embargo, se divulgó la CVE-2026-99288 (NoisyTCP), una condición de carrera en el código TCP del kernel de Linux que puede activarse remotamente y sin autenticación para causar panic del kernel. La falla existe desde 2015 y afecta a casi todas las distribuciones de Linux.",
  date: "16 de noviembre de 2026",
  dateISO: "2026-11-16",
  readTime: "8 min de lectura",
  image: "/assets/blog/noisytcp-linux-kernel-tcp-dos-thumb.webp",
  author: "Equipo CyDef",
  tags: [
    "Linux",
    "Kernel",
    "TCP",
    "NoisyTCP",
    "CVE-2026-99288",
    "Condición de carrera",
    "Denegación de servicio",
    "Inteligencia de Amenazas",
  ],
  toc: true,
  sections: [
    {
      blocks: [
        {
          type: "p",
          text: "El 15 de noviembre de 2026, tras el fin del período de embargo, se divulgó el aviso sobre la **CVE-2026-99288**, bautizada como **NoisyTCP**. Es una condición de carrera en el código TCP del kernel de Linux que puede activarse remotamente y sin autenticación, causando panic del kernel y denegación de servicio.",
        },
        {
          type: "p",
          text: "La causa es una carrera entre contextos de recepción de paquetes: una búsqueda obsoleta (stale lookup) encuentra un request socket ya existente, mientras otro contexto libera ese registro y reutiliza la misma memoria para una nueva solicitud de SYN cookie con la misma tupla. El primer contexto pasa las verificaciones, pero el nuevo objeto no tiene listener asociado, y el kernel desreferencia un listener nulo y entra en panic.",
        },
        {
          type: "p",
          text: "La falla fue introducida en el commit 079096f103fa el 3 de octubre de 2015 y corregida en el commit 4e2b3ef19e0e el 3 de noviembre de 2026. Esto significa que casi todas las distribuciones de Linux cargaron la falla por cerca de 11 años.",
        },
        {
          type: "callout",
          callout: {
            kind: "ponto",
            title: "Evaluación CyDef",
            body: "Lo que hace relevante a NoisyTCP es el requisito previo mínimo: el servidor solo necesita llamar a listen() y recibir paquetes del atacante. Nada de configuración rara, regla de firewall o socket especial. Los servidores Nginx, Apache y SSH en configuración por defecto entran en el objetivo. Y hay un agravante operativo: en un servicio ejecutado en contenedor, el panic tumba el host entero, no solo la aplicación. El objetivo natural son servidores Linux expuestos a internet, y la respuesta correcta es actualizar el kernel y reiniciar.",
          },
        },
        {
          type: "note",
          text: "Autor: Equipo CyDef. Aviso de Hyunwoo Kim (@v4bel) en GitHub y en oss-security, y publicación del Cyber Security News verificados el 16 de noviembre de 2026.",
        },
      ],
    },
    {
      heading: "Resumen ejecutivo",
      blocks: [
        {
          type: "p",
          text: "Lo que se sabe hasta el 16 de noviembre de 2026, con base en el aviso del investigador y en la publicación analizada:",
        },
        {
          type: "list",
          items: [
            "**CVE:** CVE-2026-99288 (NoisyTCP), en el código TCP del kernel de Linux.",
            "**Tipo:** condición de carrera entre contextos de recepción de paquetes.",
            "**Resultado:** panic del kernel y denegación de servicio remota, sin autenticación.",
            "**Introducción:** commit 079096f103fa (3 de octubre de 2015).",
            "**Corrección:** commit 4e2b3ef19e0e (3 de noviembre de 2026).",
            "**Requisito previo:** servidor con dos o más colas de recepción, o con RPS habilitado.",
            "**No es RCE:** la publicación no presenta la falla como ejecución remota de código.",
            "**Objetivo:** servidores Linux con listeners TCP accesibles, como Nginx, Apache, SSH y proxy.",
          ],
        },
      ],
    },
    {
      heading: "Productos y entornos afectados",
      blocks: [
        {
          type: "p",
          text: "El problema afecta al kernel de Linux en sí, por lo que el alcance lo define el entorno, y no un producto de aplicación específico.",
        },
        {
          type: "list",
          items: [
            "**Kernel de Linux:** versiones que incluyen el commit 079096f103fa (2015-2026), hasta la corrección 4e2b3ef19e0e.",
            "**Servidores** con dos o más colas de recepción de paquetes, o con RPS habilitado.",
            "**Listeners TCP** accesibles por paquetes del atacante: Nginx, Apache, SSH y proxy en configuración por defecto.",
          ],
        },
        {
          type: "p",
          text: "La condición de carrera es más fácil de activar en entornos virtualizados. En las pruebas del investigador, en máquinas virtuales QEMU/KVM el disparador tomó de 5 segundos a 2 minutos, mientras que en un servidor bare-metal silencioso con 8 colas de recepción tomó cerca de 14 horas, incluso con una prueba de concepto ajustada al entorno.",
        },
      ],
    },
    {
      heading: "Cómo funciona el ataque",
      blocks: [
        {
          type: "p",
          text: "El atacante envía fragmentos IPv4 y paquetes TCP normales que caen en CPUs diferentes, explotando la diferencia de hash de recepción. Esto crea la condición de carrera en la que dos partes del kernel tocan la misma memoria en el mismo instante.",
        },
        {
          type: "list",
          items: [
            "**Camino 1 (request_sock reuse ABA race):** la búsqueda obsoleta adquiere refcount sobre el nuevo objeto y pasa la revalidación de tupla, pero el nuevo request socket no tiene listener; el camino de recepción desreferencia un listener nulo y causa panic. Resultado: denegación de servicio remota.",
            "**Camino 2 (full child socket ABA race):** puede causar use-after-free remoto, pero exige múltiples carreras encadenadas en secuencia y es mucho más difícil de activar.",
          ],
        },
        {
          type: "p",
          text: "El investigador informa que, hasta el momento, solo construyó un exploit limitado y específico para servidores virtuales, y que sigue investigando un exploit de uso general. La denegación de servicio remota, sin embargo, es alcanzable sin gran dificultad.",
        },
      ],
    },
    {
      heading: "Impacto potencial",
      blocks: [
        {
          type: "list",
          items: [
            "**Panic del kernel** y denegación de servicio remota, sin autenticación.",
            "**Indisponibilidad del host completo**, incluso cuando el servicio afectado está en un contenedor.",
            "**Posible use-after-free remoto** en el segundo camino de activación, de difícil explotación.",
            "**Alcance amplio:** casi todas las distribuciones de Linux, por cerca de 11 años.",
          ],
        },
      ],
    },
    {
      heading: "Recomendaciones de mitigación",
      blocks: [
        {
          type: "list",
          items: [
            "**Instalar** kernels actualizados con la corrección 4e2b3ef19e0e, a partir de los proveedores de las distribuciones.",
            "**Reiniciar** los sistemas después de la actualización del kernel.",
            "**Priorizar** servidores públicos que ejecutan listeners TCP.",
            "**Inventariar** contenedores y namespaces de red separados que usan kernels afectados.",
            "**Monitorear** servidores en busca de reinicios sin explicación.",
            "**Probar** las actualizaciones de kernel antes de la implantación en producción.",
          ],
        },
        {
          type: "callout",
          callout: {
            kind: "regra",
            title: "Cuando la actualización no se pueda aplicar de inmediato",
            body: "Dos mitigaciones temporales: deshabilitar SYN cookies con `sudo sysctl -w net.ipv4.tcp_syncookies=0` (por namespace de red, lo que reduce la protección contra SYN floods), o reducir las colas de recepción de la interfaz de entrada a una sola cola y deshabilitar RPS y RFS. Ambas bloquean la carrera, pero tienen costo propio y deben revertirse tras el parche.",
          },
        },
      ],
    },
    {
      heading: "Lo que aún no sabemos / límites de este artículo",
      blocks: [
        {
          type: "p",
          text: "Este artículo fue elaborado a partir del aviso del investigador Hyunwoo Kim (@v4bel) en GitHub y en oss-security, y de la publicación del Cyber Security News, con verificación el 16 de noviembre de 2026. No hay telemetría propia de CyDef sobre esta vulnerabilidad ni explotación observada internamente.",
        },
        {
          type: "p",
          text: "La falla no se presenta como ejecución remota de código, y el investigador informa que aún no hay exploit de uso general. El camino de use-after-free remoto se describe como difícil de activar. La ventana de carrera es estrecha, y en servidores bare-metal silenciosos el disparador puede tomar muchas horas. Este texto se actualizará cuando haya información nueva verificable.",
        },
      ],
    },
    {
      heading: "Próximos pasos",
      blocks: [
        {
          type: "list",
          items: [
            "Verificar las versiones de kernel de los servidores Linux del entorno.",
            "Aplicar los kernels corregidos de los proveedores de las distribuciones y reiniciar.",
            "Priorizar servidores públicos con listeners TCP.",
            "Inventariar contenedores y namespaces de red separados.",
            "Monitorear reinicios sin explicación mientras la actualización no esté completa.",
          ],
        },
      ],
    },
  ],
  sources: [
    {
      label:
        "GitHub: V4bel/NoisyTCP — Linux Kernel TCP Pre-auth Remote Corruption (CVE-2026-99288)",
      url: "https://github.com/V4bel/NoisyTCP",
    },
    {
      label:
        "oss-security: NoisyTCP — Linux Kernel TCP Pre-auth Remote Corruption (CVE-2026-99288)",
      url: "https://www.openwall.com/lists/oss-security/2026/11/15/2",
    },
    {
      label:
        "Cyber Security News: NoisyTCP — 11-Year-Old Linux Kernel Flaw Lets Unauthenticated Attackers Crash Servers Remotely",
      url: "https://cybersecuritynews.com/noisytcp-linux-kernel-vulnerability/",
    },
  ],
  changelog: [
    "2026-11-16: primera versión, basada en el aviso de Hyunwoo Kim (@v4bel) y en la publicación del Cyber Security News, verificados en esta fecha.",
  ],
};
