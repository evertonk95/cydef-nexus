import type { BlogPost } from "./posts";

/**
 * StingyBasilisk: SMB and named pipes across isolated Windows networks (EN).
 * Source: Positive Technologies analysis (Habr) and Cyber Security News report.
 * Cover: public/assets/blog/stingybasilisk-smb-pipes-nomeados-espionagem-thumb.webp
 */
export const stingybasiliskSmbPipesPostEn: BlogPost = {
  slug: "stingybasilisk-smb-pipes-nomeados-espionagem",
  title:
    "StingyBasilisk uses SMB and named pipes to spread malware across isolated Windows networks",
  category: "Threat Intelligence",
  excerpt:
    "Positive Technologies attributes to the StingyBasilisk group an espionage campaign active since at least April 2022 that uses SMB, scheduled tasks through atexec, COM hijacking and the Windows Time provider to move implants between hosts and reach isolated segments.",
  date: "November 17, 2026",
  dateISO: "2026-11-17",
  readTime: "8 min",
  image: "/assets/blog/stingybasilisk-smb-pipes-nomeados-espionagem-thumb.webp",
  author: "CyDef Team",
  tags: [
    "StingyBasilisk",
    "Espionage",
    "SMB",
    "Named Pipes",
    "Lateral Movement",
    "Persistence",
    "Windows",
    "Threat Intelligence",
  ],
  toc: true,
  sections: [
    {
      blocks: [
        {
          type: "p",
          text: "In November 2026, Positive Technologies published an incident response analysis of an espionage group that moves through victim networks using the SMB protocol and Windows named pipes. The group was named StingyBasilisk and has been active since at least April 2022. From February 2026, it began spreading actively across the networks of compromised organizations.",
        },
        {
          type: "p",
          text: "The analysis describes a network of custom agents controlled through named pipes, able to cross isolated segments by way of intermediary hosts. Every implant identified is a DLL that stays dormant until it receives a packet with a specific signature, then decrypts and runs its payload in memory. The initial access vector was not determined.",
        },
        {
          type: "callout",
          callout: {
            kind: "ponto",
            title: "CyDef assessment",
            body: "The most relevant part of this campaign is not a new vulnerability, it is the use of legitimate Windows features as transport. SMB, scheduled tasks, COM TreatAs keys and W32Time providers exist for administration and for the operating system itself. In a network where those components are not monitored, the attacker traffic blends in with operational traffic. The named pipe chain also shows why segmenting the network without restricting SMB between segments solves little: the intermediary host becomes the bridge into the isolated segment.",
          },
        },
        {
          type: "note",
          text: "Author: CyDef Team. Positive Technologies analysis (Habr) and the Cyber Security News report were reviewed on November 17, 2026.",
        },
      ],
    },
    {
      heading: "Executive summary",
      blocks: [
        {
          type: "p",
          text: "What is known about the activity, based on the analysis published by Positive Technologies and the Cyber Security News report:",
        },
        {
          type: "list",
          items: [
            "**Group:** StingyBasilisk, a name assigned by Positive Technologies. No confirmed link to known threat groups.",
            "**Assessed motivation:** espionage, based on dwell time and the low-profile nature of the operation.",
            "**Activity window:** at least since April 2022, with network-wide spreading from February 2026.",
            "**Initial access:** not identified by the researchers.",
            "**Lateral movement:** file copies over SMB into C:\\Windows\\Temp and remote execution with atexec from the Impacket toolkit, through the \\pipe\\atsvc pipe and the Windows Task Scheduler.",
            "**Persistence:** COM object hijacking through TreatAs keys and a malicious provider registered under W32Time\\TimeProviders.",
            "**Control:** named pipes with predictable name patterns and packets carrying a specific signature that wake the implants.",
            "**Execution:** payloads decrypted and executed in memory, with no final code written to disk.",
            "**Target:** Windows networks of organizations, with attention to isolated segments reached through intermediary hosts.",
          ],
        },
        {
          type: "table",
          table: {
            headers: ["Attribute", "Detail"],
            rows: [
              ["Activity name", "StingyBasilisk"],
              ["Motivation", "Espionage, per the researchers' assessment"],
              ["Origin", "Not determined in the published material"],
              ["Analysis published", "November 2026"],
              ["Active since", "At least April 2022"],
              ["Core technique", "Spreading over SMB and control through named pipes"],
              [
                "Components",
                "Impacket atexec, SilentCOM, TediousLoader, CunningDoor and HenMapCaCon.dll",
              ],
            ],
          },
        },
      ],
    },
    {
      heading: "Lateral movement over SMB and execution with atexec",
      blocks: [
        {
          type: "p",
          text: "From February 2026, the group began copying malicious files to target machines over SMB, writing them to C:\\Windows\\Temp. Remote execution uses atexec, an Impacket toolkit tool that creates and launches tasks through the Windows Task Scheduler.",
        },
        {
          type: "p",
          text: "The atexec connects over SMB, opens the \\pipe\\atsvc pipe and creates a task that runs immediately, a path similar to the classic abuse of PsExec. The difference observed in this campaign is in the task names: the attackers use GUID-format names rather than the default name generated by the Impacket script. It is a small clue, but a useful one for detection.",
        },
        {
          type: "list",
          items: [
            "Task names in GUID format, different from the atexec default, are one of the few visible signs of the spreading phase.",
            "The C:\\Windows\\Temp directory holds both the transferred files and the inputs used by the loaders, including an encrypted shellcode file and an XOR key file.",
            "CunningDoor is launched with rundll32 against a signed SafeNet library (IKEYUI64.dll or eToken.dll), which in turn loads the malicious loader iKeyAPI.dll, a DLL side-loading case.",
          ],
        },
        {
          type: "p",
          text: "Using a legitimate, signed library as the first link reduces the value of code signing as a trust criterion. What distinguishes the malicious file is context: its location, the process loading it and the execution chain started from the Task Scheduler.",
        },
      ],
    },
    {
      heading: "Persistence through COM TreatAs and the Time provider",
      blocks: [
        {
          type: "p",
          text: "To survive reboots, the group uses two uncommon mechanisms. The first is COM hijacking: the attackers change the TreatAs key of the Network List Manager and Network Configuration objects so that any process calling those components loads the attacker DLL instead of the original one.",
        },
        {
          type: "list",
          items: [
            "**COM hierarchy:** the netprofmprox.dll, netcfgprox.dll and netprogmprox.dll libraries mimic the names of legitimate system libraries, which makes them hard to spot in a quick inspection.",
            "**Stability:** the fake library forwards calls to the original one, so the system keeps working and the persistence does not reveal itself through failure.",
            "**Environment check:** the SilentCOM family verifies that it is running inside svchost.exe with the -k netsvcs parameter and exits if it is not, avoiding execution outside the expected context.",
            "**Hijacked CLSIDs:** {DCB00C01-570F-4A9B-8D69-199FDBA5723B} for Network List Manager and {5b035261-40f9-11d1-aaec-00805fc1270e} for Network Configuration.",
          ],
        },
        {
          type: "p",
          text: "The second mechanism abuses the Windows Time service. The attackers register their own provider under HKLM\\SYSTEM\\CurrentControlSet\\Services\\W32Time\\TimeProviders with Enabled set to 1. On every boot, the service loads the attacker DLL (wgtdgr.dll) inside svchost.exe with Local System rights.",
        },
        {
          type: "p",
          text: "That loader, called TediousLoader, opens raw sockets on every network adapter on the machine and reads incoming packets looking for a secret signature. A valid packet tells the implant whether to connect, listen or bind, and the received code is decrypted with AES-256 and executed in memory.",
        },
      ],
    },
    {
      heading: "Named pipe control and the implants",
      blocks: [
        {
          type: "p",
          text: "Named pipes are a normal Windows feature for inter-process communication, and that normality is what gives the command channel its cover. The backdoors create pipes with predictable name patterns and wait for encrypted shellcode, which allows infected hosts to be chained: a machine with no direct internet access can be reached through a compromised network neighbor.",
        },
        {
          type: "table",
          table: {
            headers: ["Component", "Observed role"],
            rows: [
              [
                "CunningDoor",
                "Loader started by rundll32 against a signed SafeNet DLL, with payload obtained through side-loading and pipes in a predictable pattern.",
              ],
              [
                "TediousLoader",
                "W32Time provider loader, opens raw sockets and looks for packets with a specific signature.",
              ],
              [
                "SilentCOM",
                "Family of DLLs that hijack COM objects through TreatAs and forward calls to the original library.",
              ],
              [
                "HenMapCaCon.dll",
                "Go backdoor that exposes a TLS server over a named pipe and can pull files out of the infected system.",
              ],
            ],
          },
        },
        {
          type: "p",
          text: "Communication is the link that turns isolated implants into a network of agents. Each host can relay commands to the next one, and the analysis reports that the researchers were able to capture and decrypt a payload by watching named pipe traffic against the known patterns. The same technique is available to defensive teams.",
        },
      ],
    },
    {
      heading: "Indicators of compromise",
      blocks: [
        {
          type: "p",
          text: "The indicators below reproduce those published in the analysis. They describe the sample under review and do not exhaust the activity: file and pipe name variation is expected in a campaign with this much operating time.",
        },
        {
          type: "table",
          table: {
            headers: ["Type", "Value", "Description"],
            rows: [
              ["Path", "C:\\Windows\\Temp", "Directory used for files transferred over SMB"],
              ["Named pipe", "\\pipe\\atsvc", "Used by atexec for remote execution"],
              [
                "Command line",
                "rundll32.exe IKEYUI64.dll,ikeyUI_DlgSelectDeviceA",
                "CunningDoor launch",
              ],
              [
                "DLL",
                "IKEYUI64.dll / eToken.dll",
                "Signed SafeNet libraries abused for DLL side-loading",
              ],
              ["DLL", "iKeyAPI.dll", "Malicious loader"],
              ["DLL", "DLPReel.dll", "Malicious loader with the REEL_Initialize export"],
              ["File", "C:\\Windows\\Temp\\oluivzdz", "Encrypted shellcode"],
              ["File", "C:\\Windows\\Temp\\sqlslzgqpukrpd", "XOR key file"],
              ["DLL", "netprofmprox.dll", "SilentCOM hijacking the Network List Manager"],
              ["DLL", "netcfgprox.dll", "SilentCOM hijacking the Network Configuration"],
              ["DLL", "netprogmprox.dll", "SilentCOM hijacking the Network List Manager"],
              ["DLL", "wgtdgr.dll", "Malicious time provider DLL"],
              ["DLL", "HenMapCaCon.dll", "Backdoor written in Go"],
              [
                "CLSID",
                "{DCB00C01-570F-4A9B-8D69-199FDBA5723B}",
                "Hijacked Network List Manager",
              ],
              [
                "CLSID",
                "{5b035261-40f9-11d1-aaec-00805fc1270e}",
                "Hijacked Network Configuration",
              ],
              [
                "Registry",
                "HKLM\\SYSTEM\\CurrentControlSet\\Services\\W32Time\\TimeProviders",
                "Time provider persistence location",
              ],
              [
                "Named pipe",
                "\\.\\pipe\\04120e81-9a1a-4aca-97fb-a40da6acd500",
                "Sample pipe associated with SilentCOM",
              ],
              [
                "Named pipe",
                "\\.\\pipe\\ProProBitOpen",
                "Pipe associated with HenMapCaCon",
              ],
              ["Pipe pattern", "\\pipe\\[a-z]+\\.[a-f0-9]{8}", "CunningDoor pipe naming pattern"],
              [
                "ChaCha20 constant",
                "71 20 2F 78 48 3F D9 14 48 B0 13 DA 02 32 46 88",
                "Modified constant, an in-memory indicator",
              ],
              [
                "Server public key",
                "DD 2B 6E 28 27 12 50 2D 3C 36 B6 FE C8 B2 B9 56 1B C9 CE A9 45 86 80 3C 88 9E C9 21 4B CF AC 06",
                "Key encoded in a sample",
              ],
              [
                "Lookup key",
                "qzYMRSSTiWXZzuZxsSjlKiuXJCaNrsZyZAYAKvCchfBzgpLSSZjEr",
                "Key for the /fetch endpoint in HenMapCaCon",
              ],
            ],
          },
        },
      ],
    },
    {
      heading: "Impact and reach into isolated segments",
      blocks: [
        {
          type: "p",
          text: "The impact assessed by the researchers is espionage with prolonged dwell time. The distinguishing feature of the campaign is reach: by turning already compromised hosts into bridges, the group gets to segments without direct internet access that, in many network designs, are treated as isolated enough not to need monitoring.",
        },
        {
          type: "list",
          items: [
            "**Collection and dwell time:** continuous access to the compromised network, with tooling that does not leave the final payload on disk.",
            "**Spreading:** SMB copies and scheduled task execution between hosts in the same domain or with valid credentials.",
            "**Dual persistence:** COM and W32Time, two mechanisms that survive a reboot without requiring a visible dedicated service.",
            "**In-memory execution:** payloads decrypted at runtime, which limits file-scan detection.",
          ],
        },
      ],
    },
    {
      heading: "Mitigations and detection",
      blocks: [
        {
          type: "p",
          text: "The recommendations below start from what the analysis itself points to as observable. None of them replaces inventory and access control, but each covers a concrete step in the chain:",
        },
        {
          type: "list",
          items: [
            "**Restrict SMB between network segments**, especially between workstations and between trust zones.",
            "**Monitor scheduled task creation** and flag GUID-format names, which depart from the atexec default.",
            "**Inspect named pipe traffic** for the patterns associated with the activity and for use of the \\pipe\\atsvc pipe from workstations.",
            "**Review TreatAs keys** for COM objects and the W32Time\\TimeProviders entries, comparing them against the fleet baseline.",
            "**Investigate unusual DLLs** in system directories and suspicious files in C:\\Windows\\Temp.",
            "**Monitor the modified ChaCha20 constant** listed in the indicators, useful for memory inspection.",
            "**Correlate events** from SMB, task execution, registry changes and DLL loading on the same host and within the same time window.",
            "**Log calls to network discovery COM objects** and the loading of libraries by processes that normally do not load them.",
          ],
        },
        {
          type: "p",
          text: "In the event of compromise, the guidance is to investigate the indicators on affected hosts and segments, including named pipes and persistence changes, isolate the compromised systems and analyze the identified implants and payloads. Containment should assume that an apparently secondary host may be the path into the isolated segment.",
        },
      ],
    },
    {
      heading: "What is still unknown and the limits of this article",
      blocks: [
        {
          type: "p",
          text: "The initial access vector was not identified, and the published material does not link the group to a state or to another known threat set. The espionage motivation is the researchers' assessment, based on dwell time and discreet behavior, not a conclusion documented by public evidence of specific collection.",
        },
        {
          type: "p",
          text: "The publication does not state which specific Windows versions are affected, nor the exact scope of the compromise in the targeted organizations. The indicators reflect the samples analyzed and should be treated as a starting point for hunting, not a closed list. This article does not replace reading the original analysis for anyone who needs to assess exposure in their own environment, and CyDef will update the content if Positive Technologies publishes new data.",
        },
      ],
    },
  ],
  sources: [
    {
      label:
        "Positive Technologies (Habr): analysis of the StingyBasilisk group and its SMB and named pipe chain",
      url: "https://habr.com/ru/companies/pt/articles/1106872/",
    },
    {
      label:
        "Cyber Security News: Hackers Use Windows Named Pipes and SMB to Spread Malware Across Isolated Government Networks",
      url: "https://cybersecuritynews.com/windows-named-pipes-and-smb/",
    },
  ],
  changelog: [
    "2026-11-17: first published version, based on the Positive Technologies analysis and the Cyber Security News report.",
  ],
};
