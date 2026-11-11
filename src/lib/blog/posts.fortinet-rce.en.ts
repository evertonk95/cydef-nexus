import type { BlogPost } from "./posts";

/**
 * Fortinet: critical flaws in FortiManager and FortiAnalyzer allow unauthenticated
 * code execution (November 2026, EN). Content prepared from FortiGuard Labs
 * advisories (FG-IR-26-219, FG-IR-26-275, FG-IR-26-276 and FG-IR-26-274) and the
 * Cyber Security News publication, verified on November 11, 2026. Cover:
 * public/assets/blog/fortinet-fortimanager-fortianalyzer-rce-thumb.webp
 */
export const fortinetRcePostEn: BlogPost = {
  slug: "fortinet-fortimanager-fortianalyzer-rce-cve-2026-126170",
  title:
    "Fortinet fixes critical flaws in FortiManager and FortiAnalyzer with unauthenticated code execution",
  category: "Threat Intelligence",
  excerpt:
    "Fortinet disclosed critical flaws in FortiManager, FortiAnalyzer and related products on November 10, 2026, including CVE-2026-126170 (CVSS 9.8), which allows unauthenticated code or command execution when the JSON API is enabled.",
  date: "November 11, 2026",
  dateISO: "2026-11-11",
  readTime: "9 min read",
  image: "/assets/blog/fortinet-fortimanager-fortianalyzer-rce-thumb.webp",
  author: "CyDef Team",
  tags: [
    "Fortinet",
    "FortiManager",
    "FortiAnalyzer",
    "CVE-2026-126170",
    "Remote code execution",
    "JSON injection",
    "SQL injection",
    "SSRF",
    "Threat Intelligence",
  ],
  toc: true,
  sections: [
    {
      blocks: [
        {
          type: "p",
          text: "On November 10, 2026, Fortinet disclosed a set of critical flaws in security management and analytics products, notably **FortiManager** and **FortiAnalyzer**. The most severe, **CVE-2026-126170**, received a base score of **CVSS 9.8** and allows an unauthenticated attacker to execute code or commands through the JSON-RPC API, when the JSON API is enabled.",
        },
        {
          type: "p",
          text: "The batch is not a single flaw: it combines four critical vulnerabilities with distinct causes, JSON injection in the JSON-RPC API, an authorization flaw in the FGFM service, SQL injection and server-side request forgery (SSRF) in the OFTP service. Each has its own vector and prerequisites, so exposure depends on which features and ports are enabled in each environment.",
        },
        {
          type: "p",
          text: "A central point for risk assessment: the JSON API of CVE-2026-126170 ships **disabled by default**. The real risk concentrates in environments that enabled it for automation. The FGFM and OFTP flaws, in turn, expose the devices' own communication services, which are not protected by the panel's login restrictions.",
        },
        {
          type: "callout",
          callout: {
            kind: "ponto",
            title: "CyDef Assessment",
            body: "What makes this batch relevant is the target: FortiManager and FortiAnalyzer are the management center of many Fortinet environments. Compromising the manager often opens a path to the devices it administers. The correct response combines two layers: update to the fixed versions and, where the update does not fit yet, disable the JSON API and restrict network access to the FGFM (TCP 541) and OFTP (TCP 514) ports, which are not protected by the web interface login restriction.",
          },
        },
        {
          type: "note",
          text: "Author: CyDef Team. FortiGuard Labs advisories (FG-IR-26-219, FG-IR-26-275, FG-IR-26-276, FG-IR-26-274) and Cyber Security News publication verified on November 11, 2026.",
        },
      ],
    },
    {
      heading: "Executive summary",
      blocks: [
        {
          type: "p",
          text: "What is known as of November 11, 2026, based on the FortiGuard Labs advisories and the publication reviewed:",
        },
        {
          type: "list",
          items: [
            "**Disclosure:** November 10, 2026, with updates released before the detailed advisories were published.",
            "**Most severe flaw:** CVE-2026-126170, JSON injection in the JSON-RPC API, CVSS 9.8 (FG-IR-26-219).",
            "**Other critical flaws:** CVE-2026-126261 (FGFM authorization, CVSS 9.0), CVE-2026-126262 (SQL injection via OFTP, CVSS 9.3) and CVE-2026-126260 (SSRF via OFTP, CVSS 9.0).",
            "**Vectors:** JSON-RPC API, FGFM service and OFTP protocol.",
            "**Prerequisite of the most severe:** JSON API enabled (disabled by default).",
            "**Known exploitation:** Fortinet marked CVE-2026-126261 as not known to be exploited on the publication date.",
            "**Target:** no specific type of organization identified as the main target.",
          ],
        },
      ],
    },
    {
      heading: "The four critical flaws",
      blocks: [
        {
          type: "table",
          table: {
            headers: ["CVE", "CVSS", "Type", "Products / service"],
            rows: [
              ["CVE-2026-126170", "9.8", "JSON injection (CWE-116)", "FortiManager, FortiAnalyzer and variants, JSON-RPC API (FG-IR-26-219)"],
              ["CVE-2026-126262", "9.3", "SQL injection (CWE-89)", "FortiAnalyzer and FortiManager with FortiAnalyzer features, via OFTP (FG-IR-26-276)"],
              ["CVE-2026-126261", "9.0", "Authorization flaw", "FortiManager, FGFM service (FG-IR-26-275)"],
              ["CVE-2026-126260", "9.0", "SSRF (CWE-918)", "FortiAnalyzer and FortiManager with FortiAnalyzer features, via OFTP (FG-IR-26-274)"],
            ],
          },
        },
        {
          type: "p",
          text: "The two OFTP flaws, CVE-2026-126262 and CVE-2026-126260, should not be confused. The first is SQL injection with code execution potential; the second is server-side request forgery, a different vector. CVE-2026-126261 occurs before the registration password is verified, placing the FGFM service itself in the attack path.",
        },
      ],
    },
    {
      heading: "CVE-2026-126170: JSON injection in the JSON-RPC API",
      blocks: [
        {
          type: "p",
          text: "The most severe flaw lives in the JSON-RPC API used by FortiManager and FortiAnalyzer. When the JSON API is enabled, a specially crafted HTTP request may allow an unauthenticated attacker to execute code or commands. The advisory classifies the cause as improper encoding or escaping of output (CWE-116).",
        },
        {
          type: "list",
          title: "Products affected by CVE-2026-126170",
          items: [
            "**FortiManager 8.0:** 8.0.0 through 8.0.2 · **FortiManager 7.6:** 7.6.0 through 7.6.7.",
            "**FortiAnalyzer 8.0:** 8.0.0 through 8.0.2 · **FortiAnalyzer 7.6:** 7.6.0 through 7.6.7.",
            "**FortiManager Cloud 8.0:** 8.0.1 through 8.0.2 · **FortiManager Cloud 7.6:** 7.6.0 through 7.6.7.",
            "**FortiAnalyzer Cloud 8.0:** 8.0.1 through 8.0.2 · **FortiAnalyzer Cloud 7.6:** 7.6.0 through 7.6.7.",
            "**FortiAnalyzer-BigData 7.6:** 7.6.0 through 7.6.2.",
            "**FortiSASE-Sovereign:** several versions, with the fix depending on the release.",
          ],
        },
        {
          type: "p",
          text: "The 7.4 and 7.2 branches of FortiManager and FortiAnalyzer are not affected by this specific CVE. This does not waive the verification of the other flaws in the batch, which have their own version tables.",
        },
      ],
    },
    {
      heading: "Fixed versions per flaw",
      blocks: [
        {
          type: "p",
          text: "The fixes vary by flaw and by software branch. The table below summarizes the fix versions indicated in the advisories.",
        },
        {
          type: "table",
          table: {
            headers: ["Product", "CVE-2026-126170", "CVE-2026-126261", "CVE-2026-126262 / CVE-2026-126260"],
            rows: [
              ["FortiManager 8.0", "8.0.3 (forthcoming)", "8.0.1", "8.0.1 (SQLi) / 8.0.1 (SSRF)"],
              ["FortiManager 7.6", "7.6.8", "7.6.8", "7.6.8"],
              ["FortiManager 7.4", "not affected", "7.4.6", "7.4.12"],
              ["FortiManager 7.2", "not affected", "7.2.9", "7.2.13 (SQLi) / not affected (SSRF)"],
              ["FortiAnalyzer 8.0", "8.0.3 (forthcoming)", "not affected", "8.0.2 (SQLi) / 8.0.1 (SSRF)"],
              ["FortiAnalyzer 7.6", "7.6.8", "not affected", "7.6.8"],
              ["FortiAnalyzer 7.4", "not affected", "not affected", "7.4.12"],
              ["FortiAnalyzer 7.2", "not affected", "not affected", "7.2.13 (SQLi) / not affected (SSRF)"],
            ],
          },
        },
        {
          type: "p",
          text: "One point of attention in the 8.0 branch: for CVE-2026-126170, version 8.0.3 was listed as forthcoming in the advisory, meaning it was not yet available on the publication date. In that case, the immediate path is mitigation, disable the JSON API, until version 8.0.3 is released.",
        },
      ],
    },
    {
      heading: "Why the FGFM and OFTP ports matter",
      blocks: [
        {
          type: "p",
          text: "The FGFM and OFTP flaws expose services that sit outside the protection of the panel login. FGFM uses TCP port 541 and is the service through which devices register and communicate with FortiManager. OFTP uses TCP port 514 and handles log transfer.",
        },
        {
          type: "p",
          text: "Restricting the administrative login through the web interface does not protect these ports. An attacker who reaches the FGFM port can send crafted packets to exploit CVE-2026-126261 even before the registration password is verified. Likewise, whoever reaches the OFTP port can exploit the SQL injection and SSRF flaws. That is why network containment enters the response with the same weight as the update.",
        },
      ],
    },
    {
      heading: "Mitigation recommendations",
      blocks: [
        {
          type: "list",
          items: [
            "**Inventory** the Fortinet products in the environment, with version, branch and enabled features.",
            "**Apply** the fixed version corresponding to each product and flaw, according to the version table.",
            "**Disable** the JSON API when not necessary, configuring rpc-permit as none in the administrator profiles.",
            "**Restrict** network access to the FGFM (TCP 541) and OFTP (TCP 514) ports, allowing only necessary connections.",
            "**Back up** device configurations before applying the updates.",
            "**Monitor** unauthorized changes on managed devices and on the managers themselves.",
            "**Review** the official Fortinet advisories to confirm the fix applicable to each flaw.",
          ],
        },
        {
          type: "callout",
          callout: {
            kind: "regra",
            title: "Update or network containment",
            body: "When the update cannot be applied immediately, the mitigation is to disable the JSON API in the administrator profiles (set rpc-permit none) and restrict network access to the vulnerable services, allowing only necessary connections.",
          },
        },
      ],
    },
    {
      heading: "What we still do not know / limits of this article",
      blocks: [
        {
          type: "p",
          text: "This article was prepared from the FortiGuard Labs advisories and the Cyber Security News publication, with verification on November 11, 2026. There is no CyDef telemetry of its own about these vulnerabilities and no exploitation observed internally.",
        },
        {
          type: "p",
          text: "Fortinet marked CVE-2026-126261 as not known to be exploited on the publication date, and did not identify a specific type of organization as the main target. The November batch also includes routing and access-control flaws in FortiOS that this article does not detail, as they are a different class. This text will be updated when there is new verifiable information.",
        },
      ],
    },
    {
      heading: "Next steps",
      blocks: [
        {
          type: "list",
          items: [
            "Enumerate the Fortinet products in the environment, prioritizing FortiManager, FortiAnalyzer and their cloud variants.",
            "Check whether the JSON API is enabled and disable it where not necessary.",
            "Plan the application of the fixed versions, with attention to the 8.0 branch, where 8.0.3 was still listed as forthcoming.",
            "Restrict network access to the FGFM and OFTP ports while the updates are not applied.",
          ],
        },
      ],
    },
  ],
  sources: [
    {
      label:
        "FortiGuard Labs: JSON Injection in JRPC API (FG-IR-26-219, CVE-2026-126170)",
      url: "https://fortiguard.fortinet.com/psirt/FG-IR-26-219",
    },
    {
      label:
        "FortiGuard Labs: Improper authorization in FortiManager FGFM (FG-IR-26-275, CVE-2026-126261)",
      url: "https://fortiguard.fortinet.com/psirt/FG-IR-26-275",
    },
    {
      label:
        "FortiGuard Labs: SQL injection via OFTP (FG-IR-26-276, CVE-2026-126262)",
      url: "https://fortiguard.fortinet.com/psirt/FG-IR-26-276",
    },
    {
      label:
        "FortiGuard Labs: SSRF via OFTP (FG-IR-26-274, CVE-2026-126260)",
      url: "https://fortiguard.fortinet.com/psirt/FG-IR-26-274",
    },
    {
      label:
        "Cyber Security News: Critical Fortinet Flaws Expose FortiManager and FortiAnalyzer to Remote Code Execution Without Login",
      url: "https://cybersecuritynews.com/critical-fortinet-flaws-patched/",
    },
  ],
  changelog: [
    "2026-11-11: first version, based on the FortiGuard Labs advisories and the Cyber Security News publication, verified on this date.",
  ],
};
