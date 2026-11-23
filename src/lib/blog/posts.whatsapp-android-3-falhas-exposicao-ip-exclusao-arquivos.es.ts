import type { BlogPost } from "./posts";

/**
 * WhatsApp corrige tres fallas en Android: eliminacion de archivos, exposicion de IP y Private Processing (ES).
 * Fuente: aviso de seguridad de WhatsApp de noviembre de 2026 y reportaje de Cyber Security News.
 * Portada: public/assets/blog/whatsapp-android-3-falhas-exposicao-ip-exclusao-arquivos-capa.webp
 */
export const whatsappAndroid3FalhasPostEs: BlogPost = {
  slug: "whatsapp-android-3-falhas-exposicao-ip-exclusao-arquivos",
  title:
    "WhatsApp corrige tres fallas en Android, incluida la exposicion de IP y la eliminacion de archivos locales",
  category: "Inteligencia de Amenazas",
  excerpt:
    "El aviso de seguridad de noviembre de 2026 de WhatsApp describe tres fallas: una inyeccion SQL en Android que puede eliminar archivos almacenados por la aplicacion despues de que el destinatario toca un mensaje de detalles de pedido, una falla que expone la direccion IP al mostrar mensajes con enlace de medios externo en respuestas de anuncios Click to WhatsApp y una validacion incompleta de los servidores del Private Processing de Meta AI.",
  date: "23 de Noviembre, 2026",
  dateISO: "2026-11-23",
  readTime: "7 min",
  image: "/assets/blog/whatsapp-android-3-falhas-exposicao-ip-exclusao-arquivos-capa.webp",
  author: "Equipo CyDef",
  tags: [
    "WhatsApp",
    "Vulnerabilidades",
    "Inyeccion SQL",
    "Exposicion de Informacion",
    "Actualizacion de Seguridad",
    "Inteligencia de Amenazas",
  ],
  toc: true,
  sections: [
    {
      blocks: [
        {
          type: "p",
          text: "El aviso de seguridad de noviembre de 2026 de WhatsApp describe tres fallas corregidas en la aplicacion. Una permite la eliminacion de archivos almacenados localmente por WhatsApp en Android despues de que el destinatario toca un mensaje de detalles de pedido. Otra expone la direccion IP del usuario cuando la aplicacion muestra un mensaje con enlace de medios externo vinculado a respuestas de anuncios Click to WhatsApp. La tercera permite que alguien posicionado dentro de la infraestructura de Meta eluda una verificacion de seguridad del Private Processing, el servicio de procesamiento privado de Meta AI.",
        },
        {
          type: "p",
          text: "Las fallas se identifican como CVE-2026-102769, CVE-2026-23871 y CVE-2026-44908. WhatsApp informo que no tiene evidencia de explotacion de la falla de eliminacion de archivos. La exposicion de IP aparece en el aviso como posiblemente abusada junto con mensajes de spam, sin divulgar el numero de usuarios afectados.",
        },
        {
          type: "callout",
          callout: {
            kind: "ponto",
            title: "Evaluacion CyDef",
            body: "Dos de las tres fallas viven en la aplicacion que la mayoria de las organizaciones trata como herramienta de comunicacion informal, fuera del inventario de sistemas criticos. La correccion llega por la tienda de aplicaciones, no por el sistema operativo, y depende de que el usuario actualice. WhatsApp Business es una aplicacion separada, con versiones propias, y suele quedar atras en telefonos corporativos justamente porque se instalo una vez y se olvido.",
          },
        },
        {
          type: "note",
          text: "Autor: Equipo CyDef. Aviso de seguridad de WhatsApp y reportaje de Cyber Security News consultados el 23 de Noviembre de 2026.",
        },
      ],
    },
    {
      heading: "Resumen ejecutivo",
      blocks: [
        {
          type: "p",
          text: "Lo que se sabe sobre las tres fallas, con base en las fuentes consultadas:",
        },
        {
          type: "list",
          items: [
            "**Eliminacion de archivos (CVE-2026-102769):** inyeccion SQL en WhatsApp para Android anterior a la version 2.26.35.74. Exige que el destinatario toque un mensaje de detalles de pedido y alcanza solo archivos almacenados localmente por la aplicacion, no archivos de todo el dispositivo.",
            "**Exposicion de IP (CVE-2026-23871):** afecta WhatsApp y WhatsApp Business para Android anteriores a la version 2.26.17.4. La aplicacion no verificaba por completo los enlaces de medios externos en respuestas vinculadas a anuncios Click to WhatsApp, y un dispositivo podia revelar su propia direccion IP al mostrar el mensaje en el chat.",
            "**Bypass en Private Processing (CVE-2026-44908):** falla en la validacion de la identidad de los servidores usados por el Private Processing de Meta AI. Requeriria a alguien posicionado dentro de la infraestructura de Meta.",
            "**Explotacion activa:** WhatsApp afirma no tener evidencia de explotacion de la falla de eliminacion de archivos. La exposicion de IP fue senalada como posiblemente abusada junto con mensajes de spam.",
            "**Correccion disponible:** versiones 2.26.35.74 y 2.26.17.4 en Android, 2.26.24.72 en iOS y 2.26.23.72 en Mac, con versiones propias para WhatsApp Business.",
          ],
        },
        {
          type: "table",
          table: {
            headers: ["Item", "Situacion"],
            rows: [
              ["Total de fallas en el aviso", "3"],
              ["Fallas en WhatsApp para Android", "2 (eliminacion de archivos y exposicion de IP)"],
              ["Falla de validacion de servidor", "1 (Private Processing de Meta AI)"],
              ["Accion del usuario exigida", "Ninguna para la falla de IP; un toque para la de archivos"],
              ["Explotacion activa confirmada", "No informada"],
              ["Posible abuso", "Exposicion de IP junto con mensajes de spam"],
            ],
          },
        },
      ],
    },
    {
      heading: "Las tres fallas en detalle",
      blocks: [
        {
          type: "p",
          text: "El aviso no publica la ruta tecnica completa de cada correccion. La tabla reune lo que las fuentes afirman sobre requisitos de explotacion y alcance:",
        },
        {
          type: "table",
          table: {
            headers: ["CVE", "Componente", "Requisito para explotar", "Impacto descrito", "Version corregida"],
            rows: [
              [
                "CVE-2026-102769",
                "WhatsApp para Android",
                "Destinatario toca un mensaje de detalles de pedido",
                "Eliminacion de archivos almacenados localmente por WhatsApp",
                "2.26.35.74",
              ],
              [
                "CVE-2026-23871",
                "WhatsApp y WhatsApp Business para Android",
                "Mensaje con enlace de medios externo mostrado en el chat",
                "Exposicion de la direccion IP del dispositivo",
                "2.26.17.4",
              ],
              [
                "CVE-2026-44908",
                "Private Processing de Meta AI",
                "Acceso a la infraestructura de Meta y certificado en un registro de terceros",
                "Bypass de la verificacion de hardware confiable",
                "Versiones especificas por plataforma",
              ],
            ],
          },
        },
        {
          type: "p",
          text: "En la falla de eliminacion de archivos, el aviso limita el dano a archivos almacenados localmente por WhatsApp, y no a archivos de todo el dispositivo. La misma falla podria revelar un bit de informacion sobre la base de datos de conversaciones del destinatario, en caso de que estuviera en linea cuando llegara el mensaje. Es una fuga limitada, no evidencia de que un atacante pudiera leer conversaciones enteras.",
        },
        {
          type: "p",
          text: "La falla de exposicion de IP tiene un requisito distinto: el aviso no describe un toque necesario, solo la visualizacion del mensaje en el chat. Una direccion IP es informacion de red, no el contenido de una conversacion. Aun asi, permite localizar el origen de la conexion y combinarlo con otros datos de campana.",
        },
        {
          type: "p",
          text: "La tercera falla es la mas restringida en alcance. El problema estaba en la verificacion de la identidad de los servidores usados por Private Processing, que confirma si el servidor se ejecuta en hardware confiable. Para explotarla seria necesario que el certificado apareciera primero en un registro de terceros. Segun WhatsApp, todos los certificados publicados correspondian a hardware confiable, lo que sostiene la conclusion de que la falla no fue explotada.",
        },
      ],
    },
    {
      heading: "Exposicion de IP y spam: el vector mas cercano al uso real",
      blocks: [
        {
          type: "p",
          text: "De las tres, la falla de IP es la unica que el aviso asocia a posible abuso. El escenario descrito involucra mensajes de spam que usan respuestas vinculadas a anuncios Click to WhatsApp para cargar enlaces de medios externos. La aplicacion no verificaba esos enlaces por completo y, al mostrar el mensaje, podia revelar la direccion IP del dispositivo.",
        },
        {
          type: "p",
          text: "Para quienes operan canales de atencion, esto importa por un motivo especifico: los anuncios Click to WhatsApp son una via legitima e incentivada de contacto con clientes. La falla no estaba en el anuncio, sino en la validacion del enlace de medios dentro de la conversacion. Un atacante que controla el contenido mostrado consigue recolectar la IP de quien solo abrio el chat, sin que la victima haga clic en nada.",
        },
        {
          type: "callout",
          callout: {
            kind: "aviso",
            title: "Lo que la direccion IP permite y lo que no permite",
            body: "La exposicion de IP no revela el contenido de las conversaciones ni da acceso a la cuenta. Entrega informacion de red que puede usarse para geolocalizacion aproximada, correlacion con otros eventos y preparacion de ataques dirigidos. El valor ofensivo esta en la combinacion, no en el dato aislado.",
          },
        },
        {
          type: "p",
          text: "El aviso no informa cuantos usuarios pueden haber sido afectados ni detalla las campanas de spam observadas. Tampoco hay confirmacion de que el abuso haya alcanzado organizaciones especificas.",
        },
      ],
    },
    {
      heading: "La falla en el Private Processing de Meta AI",
      blocks: [
        {
          type: "p",
          text: "Private Processing es el servicio que procesa solicitudes de Meta AI preservando el contenido de los mensajes. Parte de la garantia depende de probar que el servidor que ejecuta el procesamiento usa hardware confiable, con atestacion por certificado.",
        },
        {
          type: "p",
          text: "La falla estaba en esa verificacion de identidad de los servidores. Alguien posicionado dentro de la infraestructura de Meta podria eludir la comprobacion y hacerse pasar por un servidor legitimo. El requisito de posicion privilegiada reduce bastante el universo de atacantes: no es una falla que un usuario explote desde la aplicacion.",
        },
        {
          type: "p",
          text: "Aun asi, el caso es relevante como senal. Los servicios de procesamiento con garantia de privacidad dependen de una cadena de confianza de hardware y de un registro de certificados. Cuando un eslabon de esa cadena acepta un certificado sin la verificacion completa, la promesa de privacidad pasa a depender de la integridad de terceros. WhatsApp afirma que todos los certificados publicados correspondian a hardware confiable, lo que cierra el caso sin evidencia de explotacion.",
        },
      ],
    },
    {
      heading: "Productos y versiones corregidas",
      blocks: [
        {
          type: "p",
          text: "Las correcciones llegaron en versiones especificas por plataforma. Quien usa mas de una aplicacion debe verificar cada una por separado:",
        },
        {
          type: "table",
          table: {
            headers: ["Producto", "Plataforma", "Version corregida"],
            rows: [
              ["WhatsApp", "Android", "2.26.35.74 (CVE-2026-102769) y 2.26.17.4 (CVE-2026-23871)"],
              ["WhatsApp", "iOS", "2.26.24.72"],
              ["WhatsApp", "Android (Private Processing)", "2.26.23.74"],
              ["WhatsApp", "Mac", "2.26.23.72"],
              ["WhatsApp Business", "iOS", "2.26.23.72"],
              ["WhatsApp Business", "Android", "2.26.23.70"],
            ],
          },
        },
        {
          type: "p",
          text: "La recomendacion oficial es instalar la version mas reciente disponible en la tienda oficial del dispositivo y verificar WhatsApp Business por separado cuando las dos aplicaciones estan instaladas. El aviso de WhatsApp tambien recuerda que las notas de version publicadas en las tiendas pueden no listar todas las correcciones de seguridad, lo que significa que la ausencia de mencion a una CVE no indica que la aplicacion este desactualizada en seguridad.",
        },
        {
          type: "callout",
          callout: {
            kind: "ponto",
            title: "Por que la version de la tienda no basta como evidencia",
            body: "La actualizacion automatica en segundo plano puede fallar por espacio, bateria o politica del dispositivo, y la aplicacion sigue en la version anterior sin aviso claro. En un inventario corporativo, el dato que vale es la version reportada por el dispositivo, no la version disponible en la tienda.",
          },
        },
      ],
    },
    {
      heading: "Recomendaciones de mitigacion",
      blocks: [
        {
          type: "p",
          text: "La correccion es oficial y la actualizacion es simple. El trabajo real esta en probar que llego a todos los dispositivos, incluidos los que nadie audita:",
        },
        {
          type: "list",
          items: [
            "**Actualizar WhatsApp desde la tienda oficial**, verificando despues la version instalada en la configuracion de la aplicacion.",
            "**Verificar WhatsApp Business por separado**, porque es una aplicacion distinta, con ciclo y version propios.",
            "**Priorizar dispositivos Android** con versiones anteriores a 2.26.35.74 y 2.26.17.4, que concentran las dos fallas de mayor exposicion.",
            "**Incluir la aplicacion de mensajeria en el inventario** de software y en las rutinas de actualizacion, en lugar de tratarla como herramienta personal.",
            "**Confirmar la version en dispositivos gestionados por MDM** cuando la politica de actualizacion depende del usuario, ya que la tienda puede aplicar la actualizacion sin registro central.",
            "**Orientar a los usuarios a evitar tocar mensajes sospechosos de detalles de pedido** mientras la actualizacion no este confirmada.",
            "**Tener cautela con mensajes que contengan enlaces de medios externos** vinculados a anuncios Click to WhatsApp, especialmente en cuentas usadas para atencion.",
            "**Seguir los avisos de seguridad oficiales de WhatsApp**, porque las notas de las tiendas de aplicaciones no listan todas las correcciones.",
          ],
        },
        {
          type: "p",
          text: "Para quienes usan WhatsApp como canal de atencion, conviene separar dos problemas que suelen tratarse como uno solo: la actualizacion de la aplicacion y la politica de exposicion del numero corporativo. La primera es operativa y se resuelve con inventario y verificacion. La segunda es de arquitectura, y pasa por decidir que puede recibir el canal sin convertirse en superficie de recoleccion de datos de red.",
        },
      ],
    },
    {
      heading: "Lo que aun no se sabe y limites del articulo",
      blocks: [
        {
          type: "p",
          text: "El aviso no publica el detalle tecnico de las tres correcciones, no informa el numero de usuarios potencialmente afectados por la exposicion de IP y no identifica organizaciones o sectores como objetivos. Tampoco hay informacion sobre el volumen de mensajes usados en las campanas de spam citadas.",
        },
        {
          type: "p",
          text: "Este articulo se limita a lo que afirman el aviso de seguridad de WhatsApp y el reportaje de Cyber Security News. No cubre versiones futuras de la aplicacion ni sustituye la lectura del aviso oficial por quien necesita evaluar exposicion especifica. CyDef actualizara el analisis si WhatsApp o investigadores publican nuevos datos sobre explotacion.",
        },
      ],
    },
  ],
  sources: [
    {
      label: "WhatsApp: Security Advisories",
      url: "https://www.whatsapp.com/security/advisories",
    },
    {
      label:
        "Cyber Security News: WhatsApp Android Flaws Could Let Hackers Delete Users' Files and Expose IP Addresses",
      url: "https://cybersecuritynews.com/whatsapp-android-flaws/",
    },
  ],
  changelog: [
    "2026-11-23: primera version publicada, basada en el aviso de seguridad de WhatsApp y en el reportaje de Cyber Security News.",
  ],
};
