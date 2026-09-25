import type { BlogPost } from "./posts";

/**
 * Click2Shell: WordPress theme installer flaw leading to remote code execution (EN).
 * English translation of the PT canonical article
 * (source: posts.click2shell-wordpress.ts, 2026-09-21).
 * Human review happens in the PR.
 * Cover: public/assets/blog/click2shell-wordpress-thumb.webp
 */
export const click2shellWordpressPostEn: BlogPost = {
  slug: "click2shell-wordpress-instalacao-tema-execucao-remota",
  title:
    "Click2Shell: WordPress flaw installs a theme via link and leads to remote code execution",
  category: "Threat Intelligence",
  excerpt:
    "An exploitation chain in the WordPress theme preview feature silently installs a theme from the official directory after an authenticated administrator opens a malicious link. Chained with insecure code from the installed theme, the flaw ends in remote code execution on the server. The fix arrived in version 7.1.1.",
  date: "September 21, 2026",
  dateISO: "2026-09-21",
  readTime: "9 min read",
  image: "/assets/blog/click2shell-wordpress-thumb.webp",
  author: "CyDef Team",
  tags: [
    "WordPress",
    "Click2Shell",
    "Remote Code Execution",
    "jQuery Selector Injection",
    "Theme Installer",
    "Customizer",
    "Vulnerability Management",
    "Hardening",
    "Blue Team",
    "SOC",
  ],
  toc: true,
  sections: [
    {
      blocks: [
        {
          type: "p",
          text: "WordPress released version **7.1.1** on September 17, 2026, fixing a flaw in the theme preview feature exploited in a chain named **Click2Shell**. The underlying problem was in the CMS core and allowed a theme chosen by the attacker to be installed silently from the official WordPress.org directory.",
        },
        {
          type: "p",
          text: "The isolated flaw does not deliver code execution: it is a **forced installation primitive**. What turns the case into server compromise is the chaining with a theme that carries insecure PHP code. In the scenario demonstrated by the researchers, the **Mobile Repair Zone 2.5.4** theme exposed an AJAX handler without nonce verification and without capability verification, which resulted in code execution with the permissions of the web server account.",
        },
        {
          type: "p",
          text: "The vector requires human interaction, but it does not require an account on the site: the attacker only needs an **authenticated administrator** to open a specially crafted link. The administrator's session provides the installation capability and the nonce, and WordPress's own trusted JavaScript performs the sensitive action on the attacker's behalf.",
        },
        {
          type: "callout",
          callout: {
            kind: "ponto",
            title: "CyDef Assessment",
            body: "High risk for any WordPress site with active administrative accounts and theme customization enabled, and even higher risk on shared hosting: execution in the web server account reaches database credentials and files from other contexts that coexist in the same environment. The combination of silent installation with the absence of any visual change is what makes the activity hard to notice without dedicated monitoring.",
          },
        },
        {
          type: "note",
          text: "Author: CyDef Team. Sources consulted and verified on September 21, 2026.",
        },
      ],
    },
    {
      heading: "Executive summary",
      blocks: [
        {
          type: "p",
          text: "What is known as of September 21, 2026, based on the analyzed publication, the pwn.ai technical report, and the WordPress fix release:",
        },
        {
          type: "list",
          items: [
            "**Identifier:** at the time of disclosure, WordPress had not yet published a definitive CVE for the core flaw; the chain is publicly referred to as Click2Shell.",
            "**Severity:** the isolated forced installation was rated high, with CVSS 3.1 of 7.1; the complete chain with remote code execution was considered critical.",
            "**Affected products:** WordPress Core earlier than 7.1.1 and supported security branches earlier than the corresponding fix, with backports as far back as 4.7.",
            "**Vector:** a specially crafted link, opened by an authenticated administrator, that triggers the installation and preview of an inactive theme from the official directory.",
            "**Human prerequisite:** yes. The attacker does not need an account on the site, but depends on an administrator's authenticated session.",
            "**Second stage:** a theme installed with insecure pre-activation code, which exposes an AJAX handler without a nonce and without a capability check.",
            "**Final impact:** remote code execution with the permissions of the web server account, access to wp-config.php and to database credentials, reading of WordPress and WooCommerce data, modification of files and content, creation of users, and theft of secrets available to the PHP process.",
            "**Fix:** update to WordPress 7.1.1 or to the fixed version of the supported branch in use. The selector fix landed in changeset 63664.",
            "**Exploitation in the wild:** the public disclosure presented no evidence of exploitation in real-world attacks.",
          ],
        },
      ],
    },
    {
      heading: "What the vulnerability is",
      blocks: [
        {
          type: "p",
          text: "The root of the problem is a **jQuery selector injection** in the theme installer route. The theme value sent in the URL is processed in two inconsistent ways: the WordPress.org themes API canonicalizes the input to a valid slug from the catalog, while the administrator's browser keeps the original punctuation and inserts it into a jQuery selector.",
        },
        {
          type: "p",
          text: "Specially crafted selector characters escape the intended attribute matching, traverse the returned theme card, and reach the real installation control, which WordPress then triggers programmatically. It is a validation breakdown: input that should identify a catalog item is instead interpreted as executable selector structure.",
        },
        {
          type: "p",
          text: "The fix in changeset 63664 restricts the match to a genuine interface card and applies jQuery's **escapeSelector()** to the slug derived from the URL before building the selector. As a result, injected quotes, combinators, and comment syntax are treated as literal slug characters, not as CSS structure.",
        },
        {
          type: "callout",
          callout: {
            kind: "regra",
            title: "Point of attention",
            body: "The installed theme stays inactive and the site's appearance does not change. There is no visible sign for the administrator, which explains why the second stage of the chain is decisive for the attacker and why detection has to come from telemetry, not from visual inspection.",
          },
        },
      ],
    },
    {
      heading: "How the Click2Shell chain works",
      blocks: [
        {
          type: "list",
          items: [
            "The attacker assembles a URL with a manipulated theme value capable of escaping the attribute matching inside the installer.",
            "The URL is delivered to an authenticated administrator, who opens it with an active session in the dashboard.",
            "WordPress.org canonicalizes the value as a catalog slug, and the administrator's browser inserts the original punctuation into the jQuery selector.",
            "The manipulated selector reaches the legitimate installation control, triggered programmatically by the dashboard's own JavaScript.",
            "A current theme from the official directory is installed and remains inactive, without changing the site's appearance.",
            "The administrator's session is used to open the theme preview in the Customizer, which loads the inactive theme's PHP.",
            "The insecure theme exposes an AJAX handler without nonce verification and without capability verification.",
            "The handler accepts plugin details and a package URL controlled by the attacker, downloads and unpacks the sent file, and loads its PHP entry point.",
            "The result is code execution with the permissions of the web server account.",
          ],
        },
        {
          type: "p",
          text: "It is worth noting the limitation of the first stage: the core flaw **does not allow installing an arbitrary theme file**. It installs a package from the trusted catalog and keeps the theme inactive. Compromise only happens when a theme with insecure pre-activation code exists in the environment to serve as a bridge between an inactive package and attacker-controlled PHP.",
        },
      ],
    },
    {
      heading: "The second stage: the theme that serves as a bridge",
      blocks: [
        {
          type: "p",
          text: "During the preview in the Customizer, WordPress loads the inactive theme's PHP to render the preview. That is the moment when the pre-activation code starts to run. In the demonstrated case, the **Mobile Repair Zone 2.5.4** theme registered an AJAX handler accessible to authenticated users and without the two checks that should exist: nonce verification and capability verification.",
        },
        {
          type: "p",
          text: "Without those checks, the handler accepted arbitrary plugin data and a package URL, downloaded the indicated file, unpacked it on the server, and loaded its entry point. Any theme or plugin with this same pattern produces the same effect when chained to the core flaw.",
        },
        {
          type: "callout",
          callout: {
            kind: "exemplo",
            title: "The pattern that matters for your inventory",
            body: "The second-stage problem is not specific to the theme used in the demonstration: it is the absence of nonce and capability verification in AJAX handlers that accept external packages. Beyond updating the core, it is worth scanning your theme and plugin inventory for this pattern, including inactive items.",
          },
        },
      ],
    },
    {
      heading: "Potential impact",
      blocks: [
        {
          type: "list",
          items: [
            "Code execution with the permissions of the web server account.",
            "Access to wp-config.php and to the application's database credentials.",
            "Reading of WordPress and WooCommerce data, including customer and order information, when present.",
            "Modification of files and published content, with the risk of defacement and content injection.",
            "Creation of users and changes to permissions inside the dashboard.",
            "Theft of secrets available to the PHP process, such as API keys and integration tokens.",
            "Heightened risk on shared hosting, where the compromised account can reach other contexts in the same environment.",
          ],
        },
      ],
    },
    {
      heading: "Detection: where to look",
      blocks: [
        {
          type: "list",
          items: [
            "Requests to **theme-install.php** that do not match a legitimate installation action logged by the team.",
            "Calls to **admin-ajax.php** associated with Customizer flows, especially from unusual origins or in windows outside the maintenance schedule.",
            "Recently installed themes that no one recognizes, including inactive themes.",
            "Unexpected PHP files in theme and uploads directories.",
            "Changes to files, content, and administrative accounts, with attention to users created outside the provisioning process.",
            "Patterns of administrative access from new origins, correlated in time with the requests above.",
          ],
        },
      ],
    },
    {
      heading: "Mitigation",
      blocks: [
        {
          type: "p",
          text: "The official fix is updating the core. After that, the actions below reduce the surface and help identify earlier compromise:",
        },
        {
          type: "list",
          items: [
            "Update WordPress to version **7.1.1 or later**.",
            "Apply the corresponding fixed version on supported security branches, including those that received backports as far back as 4.7.",
            "Verify whether automatic updates were actually applied in production environments.",
            "Review recently installed themes and plugins and remove those without a justified use.",
            "Inspect unexpected PHP files and changes to user accounts.",
            "Investigate suspicious requests to theme-install.php.",
            "Investigate suspicious calls to admin-ajax.php endpoints related to the Customizer.",
            "Check for unauthorized changes to files, content, and administrative users.",
            "Review the nonce and capability check pattern in the AJAX handlers of your own themes and plugins.",
          ],
        },
      ],
    },
    {
      heading: "When the update cannot be applied immediately",
      blocks: [
        {
          type: "list",
          items: [
            "Restrict access to administrative accounts, with multifactor authentication and the principle of least privilege.",
            "Monitor theme installation requests and administrative Customizer calls.",
            "Reduce the number of active administrators to a minimum and review privileged accounts that are not needed.",
            "Keep verified, restorable backups, with periodic restoration testing.",
          ],
        },
        {
          type: "p",
          text: "These measures reduce the exposure window, but they do not fix the flaw. Updating the core remains the action that removes the forced installation primitive.",
        },
      ],
    },
    {
      heading: "What we still do not know / limits of this article",
      blocks: [
        {
          type: "p",
          text: "This article was prepared from the analyzed publication, the researchers' technical report, and the WordPress fix release, with verification on September 21, 2026. There is no CyDef telemetry of our own on this case, no exploitation observed internally, and no attribution of authorship made here.",
        },
        {
          type: "p",
          text: "As of the verification date, there was no public evidence of exploitation in real-world attacks and no definitive CVE published for the core flaw. The fixed version numbers, the scope of the backports, and the list of themes or plugins that serve as a second stage should be confirmed in the official sources before any decision to change production. This text will be updated when new verifiable information becomes available.",
        },
      ],
    },
    {
      heading: "Next steps",
      blocks: [
        {
          type: "list",
          items: [
            "Inventory every WordPress site under your responsibility, including staging environments and forgotten sites.",
            "Confirm the core version on each one and prioritize those that allow administrative access from the internet.",
            "Plan the update window for version 7.1.1 or for the fixed version of the branch in use.",
            "Run log searches for theme-install.php and for Customizer calls via admin-ajax.php.",
            "Review the theme and plugin inventory for AJAX handlers without a nonce and without a capability check.",
          ],
        },
      ],
    },
  ],
  sources: [
    {
      label:
        "Cyber Security News: Click2Shell WordPress Flaw Lets Attackers Gain RCE With a Single Malicious Link",
      url: "https://cybersecuritynews.com/click2shell-wordpress-vulnerability/",
    },
    {
      label: "pwn.ai: technical analysis of the Click2Shell chain",
      url: "https://pwn.ai/blog/click2shell",
    },
    {
      label: "WordPress 7.1.1 security update (Cyber Security News)",
      url: "https://cybersecuritynews.com/wordpress-7-1-1-security-update/",
    },
    {
      label: "WordPress Core changeset 63664 (selector fix in the theme installer)",
      url: "https://core.trac.wordpress.org/changeset/63664",
    },
  ],
  changelog: [
    "2026-09-21: first version, based on the analyzed publication (2026-09-18), the pwn.ai technical report, and the WordPress 7.1.1 release (2026-09-17).",
  ],
};
