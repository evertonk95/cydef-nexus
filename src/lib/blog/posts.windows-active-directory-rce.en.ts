import type { BlogPost } from "./posts";

/**
 * Windows Active Directory: stack-based buffer overflow allows remote code
 * execution (CVE-2026-119948, EN). Content prepared from the MSRC security
 * update guide and the Cyber Security News publication, verified on
 * November 11, 2026. Cover: public/assets/blog/windows-active-directory-rce-thumb.webp
 */
export const windowsActiveDirectoryRcePostEn: BlogPost = {
  slug: "windows-active-directory-rce-cve-2026-119948",
  title:
    "Windows Active Directory: buffer overflow allows remote code execution by an authenticated attacker",
  category: "Threat Intelligence",
  excerpt:
    "Microsoft fixed a stack-based buffer overflow in Windows Active Directory (CVE-2026-119948) on November 10, 2026 that may allow an authenticated attacker to execute code over a network. Exploitation requires low privileges, no user interaction and has high attack complexity.",
  date: "November 11, 2026",
  dateISO: "2026-11-11",
  readTime: "8 min read",
  image: "/assets/blog/windows-active-directory-rce-thumb.webp",
  author: "CyDef Team",
  tags: [
    "Windows",
    "Active Directory",
    "CVE-2026-119948",
    "Buffer overflow",
    "Remote code execution",
    "Patch Tuesday",
    "Microsoft",
    "Threat Intelligence",
  ],
  toc: true,
  sections: [
    {
      blocks: [
        {
          type: "p",
          text: "On November 10, 2026, in its monthly update cycle (Patch Tuesday), Microsoft disclosed a vulnerability in **Windows Active Directory** that may allow an authenticated attacker to execute code over a network. The flaw received the identifier **CVE-2026-119948** and an **Important** rating, with a base score of **CVSS 3.1 7.5**.",
        },
        {
          type: "p",
          text: "The identified cause is a **stack-based buffer overflow**: a program writes more data to stack memory than the space allocated for it, which can overwrite adjacent data and, under specific conditions, alter the program's execution flow. Microsoft confirms that the result may include the ability to execute remote code.",
        },
        {
          type: "p",
          text: "The CVSS assessment indicates low privileges, no user interaction and high attack complexity. This means the flaw is not described as an unauthenticated attack that works against any network-reachable Windows system, and that specific conditions must exist for exploitation to succeed.",
        },
        {
          type: "callout",
          callout: {
            kind: "ponto",
            title: "CyDef Assessment",
            body: "What deserves attention here is not the severity label in isolation, but the combination of three factors: the flaw lives in Active Directory, a central component of authentication and authorization in corporate environments; exploitation requires only low privileges, which already places the attacker inside the network; and the high complexity means the real risk depends on configuration and context. The correct response is to treat this as an update priority on domain controllers and affected Windows systems, without assuming that network access and a valid credential guarantee exploitation.",
          },
        },
        {
          type: "note",
          text: "Author: CyDef Team. MSRC security update guide and Cyber Security News publication verified on November 11, 2026.",
        },
      ],
    },
    {
      heading: "Executive summary",
      blocks: [
        {
          type: "p",
          text: "What is known as of November 11, 2026, based on the Microsoft Security Response Center (MSRC) update guide and the publication reviewed:",
        },
        {
          type: "list",
          items: [
            "**CVE:** CVE-2026-119948, in Windows Active Directory.",
            "**Flaw type:** stack-based buffer overflow.",
            "**Rating:** Important, with a base score of CVSS 3.1 7.5.",
            "**Prerequisites:** low privileges, no user interaction and high attack complexity.",
            "**Possible result:** remote code execution by an authenticated attacker, over a network.",
            "**Impact:** high potential impact on confidentiality, integrity and availability.",
            "**Disclosure:** November 10, 2026, in the November Patch Tuesday.",
            "**Known exploitation:** none, and no prior public disclosure at the time of publication.",
            "**Reported by:** anonymous researcher.",
            "**Microsoft assessment:** exploitation assessed as less likely and exploit code maturity as unproven.",
          ],
        },
      ],
    },
    {
      heading: "Affected products and versions",
      blocks: [
        {
          type: "p",
          text: "Coverage varies by version and by architecture. The products and installations listed in the update guide:",
        },
        {
          type: "table",
          table: {
            headers: ["Product", "Installation / architecture"],
            rows: [
              ["Windows Server 2025", "Standard and Server Core"],
              ["Windows Server 2022", "Standard and Server Core"],
              ["Windows Server 2019", "Standard and Server Core"],
              ["Windows Server 2016", "Standard and Server Core"],
              ["Windows 11, version 26H2", "x64 and ARM64"],
              ["Windows 11, version 26H1", "x64 and ARM64"],
              ["Windows 11, version 25H2", "x64 and ARM64"],
              ["Windows 11, version 24H2", "x64 and ARM64"],
              ["Windows 11, version 23H2", "x64 and ARM64"],
              ["Windows 10, version 22H2", "32-bit, x64 and ARM64"],
              ["Windows 10, version 21H2", "32-bit, x64 and ARM64"],
              ["Windows 10, version 1809", "32-bit and x64"],
              ["Windows 10, version 1607", "32-bit and x64"],
            ],
          },
        },
        {
          type: "p",
          text: "The list covers desktop and server systems, including Server Core installations, which concentrate the domain controller role in many organizations. This breadth is what makes the update an inventory effort before it is a click.",
        },
      ],
    },
    {
      heading: "Official updates and patched builds",
      blocks: [
        {
          type: "p",
          text: "Microsoft released the package corresponding to each product and version. Applying the correct KB, at the patched build, is what closes the exposure.",
        },
        {
          type: "table",
          table: {
            headers: ["Product / version", "KB", "Patched build(s)"],
            rows: [
              ["Windows Server 2025", "KB5131080 / KB5131077", "10.0.26100.33822 / 10.0.26100.33730"],
              ["Windows Server 2022", "KB5131090", "10.0.20348.5870"],
              ["Windows Server 2019", "KB5131085", "10.0.17763.9487"],
              ["Windows Server 2016", "KB5131291", "10.0.14393.9688"],
              ["Windows 11, version 26H2", "KB5132061 / KB5132043", "10.0.26300.9974 / 10.0.26300.9911"],
              ["Windows 11, version 26H1", "KB5132059", "10.0.28000.3501"],
              ["Windows 11, version 25H2", "KB5132061 / KB5132043", "10.0.26200.9974 / 10.0.26200.9911"],
              ["Windows 11, version 24H2", "KB5132061 / KB5132043", "10.0.26100.9974 / 10.0.26100.9911"],
              ["Windows 11, version 23H2", "KB5131087", "10.0.22631.7711"],
              ["Windows 10, version 22H2", "KB5131096", "10.0.19045.7846"],
              ["Windows 10, version 21H2", "KB5131096", "10.0.19044.7846"],
              ["Windows 10, version 1809", "KB5131085", "10.0.17763.9487"],
              ["Windows 10, version 1607", "KB5131291", "10.0.14393.9688"],
            ],
          },
        },
        {
          type: "p",
          text: "One operational point matters: each system needs the package for its own version and architecture. There is no single package that covers all releases, so applying one generic update across all systems does not replace per-release verification.",
        },
      ],
    },
    {
      heading: "What exploitation requires and what is not established",
      blocks: [
        {
          type: "p",
          text: "The CVE record precisely delimits what can be asserted and what remains open. It is worth separating the two.",
        },
        {
          type: "list",
          items: [
            "**Not an unauthenticated attack:** exploitation requires low privileges, which presupposes an attacker already authenticated in the environment.",
            "**Does not guarantee SYSTEM or domain control:** the record does not establish that exploitation grants SYSTEM privileges or control of an entire domain.",
            "**Request method not disclosed:** the affected function, the exact network request and a working attack method were not detailed in the advisory.",
            "**High complexity:** specific conditions, such as particular protocol settings or configurations, must exist for exploitation to occur.",
            "**No specific target organization:** the publication does not identify a type of organization as especially affected.",
          ],
        },
        {
          type: "p",
          text: "This delimitation matters because it avoids two opposite mistakes: minimizing the flaw because there is no known exploitation, while at the same time treating it as equivalent to an unauthenticated access flaw or a privilege escalation to SYSTEM.",
        },
      ],
    },
    {
      heading: "Mitigation recommendations",
      blocks: [
        {
          type: "list",
          items: [
            "**Inventory** the Windows systems on affected versions, including Server Core installations and domain controllers.",
            "**Apply** the official update corresponding to each version and architecture.",
            "**Confirm** installation and verify that each system reached the patched build, not only the panel's success message.",
            "**Restrict** network access to affected systems to necessary connections while the update cannot be applied.",
            "**Monitor** security logs for suspicious activity related to affected systems.",
            "**Review** protocol and network configurations of affected systems.",
            "**Maintain** an up-to-date inventory of versions, architectures and installed updates.",
          ],
        },
        {
          type: "callout",
          callout: {
            kind: "regra",
            title: "Immediate update or network containment",
            body: "When the update cannot be applied immediately, the control becomes network containment: restrict access to vulnerable systems allowing only necessary connections, and follow official Microsoft communications while monitoring the affected systems.",
          },
        },
      ],
    },
    {
      heading: "What we still do not know / limits of this article",
      blocks: [
        {
          type: "p",
          text: "This article was prepared from the MSRC update guide and the Cyber Security News publication, with verification on November 11, 2026. There is no CyDef telemetry of its own about this vulnerability and no exploitation observed internally.",
        },
        {
          type: "p",
          text: "The affected function, the exact network request and a working attack method remain open, as Microsoft did not detail them in the advisory. Since Microsoft assessed exploitation as less likely and exploit code maturity as unproven, the picture may change if a public proof of concept appears. This text will be updated when there is new verifiable information.",
        },
      ],
    },
    {
      heading: "Next steps",
      blocks: [
        {
          type: "list",
          items: [
            "Enumerate the affected Windows systems in the environment, with version, architecture and role (server, Server Core, domain controller).",
            "Plan the application of the November 2026 updates by the KBs listed above, prioritizing domain controllers and exposed systems.",
            "Confirm, after application, that each system reached the patched build.",
            "While the update is not applied, restrict network access to the necessary minimum.",
          ],
        },
      ],
    },
  ],
  sources: [
    {
      label:
        "Microsoft Security Response Center: CVE-2026-119948",
      url: "https://msrc.microsoft.com/update-guide/vulnerability/CVE-2026-119948",
    },
    {
      label:
        "Cyber Security News: Windows Active Directory RCE Vulnerability Allows Attacker to Execute Code Over a Network",
      url: "https://cybersecuritynews.com/windows-active-directory-rce-vulnerability/",
    },
    {
      label: "CVE Program: CVE-2026-119948",
      url: "https://www.cve.org/CVERecord?id=CVE-2026-119948",
    },
  ],
  changelog: [
    "2026-11-11: first version, based on the MSRC update guide and the Cyber Security News publication, verified on this date.",
  ],
};
