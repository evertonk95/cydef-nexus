import type { BlogPost } from "./posts";

/**
 * StingyBasilisk: SMB y pipes con nombre en redes Windows aisladas (ES).
 * Fuente: análisis de Positive Technologies (Habr) y reportaje de Cyber Security News.
 * Portada: public/assets/blog/stingybasilisk-smb-pipes-nomeados-espionagem-thumb.webp
 */
export const stingybasiliskSmbPipesPostEs: BlogPost = {
  slug: "stingybasilisk-smb-pipes-nomeados-espionagem",
  title:
    "StingyBasilisk usa SMB y pipes con nombre para propagar malware en redes Windows aisladas",
  category: "Inteligencia de Amenazas",
  excerpt:
    "Positive Technologies atribuye al grupo StingyBasilisk una campaña de espionaje activa desde al menos abril de 2022, que usa SMB, tareas programadas mediante atexec, secuestro de COM y el proveedor de hora de Windows para mover implantes entre hosts y alcanzar segmentos aislados.",
  date: "17 de Noviembre, 2026",
  dateISO: "2026-11-17",
  readTime: "8 min",
  image: "/assets/blog/stingybasilisk-smb-pipes-nomeados-espionagem-thumb.webp",
  author: "Equipo CyDef",
  tags: [
    "StingyBasilisk",
    "Espionaje",
    "SMB",
    "Pipes con nombre",
    "Movimiento lateral",
    "Persistencia",
    "Windows",
    "Inteligencia de Amenazas",
  ],
  toc: true,
  sections: [
    {
      blocks: [
        {
          type: "p",
          text: "En noviembre de 2026, Positive Technologies publicó un análisis de respuesta a incidentes sobre un grupo de espionaje que se desplaza por las redes de las víctimas usando el protocolo SMB y pipes con nombre de Windows. El grupo recibió el nombre de StingyBasilisk y está activo desde al menos abril de 2022. A partir de febrero de 2026, comenzó a propagarse de forma activa por las redes de las organizaciones comprometidas.",
        },
        {
          type: "p",
          text: "El análisis describe una red de agentes personalizados controlados por pipes con nombre, capaz de atravesar segmentos aislados mediante hosts intermedios. Todos los implantes identificados son DLL que permanecen inactivas hasta recibir un paquete con una firma específica y, entonces, descifran y ejecutan el payload en memoria. El vector de acceso inicial no fue determinado.",
        },
        {
          type: "callout",
          callout: {
            kind: "ponto",
            title: "Evaluación CyDef",
            body: "Lo más relevante de esta campaña no es una vulnerabilidad nueva, es el uso de funciones legítimas de Windows como transporte. SMB, tareas programadas, claves TreatAs de COM y proveedores de W32Time existen para la administración y para el funcionamiento del sistema. En una red donde esos componentes no se monitorean, el tráfico del invasor se confunde con el tráfico de operación. La cadena de pipes con nombre también muestra por qué segmentar la red sin restringir SMB entre segmentos resuelve poco: el host intermedio se convierte en el puente hacia el segmento aislado.",
          },
        },
        {
          type: "note",
          text: "Autor: Equipo CyDef. Análisis de Positive Technologies (Habr) y reportaje de Cyber Security News consultados el 17 de noviembre de 2026.",
        },
      ],
    },
    {
      heading: "Resumen ejecutivo",
      blocks: [
        {
          type: "p",
          text: "Lo que se sabe sobre la actividad, con base en el análisis publicado por Positive Technologies y en el reportaje de Cyber Security News:",
        },
        {
          type: "list",
          items: [
            "**Grupo:** StingyBasilisk, nombre asignado por Positive Technologies. No hay vinculación confirmada con grupos de amenaza conocidos.",
            "**Motivación evaluada:** espionaje, por el tiempo de permanencia y el perfil discreto de la operación.",
            "**Ventana de actividad:** al menos desde abril de 2022, con propagación por la red a partir de febrero de 2026.",
            "**Acceso inicial:** no identificado por los investigadores.",
            "**Movimiento lateral:** copia de archivos por SMB hacia C:\\Windows\\Temp y ejecución remota con atexec, del toolkit Impacket, mediante el pipe \\pipe\\atsvc y el Programador de tareas de Windows.",
            "**Persistencia:** secuestro de objetos COM por claves TreatAs y proveedor malicioso registrado en W32Time\\TimeProviders.",
            "**Control:** pipes con nombre de patrones previsibles y paquetes con firma específica que activan los implantes.",
            "**Ejecución:** payloads descifrados y ejecutados en memoria, sin escribir el código final en disco.",
            "**Objetivo:** redes Windows de organizaciones, con atención a segmentos aislados alcanzados por hosts intermedios.",
          ],
        },
        {
          type: "table",
          table: {
            headers: ["Atributo", "Detalle"],
            rows: [
              ["Nombre de la actividad", "StingyBasilisk"],
              ["Motivación", "Espionaje, según la evaluación de los investigadores"],
              ["Origen", "No determinado en el material publicado"],
              ["Publicación del análisis", "Noviembre de 2026"],
              ["Activo desde", "Al menos abril de 2022"],
              ["Técnica central", "Propagación por SMB y control por pipes con nombre"],
              [
                "Componentes",
                "Impacket atexec, SilentCOM, TediousLoader, CunningDoor y HenMapCaCon.dll",
              ],
            ],
          },
        },
      ],
    },
    {
      heading: "Movimiento lateral por SMB y ejecución con atexec",
      blocks: [
        {
          type: "p",
          text: "A partir de febrero de 2026, el grupo comenzó a copiar los archivos maliciosos a las máquinas de destino usando SMB, escribiéndolos en C:\\Windows\\Temp. La ejecución remota se hace con atexec, herramienta del toolkit Impacket que crea y lanza tareas mediante el Programador de tareas de Windows.",
        },
        {
          type: "p",
          text: "El atexec se conecta por SMB, abre el pipe \\pipe\\atsvc y crea una tarea que se ejecuta de inmediato, un camino parecido al abuso clásico de PsExec. La diferencia observada en esta campaña está en los nombres de las tareas: los invasores usan nombres con formato GUID, y no el nombre predeterminado que genera el script de Impacket. Es una pista pequeña, pero útil para la detección.",
        },
        {
          type: "list",
          items: [
            "Los nombres de tarea con formato GUID, distintos del predeterminado de atexec, son una de las pocas señales visibles de la fase de propagación.",
            "El directorio C:\\Windows\\Temp concentra los archivos transferidos y los insumos usados por los loaders, incluido un shellcode cifrado y un archivo de clave XOR.",
            "La carga de CunningDoor se hace con rundll32 sobre una biblioteca SafeNet firmada (IKEYUI64.dll o eToken.dll), que a su vez carga el loader malicioso iKeyAPI.dll, un caso de DLL sideloading.",
          ],
        },
        {
          type: "p",
          text: "Usar una biblioteca legítima y firmada como primer eslabón reduce el valor de la firma de código como criterio de confianza. Lo que distingue al archivo malicioso es el contexto: la ubicación, el proceso que lo carga y la cadena de ejecución iniciada desde el Programador de tareas.",
        },
      ],
    },
    {
      heading: "Persistencia por COM TreatAs y por el proveedor de hora",
      blocks: [
        {
          type: "p",
          text: "Para sobrevivir a los reinicios, el grupo usa dos mecanismos poco comunes. El primero es el secuestro de COM: los invasores modifican la clave TreatAs de los objetos Network List Manager y Network Configuration, de modo que cualquier proceso que llame a esos componentes carga la DLL del invasor en lugar de la original.",
        },
        {
          type: "list",
          items: [
            "**Jerarquía de COM:** las DLL netprofmprox.dll, netcfgprox.dll y netprogmprox.dll imitan los nombres de las bibliotecas legítimas del sistema, lo que dificulta la identificación en una inspección rápida.",
            "**Estabilidad:** la biblioteca falsa reenvía las llamadas a la original, así el sistema sigue funcionando y la persistencia no se revela por un fallo.",
            "**Verificación de entorno:** la familia SilentCOM comprueba si se ejecuta dentro de svchost.exe con el parámetro -k netsvcs y termina si no es así, lo que evita la ejecución fuera del contexto esperado.",
            "**CLSIDs secuestrados:** {DCB00C01-570F-4A9B-8D69-199FDBA5723B} para Network List Manager y {5b035261-40f9-11d1-aaec-00805fc1270e} para Network Configuration.",
          ],
        },
        {
          type: "p",
          text: "El segundo mecanismo abusa del servicio de hora de Windows. Los invasores registran un proveedor propio en HKLM\\SYSTEM\\CurrentControlSet\\Services\\W32Time\\TimeProviders con Enabled igual a 1. En cada arranque, el servicio carga la DLL del invasor (wgtdgr.dll) dentro de svchost.exe con privilegios de Local System.",
        },
        {
          type: "p",
          text: "Ese loader, llamado TediousLoader, abre sockets crudos en todas las interfaces de red de la máquina y lee los paquetes recibidos en busca de una firma secreta. El paquete válido indica al implante si debe conectar, escuchar o hacer bind, y el código recibido se descifra con AES-256 y se ejecuta en memoria.",
        },
      ],
    },
    {
      heading: "Control por pipes con nombre y los implantes",
      blocks: [
        {
          type: "p",
          text: "Los pipes con nombre son un recurso normal de Windows para la comunicación entre procesos, y esa normalidad es la que da cobertura al canal de mando. Los backdoors crean pipes con patrones previsibles de nombre y esperan shellcode cifrado, lo que permite encadenar hosts infectados: una máquina sin acceso directo a internet puede ser alcanzada por un vecino de red ya comprometido.",
        },
        {
          type: "table",
          table: {
            headers: ["Componente", "Función observada"],
            rows: [
              [
                "CunningDoor",
                "Loader iniciado por rundll32 sobre DLL SafeNet firmada, con payload obtenido por sideloading y pipes de patrón previsible.",
              ],
              [
                "TediousLoader",
                "Loader de proveedor W32Time, abre sockets crudos y busca paquetes con firma específica.",
              ],
              [
                "SilentCOM",
                "Familia de DLL que secuestra objetos COM por TreatAs y reenvía las llamadas a la biblioteca original.",
              ],
              [
                "HenMapCaCon.dll",
                "Backdoor escrito en Go, expone un servidor TLS sobre pipe con nombre y permite extraer archivos del sistema infectado.",
              ],
            ],
          },
        },
        {
          type: "p",
          text: "La comunicación es el eslabón que convierte implantes aislados en una red de agentes. Cada host puede retransmitir comandos al siguiente, y el análisis relata que los investigadores lograron capturar y descifrar un payload observando el tráfico de pipes con nombre con los patrones conocidos. La misma técnica está al alcance de los equipos defensivos.",
        },
      ],
    },
    {
      heading: "Indicadores de compromiso",
      blocks: [
        {
          type: "p",
          text: "Los indicadores a continuación reproducen los publicados en el análisis. Describen la muestra analizada y no agotan la actividad: se espera variación de nombres de archivo y de pipe en una campaña con este tiempo de operación.",
        },
        {
          type: "table",
          table: {
            headers: ["Tipo", "Valor", "Descripción"],
            rows: [
              ["Ruta", "C:\\Windows\\Temp", "Directorio usado para archivos transferidos por SMB"],
              ["Pipe con nombre", "\\pipe\\atsvc", "Usado por atexec para ejecución remota"],
              [
                "Línea de comandos",
                "rundll32.exe IKEYUI64.dll,ikeyUI_DlgSelectDeviceA",
                "Inicio de CunningDoor",
              ],
              [
                "DLL",
                "IKEYUI64.dll / eToken.dll",
                "Bibliotecas SafeNet firmadas abusadas en DLL sideloading",
              ],
              ["DLL", "iKeyAPI.dll", "Loader malicioso"],
              ["DLL", "DLPReel.dll", "Loader malicioso con exportación REEL_Initialize"],
              ["Archivo", "C:\\Windows\\Temp\\oluivzdz", "Shellcode cifrado"],
              ["Archivo", "C:\\Windows\\Temp\\sqlslzgqpukrpd", "Archivo de clave XOR"],
              ["DLL", "netprofmprox.dll", "SilentCOM que secuestra el Network List Manager"],
              ["DLL", "netcfgprox.dll", "SilentCOM que secuestra el Network Configuration"],
              ["DLL", "netprogmprox.dll", "SilentCOM que secuestra el Network List Manager"],
              ["DLL", "wgtdgr.dll", "DLL maliciosa de proveedor de hora"],
              ["DLL", "HenMapCaCon.dll", "Backdoor desarrollado en Go"],
              [
                "CLSID",
                "{DCB00C01-570F-4A9B-8D69-199FDBA5723B}",
                "Network List Manager secuestrado",
              ],
              [
                "CLSID",
                "{5b035261-40f9-11d1-aaec-00805fc1270e}",
                "Network Configuration secuestrado",
              ],
              [
                "Registro",
                "HKLM\\SYSTEM\\CurrentControlSet\\Services\\W32Time\\TimeProviders",
                "Ubicación de persistencia del proveedor de hora",
              ],
              [
                "Pipe con nombre",
                "\\.\\pipe\\04120e81-9a1a-4aca-97fb-a40da6acd500",
                "Ejemplo de pipe asociado a SilentCOM",
              ],
              [
                "Pipe con nombre",
                "\\.\\pipe\\ProProBitOpen",
                "Pipe asociado a HenMapCaCon",
              ],
              ["Patrón de pipe", "\\pipe\\[a-z]+\\.[a-f0-9]{8}", "Patrón de nombres de pipe de CunningDoor"],
              [
                "Constante ChaCha20",
                "71 20 2F 78 48 3F D9 14 48 B0 13 DA 02 32 46 88",
                "Constante modificada, indicador en memoria",
              ],
              [
                "Clave pública del servidor",
                "DD 2B 6E 28 27 12 50 2D 3C 36 B6 FE C8 B2 B9 56 1B C9 CE A9 45 86 80 3C 88 9E C9 21 4B CF AC 06",
                "Clave codificada en una muestra",
              ],
              [
                "Clave de búsqueda",
                "qzYMRSSTiWXZzuZxsSjlKiuXJCaNrsZyZAYAKvCchfBzgpLSSZjEr",
                "Clave del endpoint /fetch en HenMapCaCon",
              ],
            ],
          },
        },
      ],
    },
    {
      heading: "Impacto y alcance en segmentos aislados",
      blocks: [
        {
          type: "p",
          text: "El impacto evaluado por los investigadores es de espionaje con permanencia prolongada. El rasgo distintivo de la campaña es el alcance: al convertir hosts ya comprometidos en puentes, el grupo llega a segmentos sin acceso directo a internet que, en muchos diseños de red, se consideran lo bastante aislados como para no necesitar monitoreo.",
        },
        {
          type: "list",
          items: [
            "**Recolección y permanencia:** acceso continuo a la red comprometida, con herramientas que no dejan el payload final en disco.",
            "**Propagación:** copias por SMB y ejecución por tareas programadas entre hosts del mismo dominio o con credenciales válidas.",
            "**Persistencia doble:** COM y W32Time, dos mecanismos que sobreviven al reinicio sin exigir un servicio dedicado visible.",
            "**Ejecución en memoria:** payloads descifrados en tiempo de ejecución, lo que limita la detección por escaneo de archivos.",
          ],
        },
      ],
    },
    {
      heading: "Mitigaciones y detección",
      blocks: [
        {
          type: "p",
          text: "Las recomendaciones parten de lo que el propio análisis señala como observable. Ninguna sustituye el inventario y el control de acceso, pero cada una cubre una etapa concreta de la cadena:",
        },
        {
          type: "list",
          items: [
            "**Restringir SMB entre segmentos** de red, sobre todo entre estaciones y entre zonas de confianza distintas.",
            "**Monitorear la creación de tareas programadas** y señalar nombres con formato GUID, que se apartan del predeterminado de atexec.",
            "**Inspeccionar el tráfico de pipes con nombre** en busca de los patrones asociados a la actividad y del uso del pipe \\pipe\\atsvc desde estaciones.",
            "**Revisar claves TreatAs** de objetos COM y las entradas de W32Time\\TimeProviders, comparando con la línea base de la flota.",
            "**Investigar DLL inusuales** en directorios del sistema y archivos sospechosos en C:\\Windows\\Temp.",
            "**Monitorear la constante ChaCha20 modificada** listada en los indicadores, útil para la inspección de memoria.",
            "**Correlacionar eventos** de SMB, ejecución de tareas, cambios en el registro y carga de DLL en el mismo host y en la misma ventana de tiempo.",
            "**Registrar llamadas a objetos COM** de descubrimiento de red y la carga de bibliotecas por procesos que normalmente no las cargan.",
          ],
        },
        {
          type: "p",
          text: "En caso de compromiso, la orientación es investigar los indicadores en hosts y segmentos afectados, incluidos pipes con nombre y cambios de persistencia, aislar los sistemas comprometidos y analizar los implantes y payloads identificados. La contención debe considerar que un host aparentemente secundario puede ser el camino hacia el segmento aislado.",
        },
      ],
    },
    {
      heading: "Lo que aún no se sabe y límites del artículo",
      blocks: [
        {
          type: "p",
          text: "El vector de acceso inicial no fue identificado, y el material publicado no vincula al grupo con un Estado ni con otro conjunto de amenaza conocido. La motivación de espionaje es una evaluación de los investigadores, basada en el tiempo de permanencia y en el comportamiento discreto, no una conclusión documentada por evidencia pública de recolección específica.",
        },
        {
          type: "p",
          text: "La publicación no informa versiones específicas de Windows afectadas ni el alcance exacto del compromiso en las organizaciones alcanzadas. Los indicadores reflejan las muestras analizadas y deben tratarse como punto de partida para la búsqueda, no como lista cerrada. Este artículo no sustituye la lectura del análisis original por quien necesita evaluar la exposición en su propio entorno, y CyDef actualizará el contenido si Positive Technologies publica nuevos datos.",
        },
      ],
    },
  ],
  sources: [
    {
      label:
        "Positive Technologies (Habr): análisis del grupo StingyBasilisk y de la cadena por SMB y pipes con nombre",
      url: "https://habr.com/ru/companies/pt/articles/1106872/",
    },
    {
      label:
        "Cyber Security News: Hackers Use Windows Named Pipes and SMB to Spread Malware Across Isolated Government Networks",
      url: "https://cybersecuritynews.com/windows-named-pipes-and-smb/",
    },
  ],
  changelog: [
    "2026-11-17: primera versión publicada, basada en el análisis de Positive Technologies y en el reportaje de Cyber Security News.",
  ],
};
