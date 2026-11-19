import type { BlogPost } from "./posts";

/**
 * WordPress 7.1.5 fixes 20 security flaws (EN).
 * Source: official WordPress.org announcement (18 November 2026) and Cyber Security News analysis.
 * Cover: public/assets/blog/wordpress-7-1-5-correcoes-seguranca-capa.webp
 */
export const wordpress715CorrecoesSegurancaPostEn: BlogPost = {
  slug: "wordpress-7-1-5-correcoes-seguranca",
  title:
    "WordPress 7.1.5 fixes 20 flaws, including privilege escalation and potential code execution",
  category: "Threat Intelligence",
  excerpt:
    "WordPress released version 7.1.5 with fixes for 20 core security issues, including an unauthenticated privilege escalation through Template Part block attributes that can lead to remote code execution, two SQL injections and a Multisite flaw that lets a site administrator take over the Super Admin account.",
  date: "November 19, 2026",
  dateISO: "2026-11-19",
  readTime: "8 min",
  image: "/assets/blog/wordpress-7-1-5-correcoes-seguranca-capa.webp",
  author: "CyDef Team",
  tags: [
    "WordPress",
    "Vulnerabilities",
    "Code Execution",
    "SQL Injection",
    "Privilege Escalation",
    "Security Update",
    "Threat Intelligence",
  ],
  toc: true,
  sections: [
    {
      blocks: [
        {
          type: "p",
          text: "On November 18, 2026, WordPress released version 7.1.5 with fixes for 20 security issues in the platform core. The package includes a flaw that allows an attacker without an account to gain improper permissions through Template Part block attributes and that, according to the official announcement, can lead to remote code execution.",
        },
        {
          type: "p",
          text: "The same release fixes two SQL injections, eight XSS flaws, four cases of information disclosure, a denial of service through XML-RPC, an authorization bypass in comment editing and a privilege escalation on Multisite installations. WordPress classifies the update as an immediate priority and does not report active exploitation of the flaws.",
        },
        {
          type: "callout",
          callout: {
            kind: "ponto",
            title: "CyDef assessment",
            body: "WordPress concentrates two risks at once: it is the most used CMS in the world and it runs on top of third-party plugins and themes that rarely follow the same update pace as the core. An unauthenticated privilege escalation in the core is worth more than ten flaws that require an account, because it turns any outdated site into an immediate target. The work here does not end with updating one site: it ends with proving the version on every installation in the inventory, including the forgotten ones on shared hosting.",
          },
        },
        {
          type: "note",
          text: "Author: CyDef Team. Official WordPress.org announcement and Cyber Security News report consulted on November 19, 2026.",
        },
      ],
    },
    {
      heading: "Executive summary",
      blocks: [
        {
          type: "p",
          text: "What is known about the update, based on the two sources consulted:",
        },
        {
          type: "list",
          items: [
            "**Product and patched version:** WordPress 7.1.5, with maintenance releases for earlier branches.",
            "**Patched branches:** 7.0.9, 6.9.12 and 4.7.40, in addition to 7.1.5. WordPress 4.6 and earlier no longer receive security updates.",
            "**Volume of fixes:** 20 core security issues.",
            "**Publication date:** November 18, 2026.",
            "**Most severe flaw:** unauthenticated privilege escalation through Template Part block attributes, with possible remote code execution.",
            "**Active exploitation:** the announcement does not report ongoing attacks.",
            "**Next release:** 7.2 is planned for December 8 and Release Candidate 2 already contains the fixes.",
          ],
        },
        {
          type: "table",
          table: {
            headers: ["Item", "Status"],
            rows: [
              ["Main patched version", "7.1.5"],
              ["Branches with a fix", "7.0.9, 6.9.12 and 4.7.40"],
              ["Total core flaws", "20"],
              ["Unauthenticated flaws", "4 (privilege, XSS, disclosure and DoS)"],
              ["Confirmed active exploitation", "Not reported"],
              ["Next stable release", "7.2, planned for December 8"],
            ],
          },
        },
      ],
    },
    {
      heading: "The highest impact flaws",
      blocks: [
        {
          type: "p",
          text: "The official announcement lists the 20 fixes with the credit for whoever reported each one, but does not detail the exploitation path. The six below are the ones that change the exposure level of an installation:",
        },
        {
          type: "table",
          table: {
            headers: ["Flaw", "Component", "Impact", "Credit"],
            rows: [
              ["Unauthenticated privilege escalation", "Template Part block attributes", "Possible remote code execution", "Logan Homolka"],
              ["SQL injection", "WP_Meta_Query with nested relation values", "Manipulation of database queries", "Christiaan Swiers"],
              ["SQL injection", "Customizer changeset previews", "Manipulation of database queries", "Rudy Faile"],
              ["Privilege escalation", "Customizer menu previews on Multisite", "Site administrator takes over the Super Admin account", "Yuval Miller"],
              ["Unauthenticated information disclosure", "REST API search endpoint", "Disclosure of private taxonomy terms", "Anthropic"],
              ["Unauthenticated denial of service", "Batched XML-RPC pingbacks", "Site unavailability", "Giovanni Cintolo"],
            ],
          },
        },
        {
          type: "p",
          text: "The Template Part block flaw carries the most weight. The block is used for shared layout elements such as headers and footers, and improper validation of its attributes allows someone without an account to gain improper permissions. The announcement does not state which site configurations allow reaching code execution, which limits defensive planning to treating every outdated installation as potentially exploitable.",
        },
        {
          type: "p",
          text: "The two SQL injections affect different paths: metadata queries with nested relations and the Customizer changeset preview, in the front page setting. The Multisite flaw deserves separate attention because its reach is not one site, it is the entire network: a site administrator can take over the Super Admin account.",
        },
      ],
    },
    {
      heading: "The rest of the package",
      blocks: [
        {
          type: "p",
          text: "The other 14 fixes are spread across XSS, information disclosure, authorization bypass and two preventive changes:",
        },
        {
          type: "list",
          items: [
            "**Reflected XSS in the legacy media library**, reported by Anthropic.",
            "**XSS in wp_interactivity_data_wp_context()** through the store namespace, reported by Juliette Reinders Folmer.",
            "**Unauthenticated stored XSS** through shortcode attributes in comments, reported by Rafie Muhammad, from Awesome Motive.",
            "**XSS for Contributor or higher** through scripts in oEmbed provider responses, reported by vvh1te3zz.",
            "**Stored XSS for administrators** in Customizer previews, reported by Weston Ruter.",
            "**Stored XSS in the Comment Date block** through its date format, reported by Weston Ruter and Jeremy Felt.",
            "**XSS in the block editor** through Openverse image metadata and through media filenames when converting a media block into a File block, reported by Shu Takahashi and CryptoFox.",
            "**Information disclosure and authorization:** user emails through the comments REST API (Author+), author assignment in posts and templates (Editor+), wp.getComments through XML-RPC (Subscriber+) and authorization bypass in comment editing in the admin (Author+).",
            "**Preventive changes:** hardening of regular expression validation for JSON media types and removal of the Imgur embed variation in the block editor, whose provider no longer existed.",
          ],
        },
        {
          type: "p",
          text: "None of these items has the isolated impact of the Template Part block flaw, but the set matters for those running sites with many authors. Stored XSS in comments and in Customizer previews is the kind of flaw that shows up chained with social engineering, and the disclosure of user emails feeds targeted phishing campaigns.",
        },
      ],
    },
    {
      heading: "Affected products and patched versions",
      blocks: [
        {
          type: "p",
          text: "The fix is available in the main version and in earlier branches, for those who cannot migrate immediately:",
        },
        {
          type: "table",
          table: {
            headers: ["Branch", "Patched version"],
            rows: [
              ["7.1", "7.1.5 or later"],
              ["7.0", "7.0.9 or later"],
              ["6.9", "6.9.12 or later"],
              ["4.7", "4.7.40 or later"],
              ["4.6 and earlier", "No security update"],
              ["7.2", "Release Candidate 2 already contains the fixes"],
            ],
          },
        },
        {
          type: "p",
          text: "WordPress stresses that only the latest version has active support. The maintenance releases close the flaws from this round, but they do not replace migration. Version 7.1.5 is a short-cycle release: the next major version, 7.2, is planned for December 8.",
        },
      ],
    },
    {
      heading: "Why the Template Part block flaw matters",
      blocks: [
        {
          type: "p",
          text: "The Template Part block is the piece that allows reusing headers, footers and other areas across templates. Because those attributes are processed on the server to build the page, improper validation turns a configuration field into an execution path.",
        },
        {
          type: "p",
          text: "The critical point is not requiring authentication. Flaws that demand an author or editor account greatly reduce the universe of attackers; an anonymous flaw does not. On sites with open comments and an exposed REST API, which is the WordPress default, the surface is reachable by anyone who finds the installation.",
        },
        {
          type: "callout",
          callout: {
            kind: "aviso",
            title: "Possible impact, not confirmed",
            body: "The announcement does not report active exploitation and does not state which configurations allow reaching code execution. The scenario described here is the potential impact of an unauthenticated privilege escalation in the core, not an observed incident. Treat it as risk to be reduced by the update, not as proven compromise.",
          },
        },
        {
          type: "list",
          title: "What an improper administrator account would allow, in theory",
          items: [
            "Install and modify plugins and themes, including custom code.",
            "Create or promote other accounts and persist access after the fix.",
            "Read and export site content, users and settings.",
            "On Multisite, reach the entire network when the account obtained is Super Admin.",
          ],
        },
      ],
    },
    {
      heading: "Mitigation recommendations",
      blocks: [
        {
          type: "p",
          text: "The official fix exists and the update is simple. What fails in practice is proving that it reached every site:",
        },
        {
          type: "list",
          items: [
            "**Update to WordPress 7.1.5** from the dashboard, under Updates, or download the version from WordPress.org.",
            "**Confirm the installed version** after the update, in the dashboard footer or under Tools and Site Health Info.",
            "**Apply the patched version for the branch** when migrating to 7.1.5 is not possible: 7.0.9, 6.9.12 or 4.7.40.",
            "**Review Multisite installations** and check the accounts with Super Admin, looking for access that should not exist.",
            "**Check sites with automatic background updates**, because the process does not always complete and the dashboard keeps showing the old version.",
            "**Keep an inventory of the WordPress versions in use**, including forgotten sites on shared hosting and test environments.",
            "**Confirm with the hosting provider** the availability of the security releases when the update is managed by them.",
            "**Prioritize migration to the latest version**, which is the only one with active support, instead of treating old branches as a destination.",
          ],
        },
        {
          type: "p",
          text: "For those who administer several sites, the question that closes the loop is always the same: which version is running right now, on each installation, and how many remain on branches that already received a fix but did not apply it?",
        },
      ],
    },
    {
      heading: "What is still unknown and the limits of this article",
      blocks: [
        {
          type: "p",
          text: "WordPress does not state that the flaws are being exploited in active attacks and does not publish technical detail for each fix. It also does not state which site configurations allow the privilege escalation to reach code execution, which prevents prioritization by installation type.",
        },
        {
          type: "p",
          text: "This article does not cover third-party plugins and themes, which follow their own patch cycle, and it does not replace reading the official announcement by those who need to assess specific exposure. CyDef will update the analysis if WordPress or researchers publish new data on exploitation.",
        },
      ],
    },
  ],
  sources: [
    {
      label: "WordPress.org: WordPress 7.1.5 Release (11/18/2026)",
      url: "https://wordpress.org/news/2026/11/wordpress-7-1-5-release/",
    },
    {
      label: "Cyber Security News: WordPress 7.1.5 Patches 20 Security Issues, Including Potential RCE and SQL Injection Flaws",
      url: "https://cybersecuritynews.com/wordpress-7-1-5-patches-20-security-issues/",
    },
  ],
  changelog: [
    "2026-11-19: first published version, based on the official WordPress.org announcement and the Cyber Security News analysis.",
  ],
};
