import type { BlogPost } from "./posts";

/**
 * Mozilla fixes 99 flaws in Firefox 160 (EN).
 * Source: MFSA 2026-125 (Mozilla) and Cyber Security News analysis.
 * Cover: public/assets/blog/firefox-160-correcoes-seguranca-thumb.webp
 */
export const firefox160CorrecoesSegurancaPostEn: BlogPost = {
  slug: "firefox-160-correcoes-seguranca",
  title:
    "Mozilla fixes 99 flaws in Firefox 160, including sandbox escapes and privilege escalation",
  category: "Threat Intelligence",
  excerpt:
    "Mozilla released Firefox 160 with fixes for 99 vulnerabilities, 57 of them high impact, covering sandbox escapes, privilege escalation, same-origin policy bypass and memory errors in graphics, networking and storage components.",
  date: "November 17, 2026",
  dateISO: "2026-11-17",
  readTime: "7 min",
  image: "/assets/blog/firefox-160-correcoes-seguranca-thumb.webp",
  author: "CyDef Team",
  tags: [
    "Mozilla Firefox",
    "Vulnerabilities",
    "Sandbox Escape",
    "Privilege Escalation",
    "Security Update",
    "Browser",
    "Threat Intelligence",
  ],
  toc: true,
  sections: [
    {
      blocks: [
        {
          type: "p",
          text: "On November 10, 2026, Mozilla published Firefox 160 along with security advisory MFSA 2026-125, which bundles fixes for 99 vulnerabilities rated overall high impact. The release covers sandbox escapes, privilege escalation, same-origin policy bypass, information disclosure and memory errors across core browser components such as graphics, networking, storage, audio and video, IPC and the JavaScript engine.",
        },
        {
          type: "p",
          text: "According to the breakdown published by Cyber Security News based on Mozilla's advisory, the severity split is 57 high-impact flaws, 24 moderate-impact issues and 18 low-impact flaws. Mozilla did not state that any of these vulnerabilities are being exploited in active attacks.",
        },
        {
          type: "callout",
          callout: {
            kind: "ponto",
            title: "CyDef assessment",
            body: "Sandbox escape and privilege escalation show up in the same advisory and in the same browser. Each of these groups only becomes serious when chained with an execution flaw in the content process, but that chain is exactly what an attacker wants: first compromise the renderer, then break the isolation. The browser remains one of the largest attack surfaces on the endpoint, and a one-week update window between advisory publication and fleet-wide patching is already enough time for opportunistic exploitation.",
          },
        },
        {
          type: "note",
          text: "Author: CyDef Team. MFSA 2026-125 and the Cyber Security News report were reviewed on November 17, 2026.",
        },
      ],
    },
    {
      heading: "Executive summary",
      blocks: [
        {
          type: "p",
          text: "What is known about the update, based on Mozilla's official advisory and the Cyber Security News analysis:",
        },
        {
          type: "list",
          items: [
            "**Product and fixed version:** Mozilla Firefox 160 for desktop and Firefox for Android, both at version 160 or later.",
            "**Volume of fixes:** 99 vulnerabilities, 57 high impact, 24 moderate impact and 18 low impact.",
            "**Publication date:** November 10, 2026, in advisory MFSA 2026-125.",
            "**Flaw types:** sandbox escape, privilege escalation, same-origin policy bypass, information disclosure, use-after-free, invalid pointers, incorrect boundary conditions and site isolation issues.",
            "**Most frequently cited components:** Graphics (CanvasWebGL, Text, WebRender, WebGPU), DOM (Navigation, Core & HTML, Service Workers, Editor, Selection), Networking (HTTP, Cache, Cookies), Storage (Cache API, localStorage), Audio/Video, IPC, Layout and JavaScript.",
            "**Active exploitation:** Mozilla does not report exploitation in real attacks in the advisory.",
            "**Derived products:** the advisory lists no matching fixes for Firefox ESR or Thunderbird, which must be checked separately.",
          ],
        },
        {
          type: "table",
          table: {
            headers: ["Impact", "Count"],
            rows: [
              ["High", "57"],
              ["Moderate", "24"],
              ["Low", "18"],
              ["Total", "99"],
            ],
          },
        },
      ],
    },
    {
      heading: "Key vulnerabilities in the advisory",
      blocks: [
        {
          type: "p",
          text: "The advisory describes each flaw individually and does not present a single exploitation chain. The entries below are the ones highlighted by both sources consulted or that directly break the browser's isolation boundaries:",
        },
        {
          type: "list",
          items: [
            "**CVE-2026-124907 (High):** use-after-free in Graphics: CanvasWebGL, with privilege escalation and sandbox escape among the possible impacts. It is the flaw highlighted as most relevant in the Cyber Security News analysis.",
            "**CVE-2026-124853 (High):** incorrect boundary conditions in Graphics: Text, allowing a sandbox escape.",
            "**CVE-2026-124855 and CVE-2026-124905 (High):** sandbox escape in DOM: Navigation. The first is credited to researcher Tran Quac.",
            "**CVE-2026-124859 (High):** sandbox escape due to incorrect boundary conditions in Storage: Cache API.",
            "**CVE-2026-124861 (High):** sandbox escape due to use-after-free in Audio/Video: cubeb.",
            "**CVE-2026-124864 and CVE-2026-124900 (High):** sandbox escape due to use-after-free in DOM: Service Workers.",
            "**CVE-2026-124903 (High):** sandbox escape due to use-after-free in IPC, the component that handles communication between browser processes.",
            "**CVE-2026-124874 (High):** same-origin policy bypass in Networking: HTTP, credited to Minseong Kim.",
            "**CVE-2026-124909:** information disclosure in private browsing.",
            "**CVE-2026-124911:** clickjacking in Firefox for Android autofill.",
            "**CVE-2026-124858 (High):** use-after-free in DOM: HTML Parser, credited to Amy Burnett of OpenAI. OpenAI Codex Security, identified as kylebot, is credited with several other findings across layout, storage, JavaScript garbage collection and graphics.",
          ],
        },
        {
          type: "p",
          text: "Credits identify who reported each flaw, but they do not show whether the finding came from manual review or automated tooling. There is also no public detail on practical exploitation of each CVE, which is Mozilla's usual approach for this type of advisory.",
        },
      ],
    },
    {
      heading: "Affected products and versions",
      blocks: [
        {
          type: "p",
          text: "The advisory names Firefox 160 as the version containing the fixes. Earlier versions of the browser are therefore the ones potentially affected. The advisory does not detail the complete range of impacted versions, nor does it list which flaws affect Android only.",
        },
        {
          type: "table",
          table: {
            headers: ["Platform", "Fixed version"],
            rows: [
              ["Firefox for Windows", "160 or later"],
              ["Firefox for macOS", "160 or later"],
              ["Firefox for Linux", "160 or later"],
              ["Firefox for Android", "160 or later, via the app store"],
            ],
          },
        },
        {
          type: "p",
          text: "Administrators running Firefox ESR or Thunderbird should consult those products' advisories separately. MFSA 2026-125 does not confirm that the same flaws were fixed in those releases.",
        },
      ],
    },
    {
      heading: "Mitigation recommendations",
      blocks: [
        {
          type: "p",
          text: "The official fix exists and is available. The priority is to apply the update and verify the installed version, not just push the package:",
        },
        {
          type: "list",
          items: [
            "**Update to Firefox 160 or later** on every workstation and on servers with a graphical interface.",
            "**Confirm the installed version** through the Help menu, About Firefox option, and restart the browser to complete the update.",
            "**Update Firefox for Android** through the app store and check the version after installation.",
            "**Review the browser inventory** and identify endpoints running versions earlier than 160, including remote access machines and test environments.",
            "**Check Firefox ESR and Thunderbird advisories separately**, without assuming they received the same fixes.",
            "**Automate the update** through group policy, MDM or a package manager, with a scheduled restart, to reduce the window between advisory publication and fleet remediation.",
            "**Where the update cannot be applied immediately**, restrict external browsing to required sites, keep endpoint telemetry monitoring in place and follow Mozilla's advisories.",
          ],
        },
      ],
    },
    {
      heading: "What is still unknown and limits of this article",
      blocks: [
        {
          type: "p",
          text: "Mozilla does not state that the 99 vulnerabilities are being actively exploited, nor does it publish a detailed attack chain. The sources consulted give no indication of a public exploit for the set, which does not mean there is no risk: use-after-free flaws in graphics and media components are common targets for offensive research after an advisory is published.",
        },
        {
          type: "p",
          text: "This article does not cover the internal contents of the bug reports, which remain restricted, and it does not replace reading MFSA 2026-125 for anyone assessing specific exposure. CyDef will update the analysis if Mozilla publishes new data on exploitation or fixes for ESR and Thunderbird.",
        },
      ],
    },
  ],
  sources: [
    {
      label: "Mozilla: Security Vulnerabilities fixed in Firefox 160 (MFSA 2026-125)",
      url: "https://www.mozilla.org/en-US/security/advisories/mfsa2026-125/",
    },
    {
      label: "Cyber Security News: Mozilla Patches 160 Firefox Vulnerabilities, Including Sandbox Escape",
      url: "https://cybersecuritynews.com/mozilla-patches-160-firefox-vulnerabilities/",
    },
  ],
  changelog: [
    "2026-11-17: first published version, based on MFSA 2026-125 and the Cyber Security News analysis.",
  ],
};
