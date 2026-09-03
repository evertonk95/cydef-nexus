// CyDef Blog — English editorial translation (source: PT canonical, 2026-09-03). Human review via PR.
import type { BlogPost } from "./posts";

export const blogPostsEn: BlogPost[] = [
  {
    slug: "como-estruturar-um-soc-do-zero",
    title: "Building a SOC from scratch: Complete guide",
    category: "SOC",
    excerpt:
      "A 5-phase guide to building a SOC from scratch: scope, people, processes, technology, and metrics, with official references from NIST, MITRE, and CIS.",
    date: "August 24, 2026",
    dateISO: "2026-08-24",
    readTime: "8 min read",
    image: "/assets/blog/soc-do-zero-thumb.webp",
    author: "CyDef Team",
    sections: [
      {
        paragraphs: [
          "Standing up a Security Operations Center (SOC) from scratch is a structural decision: it defines how the organization views threats, responds to incidents, and evolves its security posture. This guide lays out a path in five phases — scope, people, processes, technology, and metrics — anchored in current official sources: NIST Cybersecurity Framework (CSF) 2.0, NIST SP 800-61r3, MITRE ATT&CK, CIS Controls, and SOC-CMM. As of the cutoff date of this review (24/08/2026), these are the current references consulted. The application of each phase depends on your organization's context; no specific tool is mandatory.",
        ],
      },
      {
        heading: "What a SOC is and when it makes sense to build one",
        paragraphs: [
          "A SOC is the organized function that monitors, detects, analyzes, and responds to security events and incidents. In practice, it centralizes visibility and response: instead of each area reacting in isolation, there is a single point of triage, investigation, and escalation.",
          "It makes sense to stand up a SOC when the organization already faces a volume of alerts it cannot handle consistently, when it needs to demonstrate security governance (customers, audits, regulators), or when recurring incidents expose detection gaps. There is no mandatory minimum size: what matters is scope — and scope comes before the tool.",
        ],
      },
      {
        heading: "Phase 1 — Scope, mission, and service model",
        paragraphs: [
          "Before procuring any technology, define what the SOC protects. The recommended starting point is the Govern function of the NIST CSF 2.0: establish the mission, the authorities, and risk tolerance.",
        ],
        lists: [
          {
            items: [
              "Which assets, systems, and data are in scope for monitoring?",
              "What is explicitly out of scope?",
              "Who decides priorities and approves investment?",
              "Which delivery model makes sense: in-house team, managed service (MSSP), or hybrid?",
            ],
          },
        ],
        paragraphsAfter: [
          "SOC-CMM, a maturity model specific to SOCs, reinforces that maturity begins with a clear definition of services and responsibilities — technology comes later. A well-defined scope avoids the classic mistake of buying a SIEM before knowing what it should correlate.",
        ],
      },
      {
        heading: "Phase 2 — People: essential roles and the minimum viable team",
        paragraphs: [
          "The team is the SOC's most expensive and most critical asset. At the start, the minimum design usually combines:",
        ],
        lists: [
          {
            title: "Triage (N1)",
            items: [
              "Analyzes alerts, applies prioritization criteria, and escalates what it cannot resolve.",
            ],
          },
          {
            title: "Analysis and response (N2)",
            items: [
              "Investigates events, contains, and coordinates response.",
            ],
          },
          {
            title: "Coordination/management",
            items: [
              "Service owner, communication with leadership, and continuous improvement.",
            ],
          },
        ],
        paragraphsAfter: [
          "Team size and shifts depend on the scope defined in Phase 1. In small teams, the same professionals accumulate roles — which should be explicit, to avoid silent overload. Continuous training and documentation are part of every role: processes cannot depend on a single person.",
        ],
      },
      {
        heading: "Phase 3 — Processes: triage, investigation, and response",
        paragraphs: [
          "Processes are what turn people and tools into a predictable service. The current reference is NIST SP 800-61r3 (finalized in April 2025), which aligns incident response with CSF 2.0 and replaces the rigid four-phase cycle of the previous revision.",
        ],
        lists: [
          {
            title: "Triage",
            items: [
              "Written criteria for prioritizing alerts (what is critical, what is noise).",
            ],
          },
          {
            title: "Runbooks/playbooks",
            items: [
              "Procedures for the most frequent scenarios (phishing, malware, suspicious access, exfiltration).",
            ],
          },
          {
            title: "Escalation",
            items: [
              "When and to whom an event moves up a level.",
            ],
          },
          {
            title: "Evidence preservation",
            items: [
              "What to collect and how, before any containment action.",
            ],
          },
          {
            title: "Communication",
            items: [
              "Who informs leadership, the customer, and authorities (e.g., LGPD/CERT.br when applicable).",
            ],
          },
        ],
        paragraphsAfter: [
          "Processes need to be tested. A playbook that has never been exercised tends to fail exactly when it matters most.",
        ],
      },
      {
        heading: "Phase 4 — Technology: what to prioritize (and what to avoid)",
        paragraphs: [
          "The recommended order is: inventory, telemetry sources, detection, and only then correlation. No tool is mandatory; the choice depends on the environment and the scope.",
        ],
        lists: [
          {
            items: [
              "Asset inventory first. You cannot monitor what you do not know.",
              "Logging and telemetry: endpoints, networks, authentication, and critical services. Without quality data, no upper layer works.",
              "CIS Controls (current version 8.1) work as a prioritized baseline of technical and hardening controls — a good starting point for reducing exposure before investing in advanced detection.",
              "Detection: EDR on endpoints and network analysis, with documented rules and hypotheses.",
              "SIEM as a correlation layer, not as a magic solution. It aggregates and correlates what telemetry sources produce.",
              "MITRE ATT&CK (current version: v19.2, since April 2026) serves as a common language for describing adversary behavior — useful for triage, detection, and communication across teams.",
            ],
          },
        ],
        paragraphsAfter: [
          "Avoid buying technology before validating your data sources. A SIEM connected to incomplete logs creates a false sense of coverage.",
        ],
      },
      {
        heading: "Phase 5 — Metrics, maturity, and evolution",
        paragraphs: [
          "A SOC needs to know whether it is fulfilling its mission. Metrics should be defined locally, with your own baseline — for example, mean time to detect (MTTD) and mean time to respond (MTTR) — and reviewed periodically. SOC-CMM can be used as a reference to assess service maturity and prioritize the next evolution.",
          "Beware of an important limitation: metrics compared without context produce invalid conclusions. One organization's MTTD is not directly comparable to another's with different scope, team, and telemetry.",
        ],
      },
      {
        heading: "What we still do not know / limits of this guide",
        paragraphs: [
          "This guide does not prescribe specific tools, does not claim CyDef telemetry or internal experience, and does not guarantee total protection — no control covers 100% of scenarios. The framework versions cited were verified on 24/08/2026 and must be revalidated before publication. The author and technical reviewer of this article have not yet been defined.",
        ],
      },
      {
        heading: "Next steps",
        paragraphs: [
          "Assess the current environment against the five phases: start with scope, design the roles, document the processes, validate the telemetry sources, and only then decide on technology. Consult the official sources listed below before investing.",
        ],
      },
    ],
    sources: [
      { label: "NIST CSF 2.0", url: "https://www.nist.gov/cyberframework" },
      { label: "NIST SP 800-61r3", url: "https://csrc.nist.gov/pubs/sp/800/61/r3/final" },
      { label: "MITRE ATT&CK (v19.2)", url: "https://attack.mitre.org/" },
      { label: "CIS Controls (v8.1)", url: "https://www.cisecurity.org/controls" },
      { label: "SOC-CMM", url: "https://www.soc-cmm.com/" },
    ],
    changelog: [
      "2026-08-24: first version, based on the verified dossier (evergreen-soc-01, READY).",
    ],
  },
  {
    slug: "mitre-attack-deteccao-tecnicas-adversarios",
    title: "MITRE ATT&CK in practice: Detecting adversary techniques",
    category: "Blue Team",
    excerpt:
      "Learn how to use the MITRE ATT&CK framework to map threats and build effective detection rules in your environment.",
    date: "August 24, 2026",
    dateISO: "2026-08-24",
    readTime: "9 min read",
    image: "/assets/blog/mitre-attack-thumb.webp",
    author: "CyDef Team",
    sections: [
      {
        paragraphs: [
          "The current version of MITRE ATT&CK, v19.2, restructured the taxonomy many teams use to name adversary behavior: the Defense Evasion tactic was split into two, and rules, dashboards, and playbooks that reference old IDs need to be revised. SOC and Blue Team analysts who use ATT&CK to drive detection should check whether their mappings still match the current version — and, more importantly, learn to map by observed behavior, not by intuition. This article presents a practical workflow for turning observations into testable detection rules, with official references verified on 24/08/2026. No specific tool is mandatory: what matters is the method and the telemetry you already collect.",
        ],
      },
      {
        heading: "What MITRE ATT&CK is and why it matters for detection",
        paragraphs: [
          "According to MITRE itself, ATT&CK is a globally accessible knowledge base of adversary tactics and techniques built from real-world observations — not a theoretical list of attacks (F01). The framework organizes behavior into three levels: **tactics** (the adversary's objective, the \"why\"), **techniques** (the \"what\"), and **sub-techniques** (variations of \"how\"), distributed across the Enterprise, Mobile, and ICS matrices.",
          "For detection, the value lies in two points. First, it provides a common language: analysts, tools, and threat intelligence can talk about the same technique without ambiguity. Second, it lets you measure coverage: which behaviors your telemetry can see and which remain out of reach.",
          "An essential distinction: **ATT&CK describes TTPs (tactics, techniques, and procedures), not IOCs**. A hash, an IP, or a domain are volatile indicators — they change and expire. The technique (for example, using a command interpreter) is durable behavior that persists even when the indicators change. That is why mapping behavior tends to age better than relying only on indicator lists. Beware of one limitation: ATT&CK is not an exhaustive catalog of every possible procedure — it records what has been observed. The absence of a listed technique does not prove the behavior does not exist.",
        ],
        lists: [],
      },
      {
        heading: "What changed in v19 — and why you should review your mappings",
        paragraphs: [
          "v19, released on April 28, 2026, brought the framework's biggest structural change in years (F04). The **Defense Evasion** tactic (Enterprise) was split into two, separated by adversary intent:",
          "The restructuring also affected techniques. The well-known **Impair Defenses (T1562)** was reorganized: according to Elastic's migration documentation, T1562, T1562.001, and T1562.006 were merged into the new technique **Disable or Modify Tools (T1685)**, and the remaining sub-techniques were revoked and re-issued under Defense Impairment (F11). In August 2026, v19.2 — the project's first \"Agile\" release — updated the Enterprise matrix groups and software without changing the tactics (F03).",
          "The practical impact is direct. Rules that reference TA0005 still match Stealth techniques (the ID was inherited), but the behavior of disabling controls now lives elsewhere in the matrix. If your mappings are not reviewed, you may have nominal coverage — rules mapped to retired tactics — that does not reflect what you actually monitor. The recommended action: audit searches, exceptions, dashboards, and playbooks that cite \"Defense Evasion\", \"TA0005\", \"T1562\", and sub-techniques, and remap each rule by the intent of the behavior (hiding activity or disabling controls). ID details come from Elastic's migration documentation; MITRE's official notes confirm the split (F04).",
        ],
        lists: [
          {
            items: [
              "**Stealth (TA0005)** — hiding malicious activity within legitimate behavior. The new tactic inherited the old ID TA0005.",
              "**Defense Impairment (TA0112)** — disabling, degrading, or compromising security controls. It received a new ID.",
            ],
          },
        ],
      },
      {
        heading: "From observed behavior to a detection rule",
        paragraphs: [
          "Now the workflow that turns observation into detection, in five steps:",
          "1. **Start from an observation, not a technique name.** Example: \"a process unexpectedly launched a command interpreter\". This approaches techniques such as Command and Scripting Interpreter (T1059), whose official page lists platforms, data sources, and examples (F12). 2. **Confirm on the technique's page.** Check the suggested data sources and requirements. If the technique you had in mind is not supported by the observed behavior, choose another one — or do not map it. 3. **Choose the data source you actually collect.** Process creation logs, script creation logs, authentication logs. Without the data, there is no rule. 4. **Write the rule in your stack's format.** Sigma is an open, structured format for describing detections in logs, shareable across tools (F08, F09). 5. **Test, measure false positives, and tune.** A rule that never produced a reviewable alert is not a validated detection.",
          "A **conceptual** example of a Sigma selection — not tested in this environment; adapt it to your schema and validate it in a lab:",
          "Notice what the example does not do: it is not a finished detection. `cmd.exe` and `powershell.exe` are legitimate in almost every organization. The next step is to narrow it down with context — an unusual parent process, correlation with other events, subsequent behavior — and use the tactic to decide the \"why\". MITRE's official guidance for detection and analytics follows exactly this logic of developing, testing, and refining behavioral analytics (F05).",
        ],
        lists: [],
        code: "title: Execução de interpretador de comandos (exemplo conceitual)\nlogsource:\n  product: windows\n  category: process_creation\ndetection:\n  selection:\n    Image|endswith:\n      - '\\cmd.exe'\n      - '\\powershell.exe'\n  condition: selection\nfalsepositives:\n  - Administração legítima e automação\n  - Tarefas agendadas e scripts operacionais\nlevel: low",
      },
      {
        heading: "Official references for detection: CAR, D3FEND, and Sigma",
        paragraphs: [
          "Beyond the matrix, MITRE and the community maintain direct references for those who work with detection:",
          "Third-party rules, including Sigma's, need review: understand the logic, check the declared false positives, and validate them in your environment before producing alerts.",
        ],
        lists: [
          {
            items: [
              "**CAR (Cyber Analytics Repository)** — MITRE's knowledge base of ATT&CK-based analytics. Each analytic includes a hypothesis, information domain, references to techniques, implementation pseudocode, and a unit test (F06).",
              "**D3FEND** — MITRE's knowledge graph of countermeasures: the defensive side of the coin, useful for thinking about controls from behavior (F07).",
              "**Sigma** — open detection format; the main repository gathers more than 3,000 rules of various types (generic, threat hunting, emerging threats, compliance) (F08, F09).",
              "**Get Started – Detections and Analytics** — MITRE's official entry point for developing analytics (F05).",
              "**attack-stix-data** — the ATT&CK catalog in STIX 2.1, for integrating the framework into tools in an automated way (F13).",
              "**ATT&CK Navigator** — layered coverage visualization, referenced by CAR itself; revalidate the address before publishing (F06, F14).",
            ],
          },
        ],
      },
      {
        heading: "Common pitfalls when mapping and detecting with ATT&CK",
        paragraphs: [
          "1. **Mapping by intuition or superficial resemblance.** The technique must be supported by the observed behavior; \"looks like\" is not evidence. 2. **Confusing IOC with TTP.** Indicators expire; behavior persists. Using both is healthy; treating them as the same thing is not. 3. **Treating a rule as coverage of an entire technique.** A rule detects one variation, not the full technique. False negatives exist and must be assumed. 4. **Ignoring false positives.** An untuned rule becomes noise and desensitizes the SOC. 5. **Not reviewing versions.** Revoked IDs (such as T1562 and its sub-techniques) leave orphaned mappings and misaligned reports (F04, F11). 6. **Promising complete detection.** No control covers 100% of scenarios; any such promise should be met with skepticism.",
        ],
        lists: [],
      },
      {
        heading: "What we still do not know",
        paragraphs: [],
        lists: [
          {
            items: [
              "Actual detection coverage depends on each environment's local telemetry; this article does not claim data from any specific organization or internal CyDef telemetry.",
              "MITRE keeps publishing releases (v19.2 was the first Agile one); new IDs and reorganizations may appear after the verification date.",
              "The content of the T1562 technique page could not be extracted directly at the time of verification; the restructuring was confirmed by the official notes (F04) and the ID details by Elastic's documentation (F11).",
              "The old versioning page (`/resources/versioning`) returns 404; the current page is `/resources/versions` (F02). The same applies to `/resources/get-started/`, replaced by thematic pages (F05).",
              "The author and technical reviewer of this article have not yet been defined (`PENDING`).",
            ],
          },
        ],
      },
      {
        heading: "Next steps",
        paragraphs: [
          "1. Check the current version on the official versioning page (F02). 2. Audit rules, exceptions, dashboards, and playbooks referencing \"Defense Evasion\", \"TA0005\", \"T1562\", and sub-techniques. 3. Separate by intent: Stealth (hiding) versus Defense Impairment (disabling controls) — and review the integrity monitoring priority of your controls. 4. Review coverage with the Navigator or your own spreadsheet, and consult CAR and D3FEND to close gaps. 5. Test any new rule in a controlled environment, with known events, before production.",
          "If your team is starting to structure this work, CyDef's Blue Team practices (https://www.cydef.com.br/servicos#blue-team) and SOC services (https://www.cydef.com.br/servicos#soc) are starting points for designing the service; detection training continues at CyDef Academy (https://www.cydef.com.br/academy).",
        ],
        lists: [],
      },
    ],
    sources: [
      { label: "MITRE ATT&CK (official site)", url: "https://attack.mitre.org/" },
      { label: "Version History", url: "https://attack.mitre.org/resources/versions" },
      { label: "Updates – August 2026 (v19.2)", url: "https://attack.mitre.org/resources/updates" },
      { label: "Updates – April 2026 (v19)", url: "https://attack.mitre.org/resources/updates/updates-april-2026" },
      { label: "Get Started – Detections and Analytics", url: "https://attack.mitre.org/resources/get-started/detections-and-analytics" },
      { label: "Cyber Analytics Repository (CAR)", url: "https://car.mitre.org/" },
      { label: "MITRE D3FEND", url: "https://d3fend.mitre.org/" },
      { label: "Sigma (official site)", url: "https://sigmahq.io/" },
      { label: "SigmaHQ/sigma (rule repository)", url: "https://github.com/SigmaHQ/sigma" },
      { label: "MITRE ATT&CK official blog – ATT&CK v19", url: "https://medium.com/mitre-attack/attack-v19-ff329cb65d66" },
      { label: "Elastic – Remap detection rules to MITRE ATT&CK v19", url: "https://www.elastic.co/docs/solutions/security/detect-and-alert/remap-mitre-attack" },
      { label: "Technique T1059 – Command and Scripting Interpreter", url: "https://attack.mitre.org/techniques/T1059/" },
      { label: "attack-stix-data (ATT&CK data in STIX 2.1)", url: "https://github.com/mitre-attack/attack-stix-data" },
    ],
    changelog: [
      "2026-08-24: first version, based on the verified dossier (evergreen-attack-02, READY). Official sources verified on 24/08/2026; ATT&CK version v19.2 recorded as current at the cutoff date.",
    ],
  },
  {
    slug: "threat-hunting-por-onde-comecar",
    title: "Threat Hunting: where to start?",
    category: "Detection & Response",
    excerpt:
      "Introduction to threat hunting with methodologies, tools, and practical tips for proactively hunting threats.",
    date: "August 24, 2026",
    dateISO: "2026-08-24",
    readTime: "8 min read",
    image: "/assets/blog/threat-hunting-thumb.webp",
    author: "CyDef Team",
    sections: [
      {
        paragraphs: [
          "According to the SANS 2025 Threat Hunting Survey, only 51% of organizations formally measure the effectiveness of their threat hunting programs — and 61% point to the shortage of professionals as the main barrier. For SOC and Blue Team analysts who want to get out of reactive mode, the good news is that hunting does not require an expensive tool or a huge team: it requires method. This guide presents the hunt cycle — from hypothesis to validation — anchored in current public references: MITRE ATT&CK, MITRE's TTP-Based Hunting methodology, the Sqrrl hunting loop, the PEAK framework, and the Pyramid of Pain. As of this review's cutoff date (24/08/2026), these were the references consulted. The starting point is always the same: a testable hypothesis about adversary behavior in your environment.",
        ],
      },
      {
        heading: "What threat hunting is (and what it is not)",
        paragraphs: [
          "Threat hunting is the proactive search for adversary behavior that was not flagged by automated alerts. Unlike incident response — which starts from a known alert or incident — a hunt starts from a question: \"if there were an adversary here, what would I expect to see?\" This is what the Sqrrl hunting loop and Splunk's PEAK framework formalize, both with hypothesis as the starting point.",
          "Three distinctions prevent the most common mistakes:",
          "The value lies in what the team learns even when it finds nothing — as long as it documents.",
        ],
        lists: [
          {
            items: [
              "**Hunting is not random log spelunking.** Without a hypothesis, scope, and time window, the search becomes noise and burns hours without conclusions.",
              "**Hunting does not replace automated detection.** It complements it, finds what the rules missed, and improves existing rules.",
              "**Hunting is not incident response.** It feeds the process: when a hunt confirms something, the case is escalated with evidence.",
            ],
          },
        ],
      },
      {
        heading: "The hunt cycle: from hypothesis to action",
        paragraphs: [
          "The hunting loop formalized by Sqrrl in 2016 (archived whitepaper, still widely cited) defines four stages: **create hypothesis → investigate with tools and techniques → discover new patterns and TTPs → inform and enrich automated analytics**. The loop is cyclical: each completed hunt feeds the next one and automated detection.",
          "The PEAK framework (Prepare, Execute, and Act with Knowledge), from Splunk's SURGe team, organizes the same reasoning into three phases and distinguishes three types of hunt: **hypothesis-based**, **baseline-based** (what is \"normal\" in the environment), and **model-assisted**. Knowledge — network architecture, past incidents, threat intelligence — feeds into all phases, not just the beginning.",
        ],
        lists: [],
      },
      {
        heading: "How to formulate a behavior-based hypothesis",
        paragraphs: [
          "A good hypothesis is specific and testable. Instead of \"check for malware\", use: \"an account authenticating to multiple workstations within a short window suggests lateral movement with valid accounts\". A hypothesis has four components: the **expected behavior**, the **asset or actor in scope**, the **data source** that would evidence the behavior, and the **time window**.",
          "Hypothesis sources: threat intelligence, ATT&CK techniques relevant to your sector, known visibility gaps, findings from previous hunts, and anomalies that alerts could not explain.",
          "**MITRE ATT&CK** — a knowledge base of tactics and techniques based on real-world observations, at the current version v19.2 — works as a common vocabulary for describing the behavior you are looking for. MITRE's **TTP-Based Hunting** methodology uses these techniques to define data requirements and conduct the hunt in an operating-system-agnostic way; the official training describes the path in six modules, from fundamentals and hypotheses to implementing analytics and investigation.",
          "> Conceptual example (not tested in any specific environment): hypothesis of script execution via legitimate interpreters outside administrative workstations; expected evidence in process logs; 14-day window; comparison with a baseline of normal behavior before any conclusion.",
        ],
        lists: [],
      },
      {
        heading: "Data sources: what you need before you hunt",
        paragraphs: [
          "Before choosing the technique, map the telemetry you already have: authentication logs, process logs (endpoints), network logs (DNS and connections), email, and cloud logs. MITRE is explicit about the order: **determine data requirements before the technique** — if the telemetry does not capture the behavior, the hunt cannot confirm it.",
          "In practice:",
          "A visibility gap discovered during preparation is a legitimate finding: knowing that a behavior is not observable already guides the next investment.",
        ],
        lists: [
          {
            items: [
              "Inventory sources and record visibility gaps.",
              "Validate quality and retention. For example, Microsoft Defender XDR advanced hunting lets you explore up to 30 days of raw data per query — and queries can become custom detections.",
              "Start with the most reliable sources and the techniques they can evidence.",
            ],
          },
        ],
      },
      {
        heading: "How to run and validate findings",
        paragraphs: [
          "Run the hunt with targeted queries, examine the results, and classify each item. Not every \"match\" is an incident: separate **false positive**, **atypical normal behavior**, **finding to investigate**, and **confirmation**. Explicit, written triage criteria reduce analyst bias.",
          "Two references help with prioritization and context:",
          "Confirmed or likely finding → escalate to incident response with preserved evidence (who, what, when, data source, and window). Refuted finding → document: disproving a hypothesis is also a result — either the behavior did not occur in the window, or the telemetry does not cover it.",
        ],
        lists: [
          {
            items: [
              "The **Pyramid of Pain** (David Bianco, 2013) classifies indicators from hashes to TTPs. Hashes and IP addresses change easily; techniques, tactics, and procedures (TTPs) are expensive to change — which makes them the most valuable indicators to hunt.",
              "Lockheed Martin's **Cyber Kill Chain** describes seven stages, from reconnaissance to actions on objectives, and helps place the observed behavior within the intrusion phase.",
            ],
          },
        ],
      },
      {
        heading: "Turning findings into detections and measuring the program",
        paragraphs: [
          "The cycle only completes when knowledge becomes capability: create or tune detections, enrich data, fix collection gaps, and record new hypotheses for the next cycle — the final stage of the hunting loop.",
          "The SANS 2025 context shows why this matters: only 51% of organizations formally measure hunting effectiveness (down from 64% in 2024), and 61% cite the lack of professionals as the main barrier. Hunting metrics should be defined locally — for example, hypotheses per period, confirmation rate, closed collection gaps, and detections created — and never compared out of context: organizations with different scope, team, and telemetry produce different numbers.",
        ],
        lists: [],
      },
      {
        heading: "Where to start in practice",
        paragraphs: [
          "An executable sequence for the first hunt:",
          "1. Choose 2–3 ATT&CK techniques relevant to your sector and to what you have already seen in incidents. 2. Confirm which data sources can evidence them; if any is missing, record the gap. 3. Write a specific hypothesis with scope and window. 4. Run the hunt in a limited time (for example, 1–2 hours) and document it. 5. Classify findings, preserve evidence, and escalate when applicable. 6. Turn what worked into detection and repeat the cycle.",
          "Free public resources help: Elastic's practical guide, Microsoft's advanced hunting documentation, PEAK's open repository and, in Brazil, CERT.br, which publishes statistics and incident handling guidance.",
        ],
        lists: [],
      },
      {
        heading: "What we still do not know",
        paragraphs: [],
        lists: [
          {
            items: [
              "No CyDef internal telemetry, testing, or experience is claimed in this article.",
              "The effectiveness of each method varies with environment, maturity, and data sources; there is no universal recipe.",
              "The SANS 2025 numbers come from practitioners' responses — they are perception, not objective measurement of organizations.",
              "Versions change: ATT&CK v19.2 was verified on 24/08/2026 and must be revalidated before publication.",
              "The author and technical reviewer of this article have not yet been defined.",
            ],
          },
        ],
      },
      {
        heading: "Next steps",
        paragraphs: [
          "Define a hypothesis, choose a data source, and run the first hunt this week — small scope, short window, and documentation. Consult the official sources below before investing in any tool.",
        ],
        lists: [],
      },
    ],
    sources: [
      { label: "F01 – MITRE ATT&CK (v19.2, current as of 24/08/2026)", url: "https://attack.mitre.org/" },
      { label: "F02 – MITRE, TTP-Based Hunting", url: "https://www.mitre.org/news-insights/publication/ttp-based-hunting" },
      { label: "F03 – MITRE ATT&CK Training – TTP-Based Threat Hunting and Detection Engineering", url: "https://attack.mitre.org/resources/learn-more-about-attack/training/threat-hunting" },
      { label: "F04 – SANS, The Pyramid of Pain (David Bianco)", url: "https://www.sans.org/tools/the-pyramid-of-pain" },
      { label: "F05 – Splunk SURGe, PEAK Threat Hunting Framework: https://www.splunk.com/en_us/blog/security/peak-threat-hunting-framework.html +", url: "https://github.com/splunk/PEAK" },
      { label: "F06 – Elastic, The Elastic guide to threat hunting", url: "https://www.elastic.co/campaigns/elastic-guide-to-threat-hunting" },
      { label: "F07 – Sqrrl, A Framework for Cyber Threat Hunting (2016, archived)", url: "https://www.threathunting.net/files/framework-for-threat-hunting-whitepaper.pdf" },
      { label: "F08 – Microsoft, Advanced hunting overview", url: "https://learn.microsoft.com/en-us/defender-xdr/advanced-hunting-overview" },
      { label: "F09 – Lockheed Martin, Cyber Kill Chain", url: "https://www.lockheedmartin.com/en-us/capabilities/cyber/cyber-kill-chain.html" },
      { label: "F10 – SANS 2025 Threat Hunting Survey", url: "https://www.sans.org/white-papers/sans-2025-threat-hunting-survey-advancements-threat-hunting-amid-ai-cloud-challenges" },
      { label: "F11 – CERT.br", url: "https://cert.br/" },
    ],
    changelog: [
      "2026-08-24: first version, based on the verified dossier (evergreen-hunting-03, READY). Sources consulted and dated in the ledger; ATT&CK v19.2 confirmed via https://attack.mitre.org/resources/versions.",
    ],
  },
  {
    slug: "hardening-linux-cis-benchmarks",
    title: "Hardening Linux servers with CIS Benchmarks",
    category: "Hardening",
    excerpt:
      "Step-by-step guide to hardening Linux servers following the CIS Benchmark recommendations.",
    date: "August 24, 2026",
    dateISO: "2026-08-24",
    readTime: "8 min read",
    image: "/assets/blog/hardening-linux-thumb.webp",
    author: "CyDef Team",
    sections: [
      {
        paragraphs: [
          "CIS Benchmarks are secure configuration guides developed by community consensus and maintained by the Center for Internet Security (CIS) — there are more than 100 benchmarks covering more than 25 product families, available as a free PDF for non-commercial use and mapped to the CIS Controls (F01, F10). Linux administrators, DevOps teams, and Blue Teams that need to reduce the attack surface of servers should start here: choose the official benchmark for your distribution, apply the recommendations in phases in a test environment, and audit the result with tools such as CIS-CAT. This guide presents that cycle in four phases — identify, protect, detect, and validate — with conceptual commands, testing, and rollback. The versions cited were verified on 24/08/2026 on the official pages; confirm them before publishing or applying.",
        ],
      },
      {
        heading: "What CIS Benchmarks are",
        paragraphs: [
          "A CIS Benchmark is a set of secure configuration recommendations for a specific technology — in this article's case, Linux operating systems. According to CIS, benchmarks are \"the product of a community consensus process\" and consist of secure configuration guidelines (F03). Two practical points define the program:",
          "There are also complementary resources: CIS Build Kits (automation scripts), CIS Hardened Images (pre-hardened VM images), and CIS-CAT, an auditing tool (F03, F06). For most organizations, the starting point is the benchmark PDF — and it is free.",
        ],
        lists: [
          {
            items: [
              "**Coverage and access:** more than 100 benchmarks across more than 25 product families, with free PDF download for non-commercial use upon registration (F01, F10).",
              "**Link to controls:** each recommendation maps to the CIS Critical Security Controls, which helps demonstrate compliance with regulations such as PCI DSS and frameworks such as NIST (F01, F02).",
            ],
          },
        ],
      },
      {
        heading: "CIS Controls v8.1: hardening within a program",
        paragraphs: [
          "Configuration hardening does not replace a security program — it is one of the controls. The current version of the CIS Controls is v8.1, which emphasizes the transition to hybrid/cloud environments and supply chain management (F02). In practice, the benchmarks act as the technical \"secure configuration\" layer within that program.",
          "An important limitation: **benchmark compliance is not total protection**. A server that passes every rule can still be outdated, poorly segmented, or compromised. The benchmark's value is reducing the attack surface and providing an auditable baseline — not replacing inventory, vulnerability management, detection, and response. Prioritize the controls that already exist in your organization and use the benchmark as a complement, not as a shortcut.",
        ],
        lists: [],
      },
      {
        heading: "Choosing the official benchmark for your distribution",
        paragraphs: [
          "Download the benchmark **from the official CIS page**, for the exact version of your system. Third-party copies, blogs, or unofficial repositories may be outdated or tampered with. The current versions listed on the official pages on 24/08/2026 were:",
          "Institutional recognition reinforces relevance: NIST's National Checklist Program (NIST NCP) lists the \"CIS Ubuntu Linux 24.04 LTS STIG Benchmark 1.0.0\" as an official checklist (F08). When choosing, prefer the LTS version you actually operate; benchmarks for old, unsupported versions are archived by CIS and should be avoided (F03).",
        ],
        lists: [
          {
            items: [
              "**Ubuntu Linux:** 24.04 LTS (v2.0.0), 22.04 LTS (v3.0.0), 20.04 LTS (v3.0.0) — plus STIG versions (F03).",
              "**Debian Linux:** 13 (v1.0.0), 12 (v2.0.0), 11 (v2.0.0) (F04).",
              "**Red Hat Enterprise Linux:** 10 (v1.0.1), 9 (v2.0.0), 8 (v4.0.0) — plus STIG versions (F05).",
            ],
          },
        ],
      },
      {
        heading: "Phase 1 — Identify: inventory before change",
        paragraphs: [
          "Before changing anything, know what you have. This phase is read-only:",
          "With the inventory in hand, download the benchmark for the exact identified version. If your distribution has no official benchmark (for example, a derived distro without its own page), evaluate the closest family benchmark carefully and document the decision — or consider CIS's hardened image for your provider (F03).",
        ],
        lists: [
          {
            items: [
              "Confirm distribution, version, and kernel. Conceptual example: `cat /etc/os-release` and `uname -r`.",
              "List services and listening ports. Conceptual example: `ss -tulpn` (requires privilege for process names) and `systemctl list-unit-files --type=service`.",
              "Record a baseline: installed packages, users with access, cron jobs, and what is exposed to the network.",
            ],
          },
        ],
      },
      {
        heading: "Phase 2 — Protect: tested changes, one at a time",
        paragraphs: [
          "Apply the recommendations **in phases, one change at a time**, starting with level 1 rules (practical baseline) and evaluating level 2 according to asset criticality — the exact distinction between levels is described in your version's benchmark PDF. The examples below are **conceptual**: the exact values and the full rule list are in the official document.",
          "Golden rule: **one change at a time, validated, with backup and a known rollback**. Hardening that takes down a production service is not security — it is an incident.",
        ],
        lists: [
          {
            items: [
              "**Remote access (SSH):** review `/etc/ssh/sshd_config` (e.g., key-based authentication, restricting root login). Before restarting the service, validate the syntax: `sudo sshd -t`. Restart with `sudo systemctl restart ssh`. **Rollback:** back up before editing (`sudo cp /etc/ssh/sshd_config /etc/ssh/sshd_config.bak-$(date +%F)`) and restore if something fails.",
              "**Sensitive file permissions:** check with `stat -c '%a %U %G' /etc/shadow` and adjust only if your version's benchmark indicates it.",
              "**Unnecessary services:** disable with `sudo systemctl disable --now <service>`. **Rollback:** `sudo systemctl enable --now <service>`.",
              "**Kernel parameters:** create a file in `/etc/sysctl.d/` (e.g., `kernel.randomize_va_space=2`, `net.ipv4.ip_forward=0` as conceptual examples) and apply with `sudo sysctl --system`. **Rollback:** remove the file and reapply.",
              "**Updates:** test `sudo apt update && sudo apt upgrade` (Debian/Ubuntu) or `sudo dnf update` (RHEL) in the lab before production.",
              "**Local firewall:** configure according to organization policy (ufw, nftables, or iptables) and ensure administrative access is not blocked during testing.",
            ],
          },
        ],
      },
      {
        heading: "Phase 3 — Detect: continuous auditing with CIS-CAT and USG",
        paragraphs: [
          "Configuring is not enough; you must measure. CIS's official tool for auditing systems against the benchmarks is the **CIS-CAT Pro Assessor**, which generates compliance reports mapped to the CIS Controls and the Implementation Groups (F06, F07). Full access to CIS-CAT Pro requires a SecureSuite subscription, but CIS offers **CIS-CAT Lite**, free, with unlimited scans against a selected set of benchmarks — which includes Ubuntu Linux (F06). On Ubuntu, Canonical also documents the **Ubuntu Security Guide (USG)** for auditing and applying CIS profiles (e.g., `sudo usg audit <profile>`) — in the current documentation, the scope covers 20.04 and 22.04; revalidate before relying on it on 24.04 (F09).",
          "Complement the audit with logs: authentication, configuration changes, and system events (journald, auditd) feed the SOC and the Blue Team. Treat the audit score as a baseline: record the value before and after each batch of changes.",
        ],
        lists: [],
      },
      {
        heading: "Phase 4 — Validate: re-audit, document exceptions, and automate",
        paragraphs: [
          "After each batch of changes, repeat the audit and compare with the baseline. Compliance must not break operations: validate that services respond, applications work, and backups restore. Rules that do not apply to your environment should be **documented as a justified exception** (tailoring), not simply ignored — that is what keeps the audit honest and defensible.",
          "Only after the manual process is stable should you consider automating with CIS Build Kits or declarative configuration tools (F03). Automation amplifies a good process and accelerates a bad one — process first, then the script.",
        ],
        lists: [],
      },
      {
        heading: "What we still do not know",
        paragraphs: [
          "This guide has explicit limits. The full text of the benchmarks (individual rules, exact values, and levels) is not reproduced here: the download is free, but requires registration, and each rule must be read in your version's PDF. The versions cited were verified on 24/08/2026 and may change — revalidate before publishing. Paid tools (CIS-CAT Pro) depend on a subscription; USG has a documented version scope to revalidate. No CyDef telemetry or internal experience is claimed in this article, and the author and technical reviewer have not yet been defined.",
        ],
        lists: [],
      },
      {
        heading: "Next steps",
        paragraphs: [
          "Start with a lab server: identify the exact distribution, download the official benchmark from the CIS page, apply the level 1 recommendations one at a time with backup and rollback, and audit with CIS-CAT Lite before and after. Only then take the now-validated process to production. Consult the official sources below before applying any change.",
        ],
        lists: [],
      },
    ],
    sources: [
      { label: "CIS Benchmarks (overview)", url: "https://www.cisecurity.org/cis-benchmarks-overview" },
      { label: "CIS Controls v8.1", url: "https://www.cisecurity.org/controls" },
      { label: "CIS Ubuntu Linux Benchmark", url: "https://www.cisecurity.org/benchmark/ubuntu_linux" },
      { label: "CIS Debian Linux Benchmark", url: "https://www.cisecurity.org/benchmark/debian_linux" },
      { label: "CIS Red Hat Enterprise Linux Benchmark", url: "https://www.cisecurity.org/benchmark/red_hat_linux" },
      { label: "CIS-CAT Pro Assessor", url: "https://www.cisecurity.org/cybersecurity-tools/cis-cat-pro" },
      { label: "CIS-CAT Pro Assessor v4 Guide", url: "https://ciscat-assessor.docs.cisecurity.org" },
      { label: "NIST National Checklist Program, checklist 1287", url: "https://ncp.nist.gov/checklist/1287" },
      { label: "Ubuntu Security Guide (CIS compliance)", url: "https://ubuntu.com/security/certifications/docs/usg/cis/compliance" },
      { label: "CIS Benchmarks download (free PDF, registration)", url: "https://learn.cisecurity.org/benchmarks" },
    ],
    changelog: [
      "2026-08-24: first version, based on the verified dossier (evergreen-hardening-04, READY). Benchmark and tool versions verified on the official pages on this date.",
    ],
  },
  {
    slug: "certificacoes-ciberseguranca-carreira",
    title: "Cybersecurity Career: certifications that make a difference",
    category: "Career & Certifications",
    excerpt:
      "Analysis of the main security certifications and how to choose the most suitable ones for your career stage.",
    date: "August 24, 2026",
    dateISO: "2026-08-24",
    readTime: "9 min read",
    image: "/assets/blog/carreira-thumb.webp",
    author: "CyDef Team",
    sections: [
      {
        paragraphs: [
          "The security job market uses certifications as a verifiable signal of knowledge — and the exams change: in 2026, CySA+ gained a new version (CS0-004), the ISC2 CC will have new content starting in September, and PenTest+ already runs on version PT0-003. Anyone starting out or planning the next step must check the current exam code, the prerequisites, and the total cost at the official source before buying any voucher. This guide organizes the main certifications by career stage, with data verified on the official pages on 24/08/2026. No certification guarantees a job, a salary, or a pass — the real value lies in what it represents and in what you do with the knowledge.",
        ],
      },
      {
        heading: "Why certifications make a difference (and what they do not guarantee)",
        paragraphs: [
          "Certifications act as screening: in hiring processes, they help recruiters and teams identify who has a documented minimum knowledge base. Accreditations such as ISO/IEC 17024 (used by ISC2) and recognition in programs such as the United States' DoDM 8140 increase the traceability of the exam — but they do not measure your real experience. A certificate without practice does not replace operational competence, and no exam promises total protection, employment, or salary.",
          "The real cost of a certification includes the exam **and** the maintenance: CompTIA requires CEUs (continuing education units) every three years, ISC2 charges an annual maintenance fee (AMF), and Microsoft requires annual renewal via a free online assessment. Before deciding, consider the full cycle.",
        ],
        lists: [],
      },
      {
        heading: "Starting now: Security+ and ISC2 CC",
        paragraphs: [
          "For those without formal experience, the two most recognized entry doors are **CompTIA Security+** and **ISC2 CC (Certified in Cybersecurity)**.",
          "Security+ is CompTIA's entry certification. The current exam is **SY0-701** (V7, released on 07/11/2023): up to 90 questions, 90 minutes, passing score 750 on a 100–900 scale, with no formal prerequisites — CompTIA recommends Network+ and about two years of systems administration with a security focus. It is available in Portuguese and is renewed every three years with 50 CEUs (US$ 150 fee per cycle, according to CompTIA's official CEU page).",
          "**ISC2's CC** is an entry alternative with no experience requirement, with a US$ 199 exam and a US$ 50 annual maintenance fee. Watch out for two changes: the exam will have a new outline starting **01/09/2026** (the first major update since 2022, with new weight for governance, IAM, and cloud), and the \"One Million Certified in Cybersecurity\" program, which offered free exams, **closed new enrollments on 20/05/2026** — do not count on freebies when planning.",
          "How to choose between the two? By goal: Security+ delivers a broad foundation and is widely requested in job requirements; CC is leaner, cheaper, and a good first contact with ISC2's methodology. Neither is mandatory.",
        ],
        lists: [],
      },
      {
        heading: "Working in a SOC: CySA+, SC-200, and SSCP",
        paragraphs: [
          "Those already operating detection and response will find certifications designed for SOC and Blue Team work.",
          "**CySA+** (Cybersecurity Analyst) validated the new **V4 (CS0-004)** on 23/06/2026: up to 85 questions, 165 minutes, score 750, focused on security operations (34%), vulnerability management (26%), incident response (24%), and communication (16%). CompTIA recommends about four years in a SOC or vulnerability analysis role; the exam costs US$ 425 and is renewed every three years with 60 CEUs. At launch the language is English, with Portuguese planned.",
          "**SC-200** (Microsoft Certified: Security Operations Analyst Associate) is Microsoft's certification for those operating Sentinel, Defender XDR, and Defender for Cloud, including hunting with KQL. It is 100 minutes and a score of 700, with no formal prerequisites, available in Brazilian Portuguese. Microsoft sets the price by country/region — the advertised standard value is US$ 165 — and renewal is annual, free, via an online assessment.",
          "**SSCP** (Systems Security Certified Practitioner), from ISC2, requires one year of experience in one or more of the seven domains (a degree in IT/CS can waive up to one year; there is the Associate path). It costs US$ 249 and covers operational infrastructure administration — a good fit for those already working hands-on and wanting an ISC2 credential before the CISSP.",
        ],
        lists: [],
      },
      {
        heading: "To advance: CISSP and CCSP",
        paragraphs: [
          "At the management and architecture levels, the **CISSP** (US$ 749) is ISC2's most recognized credential: it requires five years of experience in two or more of the eight domains, with a reduction of up to one year for those with a degree in IT/CS or an approved credential. Those who do not yet have the experience can take the exam and continue as an ISC2 Associate, with six years to complete the requirement.",
          "The **CCSP** (US$ 599) focuses on cloud security: it requires five years of IT, with three in security and one in one of the six CCSP domains — CSA's CCSK certificate substitutes for one year, and those who are already CISSP have the requirement waived. ISC2's AMF is single: US$ 135 per year for CISSP, SSCP, CCSP, and others (US$ 50 only for those with only CC), regardless of how many certifications you accumulate.",
        ],
        lists: [],
      },
      {
        heading: "Offensive knowledge with a defensive purpose: PenTest+ and CEH",
        paragraphs: [
          "Understanding how an attacker thinks strengthens defense — as long as practice happens in an authorized environment. Two certifications cover this ground with different approaches.",
          "CompTIA's **PenTest+** (current version **PT0-003**, released on 17/12/2024) covers penetration test planning and scoping, vulnerability analysis, and reporting with remediation. Up to 90 questions in 165 minutes, score 750; CompTIA recommends three to four years in pentesting, with Network+ and Security+. It is available in Portuguese.",
          "EC-Council's **CEH v13** (125 questions, four hours) combines 20 modules and more than 550 techniques with labs. Eligibility has two paths: take the official training (on-demand from US$ 1,699) or request approval with two years of documented information security experience and a US$ 100 fee. The standalone exam price does not appear as a fixed value on the official page consulted — confirm with EC-Council before planning your budget.",
          "This article does not go into offensive methods: the value of these certifications for a defender is the ability to assess exposure and improve detection, not to execute attacks.",
        ],
        lists: [],
      },
      {
        heading: "How to choose the right certification for your moment",
        paragraphs: [
          "Use this five-step process before buying any voucher:",
          "1. **Define your career stage**: entry, SOC operations, management/architecture, or authorized testing specialization. 2. **Check the current exam code** on the official page — versions retire (CySA+ CS0-003 went out of line with the release of CS0-004 in June 2026). 3. **Validate prerequisites**: CISSP and CCSP require proven experience; SSCP requires one year; Security+ and CC have no formal prerequisites. 4. **Calculate the total cost of the cycle**: exam + renewal (CompTIA CEUs, ISC2 AMF, Microsoft annual renewal) + study material. 5. **Check language and region**: Security+, PenTest+, and SC-200 have Portuguese versions; CySA+ V4 plans Portuguese; prices vary by country.",
          "Distrust \"last chance\" offers without an official announcement and materials that promise quick passes: the exam measures what you know, not what you memorized.",
        ],
        lists: [],
      },
      {
        heading: "What we still do not know",
        paragraphs: [],
        lists: [
          {
            items: [
              "The Security+ and PenTest+ voucher price does not appear as a fixed price on the official pages consulted on 24/08/2026; 2025–2026 sources report an approximate range of US$ 404–439. Confirm at the official store.",
              "The standalone CEH exam price is not listed on the official page consulted (only training packages).",
              "Unofficial rumors circulate about a Security+ successor (possible SY0-801) with tentative dates in November 2026; as of the cutoff date, SY0-701 remains the official current version.",
              "The author and technical reviewer of this article have not yet been defined.",
            ],
          },
        ],
      },
      {
        heading: "Next steps",
        paragraphs: [
          "Choose your career stage, open the official page of the candidate certification, check the exam code, prerequisites, and current price — and only then buy the voucher. If the whole team is going to get certified, use the official exam objectives as a training roadmap. The right certification is the one that fits your plan — not the trend of the moment.",
        ],
        lists: [],
      },
    ],
    sources: [
      { label: "CompTIA Security+ (SY0-701)", url: "https://www.comptia.org/en-us/certifications/security" },
      { label: "CompTIA CySA+ V4 (CS0-004)", url: "https://www.comptia.org/en-us/certifications/cybersecurity-analyst/v4" },
      { label: "CompTIA official blog — CySA+ V4 (price US$ 425)", url: "https://www.comptia.org/en-us/blog/the-new-comptia-cybersecurity-analyst-cysa-your-questions-answered" },
      { label: "CompTIA PenTest+ (PT0-003)", url: "https://www.comptia.org/en-us/certifications/pentest" },
      { label: "ISC2 CC", url: "https://www.isc2.org/certifications/cc" },
      { label: "ISC2 One Million Certified in Cybersecurity", url: "https://www.isc2.org/landing/1mcc" },
      { label: "ISC2 — exam pricing", url: "https://www.isc2.org/register-for-exam/isc2-exam-pricing" },
      { label: "CompTIA — CEUs and renewal", url: "https://www.comptia.org/en-us/resources/ce/learn/earn-continuing-education-units-ceus" },
      { label: "ISC2 CISSP — requirements", url: "https://www.isc2.org/certifications/cissp/cissp-experience-requirements" },
      { label: "ISC2 CCSP — requirements", url: "https://www.isc2.org/certifications/ccsp/ccsp-experience-requirements" },
      { label: "ISC2 — AMF", url: "https://www.isc2.org/policies-procedures/amfs-overview" },
      { label: "EC-Council CEH v13", url: "https://www.eccouncil.org/train-certify/certified-ethical-hacker-ceh/" },
      { label: "ISC2 SSCP — requirements", url: "https://www.isc2.org/certifications/sscp/sscp-experience-requirements" },
      { label: "Microsoft SC-200", url: "https://learn.microsoft.com/en-us/credentials/certifications/security-operations-analyst" },
      { label: "Microsoft SC-200 — study guide", url: "https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/sc-200" },
      { label: "ISC2 Insights — the updated CC outline", url: "https://www.isc2.org/Insights/2026/08/inside-the-updated-isc2-cc-exam" },
    ],
    changelog: [
      "2026-08-24: first version, based on the verified dossier (evergreen-career-05, READY). Exam codes, requirements, and prices confirmed in official sources at the cutoff date.",
    ],
  },
  {
    slug: "seguranca-cloud-aws-melhores-praticas",
    title: "AWS Cloud Security: Essential best practices",
    category: "Cloud Security",
    excerpt:
      "Practical security guide for AWS environments focused on IAM, VPC, CloudTrail, and other critical services.",
    date: "August 24, 2026",
    dateISO: "2026-08-24",
    readTime: "8 min read",
    image: "/assets/blog/cloud-aws-thumb.webp",
    author: "CyDef Team",
    sections: [
      {
        paragraphs: [
          "In AWS's cloud, security is not a switch AWS turns on for you: it is a shared responsibility, and the part that falls to your organization grows with what you configure and run. Engineers, architects, DevSecOps teams, and analysts operating AWS environments need to know where the provider's responsibility ends and where theirs begins — because it is at that boundary that the most common failures happen: overly broad permissions, exposed resources, and missing logs. This guide presents, in order, the essential practices documented by AWS: identities (IAM), network (VPC), logging and detection (CloudTrail, GuardDuty, Security Hub), and data protection (KMS). The application of each practice depends on your environment; no universal configuration is prescribed here.",
        ],
      },
      {
        heading: "What AWS protects and what is your responsibility",
        paragraphs: [
          "The starting point is the shared responsibility model, described on AWS's official compliance page. AWS is responsible for the \"security of the cloud\": the infrastructure that runs the services — data centers, network, hardware, virtualization. The customer is responsible for \"security in the cloud\": what they configure, run, and store, including guest operating system, applications, access management, encryption, and monitoring.",
          "The boundary shifts by service: on a managed database, AWS assumes more layers than on an EC2 instance, where the customer answers for the operating system configuration. This distinction is the axis of the Security Pillar of the AWS Well-Architected Framework, published in November 2024 and current as of this review's cutoff date. Before choosing a service or fixing a configuration, answer: who is responsible for this layer here? The answer defines what to audit first.",
        ],
        lists: [],
      },
      {
        heading: "IAM: identities, least privilege, and credentials",
        paragraphs: [
          "Identity management is where most security decisions in AWS begin. The official IAM best practices documentation recommends, among other points:",
          "In practice, the recommendation is to start with AWS managed policies and progressively reduce toward least privilege — not the other way around. Policy changes should be tested in a controlled environment (for example, a development account) and can be reverted by restoring the previous policy version. A good sanity check: no permission change should go straight from a test account to production without workload validation.",
        ],
        lists: [
          {
            items: [
              "**Protect the root user.** It has unrestricted access to the account; it should only be used for tasks that require that level, with MFA (multi-factor authentication) enabled.",
              "**Prefer temporary credentials.** AWS recommends humans access via federation with an identity provider (IAM Identity Center is the indicated centralized option) and workloads use IAM roles — both issue temporary credentials instead of long-lived keys.",
              "**Apply least privilege.** Grant only the permissions needed for the task. IAM offers last-accessed information and IAM Access Analyzer can generate policies based on observed activity and validate existing policies.",
              "**Review regularly.** Remove unused users, roles, keys, and permissions; use conditions in policies to restrict access; consider permission guardrails across multiple accounts.",
            ],
          },
        ],
      },
      {
        heading: "VPC: isolation and traffic control",
        paragraphs: [
          "Amazon VPC lets you run resources in a logically isolated virtual network that you define. Network security rests on two complementary layers, documented in the VPC guide:",
          "The structural guidance is to keep backend workloads in private subnets and expose publicly only what is necessary. Security group and network ACL changes take effect immediately: apply them in a controlled window, validate legitimate traffic, and be ready to revert the rule in case of regression. There is no universal port rule — the design depends on the workload and the organization's network policy.",
        ],
        lists: [
          {
            items: [
              "**Security groups:** act as a virtual firewall at the instance/interface level, in a stateful way — return traffic is automatically allowed. The recommendation is to allow only the necessary ports and sources.",
              "**Network ACLs:** an additional layer at the subnet level, stateless, with numbered rules evaluated in order. Useful for defense in depth.",
            ],
          },
        ],
      },
      {
        heading: "Logging and detection: CloudTrail, GuardDuty, and Security Hub",
        paragraphs: [
          "Without visibility, there is no response. Three official services form the recommended base of observability and detection:",
          "The recommended defensive path is: enable CloudTrail covering the relevant regions and accounts, enable GuardDuty, and aggregate findings in Security Hub. Enablement is additive, but it has cost and data volume — start with reduced scope and expand. Findings and controls generate noise: define triage and escalation criteria before treating every alert as an incident.",
        ],
        lists: [
          {
            items: [
              "**AWS CloudTrail** records user, role, and service actions as events — including the console, the CLI, and the APIs. The event history lets you query the last 90 days of management events; trails deliver logs to an S3 bucket, with optional delivery to CloudWatch Logs and Amazon EventBridge for monitoring and automation.",
              "**Amazon GuardDuty** continuously monitors account data sources (such as CloudTrail events, VPC flow logs, and DNS) and generates findings of suspicious activity — for example, access from an unusual geolocation or atypical API calls. A finding is an indication to investigate, not an automatic confirmation of compromise.",
              "**AWS Security Hub** (CSPM — Cloud Security Posture Management) aggregates and correlates findings from multiple sources and evaluates the environment against security standards, including AWS's own (Foundational Security Best Practices — FSBP) and external frameworks such as CIS, PCI DSS, and NIST. This helps prioritize fixes by severity and context.",
            ],
          },
        ],
      },
      {
        heading: "Data: encryption and key control",
        paragraphs: [
          "Protecting data at rest and in transit is part of the Security Pillar best practices. AWS Key Management Service (KMS) centralizes the creation and control of the keys used to encrypt and sign data, integrating with several AWS services. Keys are protected by validated hardware modules and never leave the service in an unencrypted form. At the concept level, it is worth distinguishing customer managed keys (you create and control) from AWS managed ones — the choice depends on how much control the organization needs, and key policies define who can manage and who can use each key.",
          "Additionally, AWS Config records the configuration history of account resources, letting you see how configurations changed over time and assess compliance with defined rules. This is useful for auditing and for understanding the impact of a change before and after applying it. None of these services replaces inventory and governance: they make the environment auditable.",
        ],
        lists: [],
      },
      {
        heading: "What we still do not know",
        paragraphs: [
          "This guide does not cover costs (log retention, data volume, and regions vary), nor each workload's specific configurations — correct application depends on the inventory, criticality, and existing controls. We do not claim CyDef telemetry, testing, or internal experience, and no tool is mandatory. AWS documentation revisions may change; the sources were verified on 24/08/2026 and must be revalidated before publication. The author and technical reviewer of this article have not yet been defined.",
        ],
        lists: [],
      },
      {
        heading: "Next steps",
        paragraphs: [
          "Audit the environment layer by layer: map the responsibility boundary, review identities and permissions (root, MFA, temporary credentials, least privilege), reduce network exposure, ensure logging and detection (CloudTrail, GuardDuty, Security Hub), and review encryption and keys. Prioritize by local context, test changes in a controlled environment with rollback, and consult the official AWS documentation before changing production.",
        ],
        lists: [],
      },
    ],
    sources: [
      { label: "AWS Well-Architected Framework, Security Pillar (pub. 06/11/2024)", url: "https://docs.aws.amazon.com/wellarchitected/latest/security-pillar/welcome.html" },
      { label: "AWS Well-Architected Framework, Security section", url: "https://docs.aws.amazon.com/wellarchitected/latest/framework/security.html" },
      { label: "AWS IAM, Security best practices", url: "https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html" },
      { label: "AWS IAM, Prepare for least-privilege permissions", url: "https://docs.aws.amazon.com/IAM/latest/UserGuide/getting-started-reduce-permissions.html" },
      { label: "AWS Shared Responsibility Model", url: "https://aws.amazon.com/compliance/shared-responsibility-model/" },
      { label: "AWS CloudTrail, What Is AWS CloudTrail", url: "https://docs.aws.amazon.com/awscloudtrail/latest/userguide/cloudtrail-user-guide.html" },
      { label: "Amazon VPC, What is Amazon VPC", url: "https://docs.aws.amazon.com/vpc/latest/userguide/what-is-amazon-vpc.html" },
      { label: "Amazon VPC, Security groups", url: "https://docs.aws.amazon.com/vpc/latest/userguide/vpc-security-groups.html" },
      { label: "Amazon VPC, Network ACLs", url: "https://docs.aws.amazon.com/vpc/latest/userguide/vpc-network-acls.html" },
      { label: "AWS Security Hub, Introduction (CSPM)", url: "https://docs.aws.amazon.com/securityhub/latest/userguide/what-is-securityhub.html" },
      { label: "Amazon GuardDuty, What is Amazon GuardDuty", url: "https://docs.aws.amazon.com/guardduty/latest/ug/what-is-guardduty.html" },
      { label: "AWS KMS, Developer Guide (overview)", url: "https://docs.aws.amazon.com/kms/latest/developerguide/overview.html" },
      { label: "AWS Config, What Is AWS Config", url: "https://docs.aws.amazon.com/config/latest/developerguide/WhatIsConfig.html" },
      { label: "AWS Cloud Security (official hub)", url: "https://aws.amazon.com/security/" },
    ],
    changelog: [
      "2026-08-24: first version, based on the verified dossier (evergreen-cloud-06, READY). Official AWS sources accessed and confirmed on 24/08/2026.",
    ],
  },
  {
    slug: "analise-de-logs-comportamentos-maliciosos",
    title: "Log analysis: identifying malicious behavior",
    category: "SOC",
    excerpt:
      "Learn how to correlate log events and identify patterns that indicate suspicious or malicious activity.",
    date: "August 24, 2026",
    dateISO: "2026-08-24",
    readTime: "7 min read",
    image: "/assets/blog/analise-logs-thumb.webp",
    author: "CyDef Team",
    sections: [
      {
        paragraphs: [
          "SOC analysts receive thousands of log events every day, and the difference between an alert queue and an effective investigation lies in how these events are correlated. This guide presents a four-step method — data sources, normalization, timeline, and pattern recognition — to turn scattered logs into investigable hypotheses, based on current official sources: NIST, OWASP, MITRE, CIS, and IETF. As of this review's cutoff date (24/08/2026), these were the references consulted. The next step, once you finish reading, is to apply the method to your own alert queue.",
        ],
      },
      {
        heading: "Why log analysis is the foundation of detection",
        paragraphs: [
          "A log is a record of events that occur on the organization's computing assets, and log management is the process of generating, transmitting, storing, accessing, and disposing of that data — per the definition in the [NIST SP 800-92 Rev. 1 (draft)](https://csrc.nist.gov/pubs/sp/800/92/r1/ipd), NIST's log management planning guide. The current final document, [NIST SP 800-92](https://csrc.nist.gov/pubs/sp/800/92/final) (2006), already consolidated the practice: without well-defined log infrastructure and processes, analysis is limited to what happened to be recorded.",
          "The consequence of insufficient logging is recognized in the [OWASP Top 10:2025, category A09 — Security Logging and Alerting Failures](https://owasp.org/Top10/2025/A09_2025-Security_Logging_and_Alerting_Failures): without records and monitoring, attacks and breaches are not detected — and, without alerts, it is hard to respond in time. In other words: logs are not bureaucracy; they are the raw material of detection.",
        ],
        lists: [],
      },
      {
        heading: "Step 1 — Know your data sources (and the gaps)",
        paragraphs: [
          "Before correlating, you need to know what is being collected. Typical sources include authentication, operating system, application, network, and DNS. The [CIS Controls v8.1, Control 8 (Audit Log Management)](https://www.cisecurity.org/controls/audit-log-management) summarizes the goal: collect, alert, review, and retain logs of events that help detect, understand, or recover from an attack.",
          "The minimum recommended by the [OWASP Logging Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html) for application logs includes:",
          "The step ends with an honest inventory of gaps: what should be logged and is not. A collection gap is not a tool problem — it is a visibility limit that must be declared.",
        ],
        lists: [
          {
            items: [
              "Authentication successes and failures — repeated failures are early indicators of credential-based attacks.",
              "Authorization (access control) failures.",
              "Input validation failures.",
              "Application errors and system events (service start/end, configuration changes).",
              "Use of administrative privileges and exception accounts.",
            ],
          },
        ],
      },
      {
        heading: "Step 2 — Normalize before correlating",
        paragraphs: [
          "Events from different sources rarely talk to each other in raw form: the \"user\" field may be called `user`, `username`, or `sAMAccountName`, and timestamps may come in different time zones. Correlating without normalizing produces false conclusions.",
          "The [RFC 5424](https://www.rfc-editor.org/rfc/rfc5424), the IETF standard for structured syslog, is a useful reference: it defines fields such as timestamp, hostname, application name, and structured data, which eases consumption and correlation by different systems. In practice, the minimum fields that an analysis needs consistently are:",
          "A detail that seems operational but is actually analytical: unsynchronized clocks make a timeline impossible. That is why CIS Control 8 includes standardizing time synchronization across assets (safeguard 8.4). If the authentication server's clock is five minutes behind the firewall's, the real sequence of events becomes illegible.",
        ],
        lists: [
          {
            items: [
              "**Normalized timestamp (ideally UTC)**, to compare events across time zones.",
              "**Source host/entity**.",
              "**User or account involved**.",
              "**Action performed** and **result** (success/failure).",
            ],
          },
        ],
      },
      {
        heading: "Step 3 — Build the timeline and correlate",
        paragraphs: [
          "With normalized data, the next step is correlating by entity and by time. The guiding question is: \"what did this user (or host) do, in what order, and what does it mean in context?\"",
          "Correlation examples worth pursuing:",
          "[MITRE ATT&CK](https://attack.mitre.org/) (current version: v19.2, published in August 2026) is the reference for describing this behavior in a common language: instead of \"the user did something strange\", the team talks about attack phases, such as initial access, lateral movement, or exfiltration. An important detail: ATT&CK is a vocabulary for formulating hypotheses — mapping an observable to a technique does not prove that the event is malicious. That is why this guide avoids pinning technique IDs: v19 restructured tactics such as Defense Evasion, and IDs change between versions.",
        ],
        lists: [
          {
            items: [
              "The same account shows authentication failures across multiple hosts and then a success coming from an unusual address.",
              "A successful access is followed, within minutes, by a privilege change and access to sensitive data.",
              "A low-activity host starts performing administrative actions with a service account.",
            ],
          },
        ],
      },
      {
        heading: "Step 4 — Recognize suspicious patterns (and validate)",
        paragraphs: [
          "Patterns are signals to investigate, never confirmation. The examples below are conceptual and anonymized — they serve to calibrate the eye, not as a universal rule:",
          "Before escalating any pattern, validate with a second independent source: does the event appear on the domain controller and on the firewall? Does the time match in the correct time zone? A single log does not sustain an incident; two agreeing sources form a defensible hypothesis.",
        ],
        lists: [
          {
            items: [
              "**Brute force / credential stuffing:** many authentication failures for the same account, followed by success, coming from an unusual address or time range. OWASP recommends logging authentication failures precisely for this reason.",
              "**Out-of-pattern access:** use of an administrative account at an unusual time, without a ticket or justification.",
              "**Login → privilege → data chain:** authentication, elevation, and access to sensitive data in rapid sequence.",
              "**Compromised defense:** disabled logging, stalled collection agents, or sudden event gaps, accompanied by service failures.",
            ],
          },
        ],
      },
      {
        heading: "False positives, evidence, and preservation",
        paragraphs: [
          "Two common mistakes destroy the value of analysis: overly broad rules and fragile logs. Excessively broad rules produce what OWASP calls \"alarm fog\" — so much noise that real problems go unnoticed. Detection rules must be tested against a baseline and tuned based on the false positive rate, without losing the target events.",
          "Log integrity is also part of the analysis: alterable logs cannot serve as evidence. CIS Control 8 guides protecting collection and retention; the [NIST SP 800-61r3](https://csrc.nist.gov/pubs/sp/800/61/r3/final) (finalized in April 2025), the current incident response guide, reinforces evidence preservation as part of the detection and response cycle. In practice: preserve the original logs before any containment action, do not overwrite data, record who collected what and when, and follow the chain of custody defined in the organization's internal process.",
        ],
        lists: [],
      },
      {
        heading: "What we still do not know",
        paragraphs: [
          "This guide does not prescribe specific tools and does not claim CyDef telemetry or internal experience. NIST SP 800-92r1 is still a draft (the current final document is SP 800-92 from 2006) and should be followed until its definitive publication. The cited versions — ATT&CK v19.2, CIS Controls v8.1 — were verified on 24/08/2026 and need to be revalidated before publication. The author and technical reviewer of this article have not yet been defined.",
        ],
        lists: [],
      },
      {
        heading: "Next steps",
        paragraphs: [
          "Apply the four steps to your alert queue: map the data sources and the gaps, normalize fields and clocks, build the timeline by entity, document hypotheses with ATT&CK vocabulary, and validate each pattern with a second source before escalating. Consult the official references below to go deeper.",
        ],
        lists: [],
      },
    ],
    sources: [
      { label: "NIST SP 800-92 (final, 2006)", url: "https://csrc.nist.gov/pubs/sp/800/92/final" },
      { label: "NIST SP 800-92 Rev. 1 (draft, 2023)", url: "https://csrc.nist.gov/pubs/sp/800/92/r1/ipd" },
      { label: "OWASP Logging Cheat Sheet", url: "https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html" },
      { label: "OWASP Top 10:2025, A09 Security Logging and Alerting Failures", url: "https://owasp.org/Top10/2025/A09_2025-Security_Logging_and_Alerting_Failures" },
      { label: "MITRE ATT&CK (v19.2)", url: "https://attack.mitre.org/" },
      { label: "CIS Controls v8.1, Control 8 (Audit Log Management)", url: "https://www.cisecurity.org/controls/audit-log-management" },
      { label: "NIST SP 800-61r3 (final, 2025)", url: "https://csrc.nist.gov/pubs/sp/800/61/r3/final" },
      { label: "RFC 5424, The Syslog Protocol (IETF)", url: "https://www.rfc-editor.org/rfc/rfc5424" },
    ],
    changelog: [
      "2026-08-24: first version, based on the verified dossier (evergreen-logs-07, READY). Sources accessed and verified on 2026-08-24.",
    ],
  },
  {
    slug: "inteligencia-de-ameacas-como-usar-iocs",
    title: "Threat Intelligence: How to use IOCs effectively",
    category: "Threat Intelligence",
    excerpt:
      "Understand how to collect, validate, and apply Indicators of Compromise in the context of proactive defense.",
    date: "August 24, 2026",
    dateISO: "2026-08-24",
    readTime: "9 min read",
    image: "/assets/blog/threat-intel-thumb.webp",
    author: "CyDef Team",
    sections: [
      {
        paragraphs: [
          "A feed of Indicators of Compromise (IOCs) does not protect anyone by itself: a poorly validated indicator causes improper blocking, and an ignored indicator causes missed detection. This guide presents a four-stage lifecycle — collect, validate, apply, and expire — for those operating a SOC, Blue Team, or detection, based on current official sources: OASIS STIX 2.1 and TAXII 2.1, CISA, FIRST, MITRE ATT&CK, NIST, MISP, and AlienVault OTX. As of this review's cutoff date (24/08/2026), these were the references consulted. No real IOC is cited here: the examples are conceptual and serve to calibrate the process, not to copy values. The next step, once you finish reading, is to apply the cycle to the feeds your team already consumes.",
        ],
      },
      {
        heading: "What an IOC is (and what it is not)",
        paragraphs: [
          "An indicator of compromise is an observable — IP address, domain, file hash, path, email address, registry key — associated with known or suspected malicious activity. NIST's official guide to threat information sharing, the [NIST SP 800-150](https://csrc.nist.gov/pubs/sp/800/150/final) (published in October 2016), treats indicators as a central piece of cyber intelligence sharing between organizations.",
          "The most used technical format for representing an IOC comes from the [OASIS STIX 2.1 standard](https://docs.oasis-open.org/cti/stix/v2.1/os/stix-v2.1-os.html) (published in June 2021): the `indicator` object carries a `pattern` — a structured expression describing the observable to look for —, a validity window, labels, and the attack phases in which it applies. In practice, an indicator answers an objective question: \"has this observable ever been associated with malicious activity?\"",
          "The point that most often causes misinterpretation is this: **an IOC is evidence for triage, not the attacker's identity and not the confirmation of compromise**. An address seen in a campaign may be shared by a CDN; a domain may be sinkholed by a researcher; a hash may reappear in a legitimate binary. The match of an indicator opens an investigation — and nothing more.",
        ],
        lists: [],
      },
      {
        heading: "Why IOCs expire: volatile vs. durable",
        paragraphs: [
          "Indicators are volatile by nature. The adversary swaps infrastructure, registers new domains, rotates IPs, and recompiles samples — which makes each indicator a photograph of a specific moment. The STIX 2.1 standard itself recognizes this reality: the `indicator` object defines `valid_from` and `valid_until` fields — that is, the formal standard provides that an indicator has a window of utility and expires.",
          "The contrast lies in TTPs — tactics, techniques, and procedures. [MITRE ATT&CK](https://attack.mitre.org/) (current version: v19.2, published in August 2026) organizes adversary behavior into tactics and techniques observed in real intrusions; the [Cyber Kill Chain from Lockheed Martin](https://www.lockheedmartin.com/en-us/capabilities/cyber/cyber-kill-chain.html), a framework that is part of the Intelligence Driven Defense model, describes the phases the adversary must complete to reach the objective. While the IOC answers \"what to look for\", TTPs answer \"how the adversary acts\" — and behavior is more durable than infrastructure.",
          "This distinction is an editorial synthesis supported by these three references: an IOC expires, a TTP persists, and a mature operation uses both — IOC to detect the known, TTP to hunt the unknown.",
        ],
        lists: [],
      },
      {
        heading: "How to collect IOCs with quality",
        paragraphs: [
          "Collection starts with a purpose question, not with volume: what decision will this indicator support — detection, blocking, triage, or prioritization? NIST SP 800-150 guides that threat information sharing be done within defined relationships and processes, not as indiscriminate accumulation of data.",
          "The sources are organized in layers:",
          "When collecting, record metadata: who published, when, with what confidence, and under which sharing label. FIRST's [Traffic Light Protocol (TLP) 2.0](https://www.first.org/tlp/) (authoritative since August 2022) defines four labels — RED, AMBER, GREEN, and CLEAR — indicating how far the information may be passed along. An AMBER IOC is not republished without authorization; respecting the label is part of the responsible use of intelligence.",
        ],
        lists: [
          {
            items: [
              "**Your own telemetry and incidents** — the most reliable source for your context, as long as it is recorded with date, origin, and evidence.",
              "**Open communities and platforms** — [MISP](https://www.misp-project.org/) is an open source platform for collecting, storing, distributing, and sharing indicators, used by CERTs and organizations; [AlienVault OTX](https://otx.alienvault.com/) (operated by LevelBlue) is a community exchange in which \"pulses\" gather IOCs and sharing labels.",
              "**Government programs** — CISA's [Automated Indicator Sharing (AIS)](https://www.cisa.gov/topics/cyber-threats-and-advisories/information-sharing/automated-indicator-sharing-ais) is the designated hub for indicator exchange between the U.S. federal government and the private sector, operational since March 2016, using STIX/TAXII; CISA's [KEV catalog](https://www.cisa.gov/known-exploited-vulnerabilities-catalog) gathers vulnerabilities with known real-world exploitation.",
              "**Commercial feeds** — useful, but they must go through the same validation process as any other source.",
            ],
          },
        ],
      },
      {
        heading: "How to validate before acting",
        paragraphs: [
          "The cheapest defensive rule that exists is: **no automatic blocking based on a single low-confidence IOC**. Before acting, validate four things:",
          "1. **Source and confidence** — who published and what is that source's track record? On community platforms such as OTX, quality varies because it is crowdsourced: a pulse is not a lab report. 2. **Age** — is the indicator still within its utility window? An old indicator without revalidation loses value and becomes noise. 3. **Context** — is the observable exclusive to the described activity or could it be shared infrastructure (dynamic IP, CDN, hosting)? 4. **Independent confirmation** — does a second source or your own telemetry support the same conclusion?",
          "The same prioritization principle exists on the vulnerability side, and it is worth not confusing the metrics: FIRST's [EPSS](https://www.first.org/epss/) estimates the probability of a CVE being exploited in the next 30 days — it is probability, not confirmation of attack; CISA's KEV indicates known exploitation — it does not prove local compromise. Using both as prioritization input is correct; treating them as a compromise alarm is not.",
        ],
        lists: [],
      },
      {
        heading: "How to apply IOCs in detection",
        paragraphs: [
          "IOCs enter operations in layers, with context. An indicator match in a SIEM, EDR, or firewall is a triage trigger — a low-fidelity signal that deserves investigation, not a verdict. Two practices make the application sustainable:",
          "Always test in detection mode before blocking: enable the alert, measure false positives for a defined period, and only then consider blocking, with an expiration window and a rollback procedure.",
        ],
        lists: [
          {
            items: [
              "**Structured transport.** The [OASIS TAXII 2.1 protocol](https://docs.oasis-open.org/cti/taxii/v2.1/os/taxii-v2.1-os.html) defines a RESTful API for communicating threat information between client and server; combined with STIX, it allows importing feeds with pattern, validity, and context — instead of loose lists of values. It is the same mechanism used by CISA's AIS.",
              "**Complement with TTP.** An IOC list detects what is already known. For the unknown, the operation needs behavior hypotheses: describe the observed pattern with ATT&CK vocabulary and with the kill chain phases, and hunt by behavior, not just by value. An important detail: ATT&CK is a taxonomy — mapping an observable to a technique is analysis, not proof, and technique IDs change between versions.",
            ],
          },
        ],
      },
      {
        heading: "IOC expiration and hygiene",
        paragraphs: [
          "Keeping the list clean is as defensive as feeding it. Use the indicator's validity window (the STIX `valid_until`, when the source provides it), define a review cadence, and remove expired or unconfirmed IOCs. Simple metrics help: how many alerts does each feed generate and how many turn into useful investigation? A feed that only produces noise is costing analyst attention — the \"alarm fog\" that hides the real signals.",
          "Also record the decisions: why an IOC was blocked and why it was removed. Improper blocks happen — shared IP, reused domain — and need fast, documented reversal.",
        ],
        lists: [],
      },
      {
        heading: "What we still do not know",
        paragraphs: [
          "This guide does not prescribe specific tools, does not cite real IOCs, and does not claim CyDef telemetry or internal experience. The cited versions — STIX 2.1 and TAXII 2.1 (June 2021), TLP 2.0 (August 2022), ATT&CK v19.2 (August 2026) — were verified on 24/08/2026 and need to be revalidated before publication. No feed effectiveness metrics or campaign prevalence data were found in the sources consulted, and none will be invented. The author and technical reviewer of this article have not yet been defined.",
        ],
        lists: [],
      },
      {
        heading: "Next steps",
        paragraphs: [
          "Apply the cycle to the sources your team already consumes: record the origin and confidence of each IOC, define a validity window, enable alert-only detection, measure false positives, and document the expiration policy — before any automatic blocking. Consult the official references below to go deeper and revalidate volatile sources immediately before publishing.",
        ],
        lists: [],
      },
    ],
    sources: [
      { label: "NIST SP 800-150, Guide to Cyber Threat Information Sharing (final, 2016)", url: "https://csrc.nist.gov/pubs/sp/800/150/final" },
      { label: "OASIS STIX Version 2.1 (OASIS Standard, 2021)", url: "https://docs.oasis-open.org/cti/stix/v2.1/os/stix-v2.1-os.html" },
      { label: "OASIS TAXII Version 2.1 (OASIS Standard, 2021)", url: "https://docs.oasis-open.org/cti/taxii/v2.1/os/taxii-v2.1-os.html" },
      { label: "CISA Known Exploited Vulnerabilities (KEV) Catalog", url: "https://www.cisa.gov/known-exploited-vulnerabilities-catalog" },
      { label: "FIRST Exploit Prediction Scoring System (EPSS)", url: "https://www.first.org/epss/" },
      { label: "FIRST Traffic Light Protocol (TLP) 2.0", url: "https://www.first.org/tlp/" },
      { label: "MITRE ATT&CK (v19.2)", url: "https://attack.mitre.org/" },
      { label: "MISP", url: "https://www.misp-project.org/" },
      { label: "AlienVault OTX (LevelBlue)", url: "https://otx.alienvault.com/" },
      { label: "Lockheed Martin Cyber Kill Chain", url: "https://www.lockheedmartin.com/en-us/capabilities/cyber/cyber-kill-chain.html" },
      { label: "CISA Automated Indicator Sharing (AIS)", url: "https://www.cisa.gov/topics/cyber-threats-and-advisories/information-sharing/automated-indicator-sharing-ais" },
    ],
    changelog: [
      "2026-08-24: first version, based on the verified dossier (evergreen-threatintel-08, READY). Sources accessed and verified on 2026-08-24.",
    ],
  },
];
