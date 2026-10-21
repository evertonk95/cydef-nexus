import type { BlogPost } from "./posts";

/**
 * WP2Shell: chain combining CVE-2026-63030 and CVE-2026-60137 in WordPress Core (EN).
 * Content based on Seqrite's analysis and the Cyber Security News publication.
 * Cover: public/assets/blog/wp2shell-wordpress-thumb.webp
 */
export const wp2shellWordpressPostEn: BlogPost = {
  slug: "wp2shell-wordpress-admin-web-shell",
  title:
    "WP2Shell chains two WordPress flaws to create admin accounts and install web shells without login",
  category: "Threat Intelligence",
  excerpt:
    "The WP2Shell chain combines route confusion in the REST API batch endpoint (CVE-2026-63030) with an SQL injection in the author_exclude parameter (CVE-2026-60137) to reach code execution on WordPress installations without authentication.",
  date: "October 21, 2026",
  dateISO: "2026-10-21",
  readTime: "7 min read",
  image: "/assets/blog/wp2shell-wordpress-thumb.webp",
  author: "CyDef Team",
  tags: [
    "WordPress",
    "WP2Shell",
    "Vulnerabilities",
    "REST API",
    "SQL Injection",
    "Web Shell",
    "Threat Intelligence",
  ],
  toc: true,
  sections: [
    {
      blocks: [
        {
          type: "p",
          text: "On October 16, 2026, Seqrite documented an exploitation chain against WordPress Core named WP2Shell. It combines two flaws, CVE-2026-63030 and CVE-2026-60137, to move from an unauthenticated REST API request to server-side code execution, passing through the creation of an administrator account and the installation of a plugin that acts as a web shell.",
        },
        {
          type: "p",
          text: "The chaining is the core of the issue: neither flaw, on its own, delivers a web shell. The first one opens a path to functionality that should require authentication, and the second supplies the database weakness exploited along that path. The analysis does not establish widespread live exploitation, which changes how urgent the response is but does not remove the need for one.",
        },
        {
          type: "callout",
          callout: {
            kind: "ponto",
            title: "CyDef assessment",
            body: "WordPress underpins a large share of the sites published on the internet, and what makes WP2Shell relevant is not the severity of each individual CVE but the absence of a credential at the start of the chain. The practical question for site administrators is not only whether the version is up to date, but also whether there is evidence that the chain already ran: an unknown administrator account, a ZIP archive in uploads, a wp2shell_ directory in plugins. Updating without that check closes future exposure and leaves open the possibility of an access created before the patch.",
          },
        },
        {
          type: "note",
          text: "Author: CyDef Team. Seqrite analysis and Cyber Security News publication consulted on October 21, 2026.",
        },
      ],
    },
    {
      heading: "Executive summary",
      blocks: [
        {
          type: "p",
          text: "What is known about WP2Shell, based on Seqrite's technical analysis and the Cyber Security News publication:",
        },
        {
          type: "list",
          items: [
            "**Name:** WP2Shell, an exploitation chain against WordPress Core documented by Seqrite on October 16, 2026.",
            "**Chained flaws:** CVE-2026-63030, route confusion in the REST API batch controller, and CVE-2026-60137, SQL injection in the posts endpoint.",
            "**Entry point:** an unauthenticated request to the /wp-json/batch/v1 endpoint.",
            "**Demonstrated outcome:** creation of an administrator account, remote code execution, and installation of a plugin used as a web shell.",
            "**Versions vulnerable to the full chain:** WordPress 6.9.0 to 6.9.4 and 7.0.0 to 7.0.1.",
            "**Fixed versions:** 6.8.6, 6.9.5, and 7.0.2, or a later supported release.",
            "**Flaw disclosure:** July 2026, according to the analyzed publication.",
            "**Live exploitation:** the analysis does not establish widespread exploitation in real environments.",
          ],
        },
      ],
    },
    {
      heading: "How the chain works",
      blocks: [
        {
          type: "p",
          text: "The sequence described in the analysis follows five stages, from the public request to persistence on the server:",
        },
        {
          type: "table",
          table: {
            headers: ["Stage", "Technique", "Detail"],
            rows: [
              [
                "Initial access",
                "REST API request",
                "A request is sent to the /wp-json/batch/v1 endpoint, which processes several API calls in a single submission.",
              ],
              [
                "Route confusion",
                "CVE-2026-63030",
                "Nested requests confuse route handling and reach functionality that should require authentication. On its own, it does not execute code.",
              ],
              [
                "SQL injection",
                "CVE-2026-60137",
                "The public author_exclude parameter maps to author__not_in in WP_Query, and poorly handled input affects the database query.",
              ],
              [
                "Account creation",
                "Administrative access",
                "Seqrite's proof of concept establishes an administrator-level account and reaches remote code execution.",
              ],
              [
                "File staging",
                "ZIP write and extraction",
                "An archive is placed in wp-content/uploads/2026/10/ and extracted under wp-content/upgrade/.",
              ],
              [
                "Web shell installation",
                "Plugin directory",
                "A directory following the wp2shell_<hex> pattern is moved into wp-content/plugins/.",
              ],
            ],
          },
        },
        {
          type: "p",
          text: "Once code runs on the server, the attacker gains a path to change the site outside the WordPress dashboard. The analysis also notes that the httpd.exe process may perform file writes, which also happens during normal plugin operations: the process name alone is not proof of compromise.",
        },
      ],
    },
    {
      heading: "Affected and fixed versions",
      blocks: [
        {
          type: "p",
          text: "Exposure depends on the version and on which of the two flaws it carries. The table below reproduces what the analysis lists.",
        },
        {
          type: "table",
          table: {
            headers: ["WordPress version", "Status", "Flaws"],
            rows: [
              ["7.0.0 to 7.0.1", "Vulnerable to the full chain", "CVE-2026-63030 and CVE-2026-60137"],
              ["6.9.0 to 6.9.4", "Vulnerable to the full chain", "CVE-2026-63030 and CVE-2026-60137"],
              ["6.8.0 to 6.8.5", "Affected by the SQL injection", "CVE-2026-60137"],
              ["6.8.6", "Fixed", "Minimum fixed release in the 6.8 line"],
              ["6.9.5", "Fixed", "Minimum fixed release in the 6.9 line"],
              ["7.0.2", "Fixed", "Minimum fixed release in the 7.0 line"],
            ],
          },
        },
        {
          type: "p",
          text: "The analysis recommends upgrading to the corresponding fixed release, or to a later supported version, and confirming that the update completed. Confirming means checking the running version, not just the success message in the dashboard.",
        },
      ],
    },
    {
      heading: "Indicators of compromise",
      blocks: [
        {
          type: "p",
          text: "The indicators below describe artifacts and behaviors observed in the analysis. A single one does not settle a diagnosis, and the combination with the site's context is what supports the conclusion.",
        },
        {
          type: "table",
          table: {
            headers: ["Type", "Value", "Description"],
            rows: [
              ["Endpoint", "/wp-json/batch/v1", "REST API batch endpoint"],
              ["File pattern", "temp-write-test-*", "Temporary files under wp-content/"],
              ["ZIP archive", "wp2shell_4e9b3641.zip", "Sample in wp-content/uploads/2026/10/"],
              ["Directory pattern", "wp2shell_<hex>", "Directories seen under upgrade and plugins"],
              ["PHP file pattern", "wp2shell_<hex>.php", "Sample extracted filename"],
              ["PHP files", "New or changed in plugins or cache", "Compare with expected site activity"],
              ["Account", "Unexpected administrator", "Check the creation date"],
              ["Network detection", "HTTP/CVE-2026-63030!DP.50405", "Quick Heal network detection"],
              ["Network detection", "HTTP/CVE-2026-63030!SP.50370", "Quick Heal network detection"],
              [
                "Behavioral detection",
                "SL_A WP2Shell Suspicious PHP File Modification in WordPress Plugins",
                "Suspicious PHP modification in plugin directories",
              ],
            ],
          },
        },
      ],
    },
    {
      heading: "Detection and response",
      blocks: [
        {
          type: "list",
          title: "What to check in the environment",
          items: [
            "**Administrator accounts:** list administrators and review the creation date of every account that is not recognized.",
            "**Plugin directories:** look for directories and files following the wp2shell_<hex> pattern in wp-content/plugins.",
            "**Uploads and upgrade:** check wp-content/uploads, with attention to the current month's folder, and wp-content/upgrade.",
            "**Temporary files:** look for files following the temp-write-test-* pattern under wp-content.",
            "**PHP changes:** compare new or modified files in plugins and cache with the site's expected activity.",
            "**Access logs:** review requests to the /wp-json/batch/v1 endpoint and assess volume, origin, and request content.",
          ],
        },
        {
          type: "p",
          text: "Quick Heal's network detections and the behavioral detection for PHP modification in plugins complement manual inspection. They help find activity in progress, but they do not replace checking the artifacts already written to the server.",
        },
      ],
    },
    {
      heading: "Mitigation and recommended actions",
      blocks: [
        {
          type: "list",
          items: [
            "**Upgrade** affected installations to WordPress 6.8.6, 6.9.5, 7.0.2, or a later supported release.",
            "**Confirm** that the update completed and that the installation is running the fixed version.",
            "**Restrict**, where operationally feasible, unauthenticated access to sensitive REST API features.",
            "**Investigate** unknown administrator accounts and verify their creation dates.",
            "**Inspect** plugin, cache, uploads, and upgrade directories for suspicious PHP files or directories.",
            "**Review** logs for suspicious requests to the /wp-json/batch/v1 endpoint.",
            "**Compare** file changes on the site with expected activity and use the available detections.",
          ],
        },
        {
          type: "p",
          text: "Restricting access to REST API features reduces exposure where feasible, but it does not replace updating. And updating, on its own, does not remove an access created before it: a fixed version number is not proof that an earlier compromise was eliminated.",
        },
        {
          type: "list",
          title: "If compromise is confirmed",
          items: [
            "**Preserve** evidence before any cleanup, including relevant files, directories, and logs.",
            "**Disable** suspicious plugins.",
            "**Reset** affected credentials.",
            "**Investigate** possible persistence mechanisms that may remain on the server.",
          ],
        },
      ],
    },
    {
      heading: "What is still unknown and the limits of this article",
      blocks: [
        {
          type: "p",
          text: "The analysis consulted describes a proof of concept and the chain's expected artifacts, but it does not establish widespread live exploitation, does not attribute the activity to a specific group, and does not provide victim counts. The material received for this publication also does not detail the step-by-step exploitation of each CVE. What can be stated with confidence is the existence of both flaws, the chain as described, the affected versions, and the fixed versions.",
        },
        {
          type: "p",
          text: "The operational detail that is usually underestimated is post-update verification. Updating closes the door; inspecting accounts, plugins, and directories shows whether someone already came through it. Both actions belong to the same response and are not alternatives to each other.",
        },
        {
          type: "p",
          text: "CyDef will update its threat intelligence reporting if new data on live WP2Shell exploitation is disclosed.",
        },
      ],
    },
  ],
  sources: [
    {
      label:
        "Cyber Security News: WP2Shell Attack Lets Hackers Create WordPress Admin Accounts and Install Web Shells Without Login",
      url: "https://cybersecuritynews.com/wp2shell-attack/",
    },
    {
      label:
        "Seqrite: WP2Shell exploit chain, anatomy of a sophisticated WordPress attack",
      url: "https://www.seqrite.com/blog/wp2shell-exploit-chain-anatomy-of-a-sophisticated-wordpress-attack/",
    },
  ],
  changelog: [
    "2026-10-21: First published version, based on Seqrite's analysis and the Cyber Security News publication.",
  ],
};
