import type { BlogPost } from "./posts";

/**
 * StingyBasilisk: SMB e pipes nomeados em redes Windows isoladas (PT).
 * Base: análise da Positive Technologies publicada no Habr e reportagem do Cyber Security News.
 * Capa: public/assets/blog/stingybasilisk-smb-pipes-nomeados-espionagem-thumb.webp
 */
export const stingybasiliskSmbPipesPost: BlogPost = {
  slug: "stingybasilisk-smb-pipes-nomeados-espionagem",
  title:
    "StingyBasilisk usa SMB e pipes nomeados para espalhar malware em redes Windows isoladas",
  category: "Inteligência de Ameaças",
  excerpt:
    "A Positive Technologies atribui ao grupo StingyBasilisk uma campanha de espionagem ativa desde pelo menos abril de 2022, que usa SMB, tarefas agendadas via atexec, sequestro de COM e o provedor de tempo do Windows para mover implantes entre hosts e alcançar segmentos isolados.",
  date: "17 de Novembro, 2026",
  dateISO: "2026-11-17",
  readTime: "8 min",
  image: "/assets/blog/stingybasilisk-smb-pipes-nomeados-espionagem-thumb.webp",
  author: "Equipe CyDef",
  tags: [
    "StingyBasilisk",
    "Espionagem",
    "SMB",
    "Pipes Nomeados",
    "Movimento Lateral",
    "Persistência",
    "Windows",
    "Inteligência de Ameaças",
  ],
  toc: true,
  sections: [
    {
      blocks: [
        {
          type: "p",
          text: "A Positive Technologies publicou, em novembro de 2026, uma análise de resposta a incidentes sobre um grupo de espionagem que se desloca pelas redes das vítimas usando o protocolo SMB e pipes nomeados do Windows. O grupo recebeu o nome StingyBasilisk e está ativo desde pelo menos abril de 2022. A partir de fevereiro de 2026, passou a se espalhar de forma ativa pela rede das organizações comprometidas.",
        },
        {
          type: "p",
          text: "A análise descreve uma rede de agentes personalizados controlados por pipes nomeados, capaz de atravessar segmentos isolados por meio de hosts intermediários. Todos os implantes identificados são DLLs que ficam inativas até receberem um pacote com assinatura específica e, então, descriptografam e executam o payload em memória. A origem do acesso inicial não foi determinada.",
        },
        {
          type: "callout",
          callout: {
            kind: "ponto",
            title: "Avaliação CyDef",
            body: "O ponto mais relevante desta campanha não é uma vulnerabilidade nova, é o uso de funcionalidades legítimas do Windows como transporte. SMB, tarefas agendadas, chaves TreatAs de COM e provedores de W32Time existem para administração e funcionamento do sistema. Em uma rede onde esses componentes não são monitorados, o tráfego do invasor se confunde com o tráfego de operação. A cadeia de pipes nomeados também mostra por que segmentar a rede sem restringir SMB entre segmentos resolve pouco: o host intermediário se torna a ponte para o segmento isolado.",
          },
        },
        {
          type: "note",
          text: "Autor: Equipe CyDef. Análise da Positive Technologies (Habr) e reportagem do Cyber Security News consultadas em 17 de Novembro de 2026.",
        },
      ],
    },
    {
      heading: "Resumo executivo",
      blocks: [
        {
          type: "p",
          text: "O que se sabe sobre a atividade, com base na análise publicada pela Positive Technologies e na reportagem do Cyber Security News:",
        },
        {
          type: "list",
          items: [
            "**Grupo:** StingyBasilisk, nome atribuído pela Positive Technologies. Não há associação confirmada a grupos de ameaça conhecidos.",
            "**Motivação avaliada:** espionagem, pelo tempo de permanência e pelo perfil discreto da operação.",
            "**Janela de atividade:** pelo menos desde abril de 2022, com disseminação pela rede a partir de fevereiro de 2026.",
            "**Acesso inicial:** não identificado pelos pesquisadores.",
            "**Movimento lateral:** cópia de arquivos por SMB para C:\\Windows\\Temp e execução remota com atexec, do toolkit Impacket, pelo pipe \\pipe\\atsvc e pelo Agendador de Tarefas.",
            "**Persistência:** sequestro de objetos COM por chaves TreatAs e provedor malicioso registrado em W32Time\\TimeProviders.",
            "**Controle:** pipes nomeados com padrões previsíveis de nome e pacotes com assinatura específica que ativam os implantes.",
            "**Execução:** payloads descriptografados e executados em memória, sem gravação do código final em disco.",
            "**Alvo:** redes Windows de organizações, com atenção a segmentos isolados alcançados por hosts intermediários.",
          ],
        },
        {
          type: "table",
          table: {
            headers: ["Atributo", "Detalhe"],
            rows: [
              ["Nome da atividade", "StingyBasilisk"],
              ["Motivação", "Espionagem, conforme avaliação dos pesquisadores"],
              ["Origem", "Não determinada no material publicado"],
              ["Publicação da análise", "Novembro de 2026"],
              ["Ativa desde", "Pelo menos abril de 2022"],
              ["Técnica central", "Disseminação por SMB e controle por pipes nomeados"],
              [
                "Componentes",
                "Impacket atexec, SilentCOM, TediousLoader, CunningDoor e HenMapCaCon.dll",
              ],
            ],
          },
        },
      ],
    },
    {
      heading: "Movimento lateral por SMB e execução com atexec",
      blocks: [
        {
          type: "p",
          text: "A partir de fevereiro de 2026, o grupo passou a copiar os arquivos maliciosos para as máquinas de destino usando SMB, gravando-os em C:\\Windows\\Temp. A execução remota é feita com o atexec, ferramenta do toolkit Impacket que cria e dispara tarefas pelo Agendador de Tarefas do Windows.",
        },
        {
          type: "p",
          text: "O atexec conecta por SMB, abre o pipe \\pipe\\atsvc e cria uma tarefa que roda imediatamente, um caminho semelhante ao abuso clássico do PsExec. A diferença observada nesta campanha está no nome das tarefas: os invasores usam nomes no formato de GUID, e não o nome padrão gerado pelo script do Impacket. É uma pista pequena, mas útil para detecção.",
        },
        {
          type: "list",
          items: [
            "Os nomes de tarefa com formato de GUID, diferentes do padrão do atexec, são um dos poucos sinais visíveis da fase de disseminação.",
            "O diretório C:\\Windows\\Temp concentra os arquivos transferidos e os insumos usados pelos loaders, incluindo um shellcode criptografado e um arquivo de chave XOR.",
            "O carregamento do CunningDoor é feito com rundll32 sobre uma biblioteca SafeNet assinada (IKEYUI64.dll ou eToken.dll), que por sua vez carrega o loader malicioso iKeyAPI.dll, um caso de DLL sideloading.",
          ],
        },
        {
          type: "p",
          text: "O uso de uma biblioteca legítima e assinada como primeiro elo reduz o valor da assinatura de código como critério de confiança. O que distingue o arquivo malicioso é o contexto: a localização, o processo que a carrega e a cadeia de execução a partir do Agendador de Tarefas.",
        },
      ],
    },
    {
      heading: "Persistência por COM TreatAs e pelo provedor de tempo",
      blocks: [
        {
          type: "p",
          text: "Para sobreviver a reinicializações, o grupo usa dois mecanismos pouco comuns. O primeiro é o sequestro de COM: os invasores alteram a chave TreatAs dos objetos Network List Manager e Network Configuration, de modo que qualquer processo que chame esses componentes carregue a DLL do invasor no lugar da original.",
        },
        {
          type: "list",
          items: [
            "**Hierarquia de COM:** as DLLs netprofmprox.dll, netcfgprox.dll e netprogmprox.dll imitam os nomes das bibliotecas legítimas do sistema, o que dificulta a identificação em uma inspeção rápida.",
            "**Estabilidade:** a biblioteca falsa repassa as chamadas para a original, então o sistema continua funcionando e a persistência não se revela por falha.",
            "**Verificação de ambiente:** a família SilentCOM confere se está rodando dentro de svchost.exe com o parâmetro -k netsvcs e encerra se não estiver, o que evita execução fora do contexto esperado.",
            "**CLSIDs sequestrados:** {DCB00C01-570F-4A9B-8D69-199FDBA5723B} para Network List Manager e {5b035261-40f9-11d1-aaec-00805fc1270e} para Network Configuration.",
          ],
        },
        {
          type: "p",
          text: "O segundo mecanismo abusa do serviço de tempo do Windows. Os invasores registram um provedor próprio em HKLM\\SYSTEM\\CurrentControlSet\\Services\\W32Time\\TimeProviders com Enabled igual a 1. A cada inicialização, o serviço carrega a DLL do invasor (wgtdgr.dll) dentro do svchost.exe com privilégio de Local System.",
        },
        {
          type: "p",
          text: "Esse loader, chamado TediousLoader, abre sockets brutos em todas as interfaces de rede da máquina e lê os pacotes recebidos em busca de uma assinatura secreta. O pacote válido informa ao implante se ele deve conectar, escutar ou fazer bind, e o código recebido é descriptografado com AES-256 e executado em memória.",
        },
      ],
    },
    {
      heading: "Controle por pipes nomeados e os implantes",
      blocks: [
        {
          type: "p",
          text: "Pipes nomeados são um recurso normal do Windows para comunicação entre processos, e é exatamente essa normalidade que dá cobertura ao canal de comando. Os backdoors criam pipes com padrões previsíveis de nome e aguardam shellcode criptografado, o que permite encadear hosts infectados: uma máquina sem acesso direto à internet pode ser alcançada por um vizinho de rede já comprometido.",
        },
        {
          type: "table",
          table: {
            headers: ["Componente", "Função observada"],
            rows: [
              [
                "CunningDoor",
                "Loader iniciado por rundll32 sobre DLL SafeNet assinada, com payload obtido por sideloading e pipes em padrão previsível.",
              ],
              [
                "TediousLoader",
                "Loader de provedor W32Time, abre sockets brutos e busca pacotes com assinatura específica.",
              ],
              [
                "SilentCOM",
                "Família de DLLs que sequestra objetos COM por TreatAs e repassa chamadas para a biblioteca original.",
              ],
              [
                "HenMapCaCon.dll",
                "Backdoor escrito em Go, expõe servidor TLS sobre pipe nomeado e permite retirar arquivos do sistema infectado.",
              ],
            ],
          },
        },
        {
          type: "p",
          text: "A comunicação é o elo que transforma implantes isolados em uma rede de agentes. Cada host pode repassar comandos ao próximo, e a análise relata que os pesquisadores conseguiram capturar e descriptografar um payload observando o tráfego de pipes nomeados com os padrões conhecidos. A mesma técnica está ao alcance de equipes defensivas.",
        },
      ],
    },
    {
      heading: "Indicadores de comprometimento",
      blocks: [
        {
          type: "p",
          text: "Os indicadores abaixo reproduzem os publicados na análise. Eles descrevem a amostra analisada e não esgotam a atividade: variação de nome de arquivo e de pipe é esperada em campanhas com esse tempo de operação.",
        },
        {
          type: "table",
          table: {
            headers: ["Tipo", "Valor", "Descrição"],
            rows: [
              ["Caminho", "C:\\Windows\\Temp", "Diretório usado para arquivos transferidos por SMB"],
              ["Pipe nomeado", "\\pipe\\atsvc", "Usado pelo atexec para execução remota"],
              [
                "Linha de comando",
                "rundll32.exe IKEYUI64.dll,ikeyUI_DlgSelectDeviceA",
                "Inicialização do CunningDoor",
              ],
              [
                "DLL",
                "IKEYUI64.dll / eToken.dll",
                "Bibliotecas SafeNet assinadas abusadas em DLL sideloading",
              ],
              ["DLL", "iKeyAPI.dll", "Loader malicioso"],
              ["DLL", "DLPReel.dll", "Loader malicioso com exportação REEL_Initialize"],
              ["Arquivo", "C:\\Windows\\Temp\\oluivzdz", "Shellcode criptografado"],
              ["Arquivo", "C:\\Windows\\Temp\\sqlslzgqpukrpd", "Arquivo de chave XOR"],
              ["DLL", "netprofmprox.dll", "SilentCOM que sequestra o Network List Manager"],
              ["DLL", "netcfgprox.dll", "SilentCOM que sequestra o Network Configuration"],
              ["DLL", "netprogmprox.dll", "SilentCOM que sequestra o Network List Manager"],
              ["DLL", "wgtdgr.dll", "DLL maliciosa de provedor de tempo"],
              ["DLL", "HenMapCaCon.dll", "Backdoor desenvolvido em Go"],
              [
                "CLSID",
                "{DCB00C01-570F-4A9B-8D69-199FDBA5723B}",
                "Network List Manager sequestrado",
              ],
              [
                "CLSID",
                "{5b035261-40f9-11d1-aaec-00805fc1270e}",
                "Network Configuration sequestrado",
              ],
              [
                "Registro",
                "HKLM\\SYSTEM\\CurrentControlSet\\Services\\W32Time\\TimeProviders",
                "Local de persistência do provedor de tempo",
              ],
              [
                "Pipe nomeado",
                "\\.\\pipe\\04120e81-9a1a-4aca-97fb-a40da6acd500",
                "Exemplo de pipe associado ao SilentCOM",
              ],
              [
                "Pipe nomeado",
                "\\.\\pipe\\ProProBitOpen",
                "Pipe associado ao HenMapCaCon",
              ],
              ["Padrão de pipe", "\\pipe\\[a-z]+\\.[a-f0-9]{8}", "Padrão de nomes de pipe do CunningDoor"],
              [
                "Constante ChaCha20",
                "71 20 2F 78 48 3F D9 14 48 B0 13 DA 02 32 46 88",
                "Constante modificada, indicador em memória",
              ],
              [
                "Chave pública do servidor",
                "DD 2B 6E 28 27 12 50 2D 3C 36 B6 FE C8 B2 B9 56 1B C9 CE A9 45 86 80 3C 88 9E C9 21 4B CF AC 06",
                "Chave codificada em uma amostra",
              ],
              [
                "Chave de busca",
                "qzYMRSSTiWXZzuZxsSjlKiuXJCaNrsZyZAYAKvCchfBzgpLSSZjEr",
                "Chave do endpoint /fetch no HenMapCaCon",
              ],
            ],
          },
        },
      ],
    },
    {
      heading: "Impacto e alcance de segmentos isolados",
      blocks: [
        {
          type: "p",
          text: "O impacto avaliado pelos pesquisadores é de espionagem com permanência prolongada. A novidade da campanha está no alcance: ao transformar hosts já comprometidos em pontes, o grupo chega a segmentos que não têm acesso direto à internet e que, em muitos desenhos de rede, são tratados como suficientemente isolados para não precisar de monitoramento.",
        },
        {
          type: "list",
          items: [
            "**Coleta e permanência:** acesso contínuo à rede comprometida, com ferramentas que não deixam o payload final em disco.",
            "**Propagação:** cópia por SMB e execução por tarefas agendadas entre hosts do mesmo domínio ou com credenciais válidas.",
            "**Persistência dupla:** COM e W32Time, dois mecanismos que sobrevivem a reinicialização sem exigir serviço dedicado visível.",
            "**Execução em memória:** payloads descriptografados em runtime, o que limita a detecção por varredura de arquivo.",
          ],
        },
      ],
    },
    {
      heading: "Mitigações e detecção",
      blocks: [
        {
          type: "p",
          text: "As recomendações abaixo partem do que a própria análise indica como observável. Nenhuma delas substitui inventário e controle de acesso, mas cada uma cobre uma etapa concreta da cadeia:",
        },
        {
          type: "list",
          items: [
            "**Restringir SMB entre segmentos** de rede, principalmente entre estações e entre zonas de confiança diferentes.",
            "**Monitorar a criação de tarefas agendadas** e sinalizar nomes no formato de GUID, que fogem do padrão do atexec.",
            "**Inspecionar tráfego de pipes nomeados** em busca dos padrões associados à atividade e do uso do pipe \\pipe\\atsvc a partir de estações.",
            "**Revisar chaves TreatAs** de objetos COM e as entradas de W32Time\\TimeProviders, comparando com a linha de base da frota.",
            "**Investigar DLLs incomuns** em diretórios do sistema e arquivos suspeitos em C:\\Windows\\Temp.",
            "**Monitorar a constante ChaCha20 modificada** listada nos indicadores, útil para inspeção de memória.",
            "**Correlacionar eventos** de SMB, execução de tarefas, alterações no registro e carregamento de DLLs no mesmo host e na mesma janela de tempo.",
            "**Registrar chamadas a objetos COM** de descoberta de rede e a carga de bibliotecas por processos que normalmente não as carregam.",
          ],
        },
        {
          type: "p",
          text: "Em caso de comprometimento, a orientação é investigar os indicadores em hosts e segmentos afetados, incluindo pipes nomeados e alterações de persistência, isolar os sistemas comprometidos e analisar os implantes e payloads identificados. A contenção deve considerar que um host aparentemente secundário pode ser o caminho para o segmento isolado.",
        },
      ],
    },
    {
      heading: "O que ainda não se sabe e limites do artigo",
      blocks: [
        {
          type: "p",
          text: "O vetor de acesso inicial não foi identificado, e o material publicado não associa o grupo a um Estado ou a outro conjunto de ameaça conhecido. A motivação de espionagem é uma avaliação dos pesquisadores, baseada no tempo de permanência e no comportamento discreto, não uma conclusão documentada por evidência pública de coleta específica.",
        },
        {
          type: "p",
          text: "A publicação não informa versões específicas do Windows afetadas, nem o alcance exato do comprometimento nas organizações atingidas. Os indicadores refletem as amostras analisadas e devem ser tratados como ponto de partida para busca, não como lista fechada. Este artigo não substitui a leitura da análise original por quem precisa avaliar exposição em ambiente próprio, e a CyDef atualizará o conteúdo caso a Positive Technologies publique novos dados.",
        },
      ],
    },
  ],
  sources: [
    {
      label:
        "Positive Technologies (Habr): análise do grupo StingyBasilisk e da cadeia por SMB e pipes nomeados",
      url: "https://habr.com/ru/companies/pt/articles/1106872/",
    },
    {
      label:
        "Cyber Security News: Hackers Use Windows Named Pipes and SMB to Spread Malware Across Isolated Government Networks",
      url: "https://cybersecuritynews.com/windows-named-pipes-and-smb/",
    },
  ],
  changelog: [
    "2026-11-17: primeira versão publicada, baseada na análise da Positive Technologies e na reportagem do Cyber Security News.",
  ],
};
