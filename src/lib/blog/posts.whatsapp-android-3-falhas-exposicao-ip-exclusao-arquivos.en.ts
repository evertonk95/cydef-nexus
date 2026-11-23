import type { BlogPost } from "./posts";

/**
 * WhatsApp fixes three Android flaws: file deletion, IP exposure and Private Processing (EN).
 * Source: WhatsApp November 2026 security advisory and Cyber Security News analysis.
 * Cover: public/assets/blog/whatsapp-android-3-falhas-exposicao-ip-exclusao-arquivos-capa.webp
 */
export const whatsappAndroid3FalhasPostEn: BlogPost = {
  slug: "whatsapp-android-3-falhas-exposicao-ip-exclusao-arquivos",
  title:
    "WhatsApp fixes three Android flaws, including IP exposure and local file deletion",
  category: "Threat Intelligence",
  excerpt:
    "WhatsApp's November 2026 security advisory describes three flaws: a SQL injection on Android that can delete files stored by the app after the recipient taps an order details message, a flaw that exposes the user's IP address when the app displays messages with external media links in replies tied to Click to WhatsApp ads, and an incomplete validation of servers used by Meta AI's Private Processing.",
  date: "November 23, 2026",
  dateISO: "2026-11-23",
  readTime: "7 min",
  image: "/assets/blog/whatsapp-android-3-falhas-exposicao-ip-exclusao-arquivos-capa.webp",
  author: "CyDef Team",
  tags: [
    "WhatsApp",
    "Vulnerabilities",
    "SQL Injection",
    "Information Exposure",
    "Security Update",
    "Threat Intelligence",
  ],
  toc: true,
  sections: [
    {
      blocks: [
        {
          type: "p",
          text: "WhatsApp's November 2026 security advisory describes three flaws fixed in the app. One allows the deletion of files stored locally by WhatsApp on Android after the recipient taps an order details message. Another exposes the user's IP address when the app displays a message with an external media link tied to replies from Click to WhatsApp ads. The third lets someone positioned inside Meta's infrastructure bypass a security check in Private Processing, the private processing service behind Meta AI.",
        },
        {
          type: "p",
          text: "The flaws are tracked as CVE-2026-102769, CVE-2026-23871 and CVE-2026-44908. WhatsApp said it had seen no evidence of exploitation of the file deletion flaw. IP exposure is listed as possibly abused alongside spam messages, with no number of affected users disclosed.",
        },
        {
          type: "callout",
          callout: {
            kind: "ponto",
            title: "CyDef assessment",
            body: "Two of the three flaws live in the app most organizations treat as an informal communication tool, outside the inventory of critical systems. The fix arrives through the app store, not the operating system, and depends on the user updating. WhatsApp Business is a separate app with its own versions, and it usually lags on corporate phones precisely because it was installed once and forgotten.",
          },
        },
        {
          type: "note",
          text: "Author: CyDef Team. WhatsApp security advisory and Cyber Security News report consulted on November 23, 2026.",
        },
      ],
    },
    {
      heading: "Executive summary",
      blocks: [
        {
          type: "p",
          text: "What is known about the three flaws, based on the sources consulted:",
        },
        {
          type: "list",
          items: [
            "**File deletion (CVE-2026-102769):** SQL injection in WhatsApp for Android before version 2.26.35.74. It requires the recipient to tap an order details message and only reaches files stored locally by the app, not files across the device.",
            "**IP exposure (CVE-2026-23871):** affects WhatsApp and WhatsApp Business for Android before version 2.26.17.4. The app did not fully check external media links in replies tied to Click to WhatsApp ads, and a device could reveal its own IP address when WhatsApp displayed the message in a chat.",
            "**Private Processing bypass (CVE-2026-44908):** a flaw in how WhatsApp verified the identity of servers used by Meta AI's Private Processing. It would require someone positioned inside Meta's infrastructure.",
            "**Active exploitation:** WhatsApp says it has no evidence of exploitation of the file deletion flaw. IP exposure was flagged as possibly abused alongside spam messages.",
            "**Fix available:** versions 2.26.35.74 and 2.26.17.4 on Android, 2.26.24.72 on iOS and 2.26.23.72 on Mac, with separate versions for WhatsApp Business.",
          ],
        },
        {
          type: "table",
          table: {
            headers: ["Item", "Status"],
            rows: [
              ["Flaws in the advisory", "3"],
              ["Flaws in WhatsApp for Android", "2 (file deletion and IP exposure)"],
              ["Server validation flaw", "1 (Meta AI Private Processing)"],
              ["User action required", "None for the IP flaw; a tap for the file flaw"],
              ["Active exploitation confirmed", "Not disclosed"],
              ["Possible abuse", "IP exposure alongside spam messages"],
            ],
          },
        },
      ],
    },
    {
      heading: "The three flaws in detail",
      blocks: [
        {
          type: "p",
          text: "The advisory does not publish the full technical path of each fix. The table below gathers what the sources state about exploitation requirements and reach:",
        },
        {
          type: "table",
          table: {
            headers: ["CVE", "Component", "Requirement to exploit", "Described impact", "Fixed version"],
            rows: [
              [
                "CVE-2026-102769",
                "WhatsApp for Android",
                "Recipient taps an order details message",
                "Deletion of files stored locally by WhatsApp",
                "2.26.35.74",
              ],
              [
                "CVE-2026-23871",
                "WhatsApp and WhatsApp Business for Android",
                "Message with an external media link displayed in the chat",
                "Exposure of the device IP address",
                "2.26.17.4",
              ],
              [
                "CVE-2026-44908",
                "Meta AI Private Processing",
                "Access to Meta infrastructure and a certificate in a third-party record",
                "Bypass of the trusted hardware check",
                "Platform-specific versions",
              ],
            ],
          },
        },
        {
          type: "p",
          text: "In the file deletion flaw, the advisory limits the damage to files stored locally by WhatsApp, not files across the device. The same flaw could reveal one bit of information about the recipient's chat database if they were online when the message arrived. That is a limited leak, not evidence that an attacker could read entire conversations.",
        },
        {
          type: "p",
          text: "The IP exposure flaw has a different requirement: the advisory does not describe a tap as necessary, only the display of the message in the chat. An IP address is network information, not the contents of a conversation. Even so, it allows locating the connection's origin and combining it with other campaign data.",
        },
        {
          type: "p",
          text: "The third flaw is the most restricted in reach. The problem was in verifying the identity of servers used by Private Processing, which confirms whether a server runs on trusted hardware. Exploiting it would first require the certificate to appear in a third-party record. According to WhatsApp, all published certificates traced back to trusted hardware, which supports the conclusion that the flaw was not exploited.",
        },
      ],
    },
    {
      heading: "IP exposure and spam: the vector closest to real use",
      blocks: [
        {
          type: "p",
          text: "Of the three, the IP flaw is the only one the advisory links to possible abuse. The described scenario involves spam messages that use replies tied to Click to WhatsApp ads to carry external media links. The app did not fully check those links and, when displaying the message, could reveal the device IP address.",
        },
        {
          type: "p",
          text: "For teams running customer service channels, this matters for a specific reason: Click to WhatsApp ads are a legitimate and encouraged path for customer contact. The flaw was not in the ad, but in the validation of the media link inside the conversation. An attacker who controls the displayed content can collect the IP address of anyone who simply opens the chat, without the victim clicking anything.",
        },
        {
          type: "callout",
          callout: {
            kind: "aviso",
            title: "What an IP address does and does not enable",
            body: "IP exposure does not reveal conversation contents or grant account access. It delivers network information that can be used for approximate geolocation, correlation with other events and preparation of targeted attacks. The offensive value lies in the combination, not in the isolated data point.",
          },
        },
        {
          type: "p",
          text: "The advisory does not state how many users may have been affected or detail the spam campaigns observed. There is also no confirmation that the abuse reached specific organizations.",
        },
      ],
    },
    {
      heading: "The Private Processing flaw in Meta AI",
      blocks: [
        {
          type: "p",
          text: "Private Processing is the service that handles Meta AI requests while preserving message content. Part of the guarantee depends on proving that the server running the processing uses trusted hardware, attested by certificate.",
        },
        {
          type: "p",
          text: "The flaw was in that server identity check. Someone positioned inside Meta's infrastructure could bypass the check and impersonate a legitimate server. The privileged position requirement narrows the attacker pool considerably: this is not a flaw a user exploits through the app.",
        },
        {
          type: "p",
          text: "The case still matters as a signal. Processing services that promise privacy depend on a hardware trust chain and a certificate record. When one link in that chain accepts a certificate without full verification, the privacy promise starts to depend on third-party integrity. WhatsApp states that all published certificates traced back to trusted hardware, which closes the case without evidence of exploitation.",
        },
      ],
    },
    {
      heading: "Affected products and fixed versions",
      blocks: [
        {
          type: "p",
          text: "Fixes arrived in platform-specific versions. Anyone running more than one app needs to check each one separately:",
        },
        {
          type: "table",
          table: {
            headers: ["Product", "Platform", "Fixed version"],
            rows: [
              ["WhatsApp", "Android", "2.26.35.74 (CVE-2026-102769) and 2.26.17.4 (CVE-2026-23871)"],
              ["WhatsApp", "iOS", "2.26.24.72"],
              ["WhatsApp", "Android (Private Processing)", "2.26.23.74"],
              ["WhatsApp", "Mac", "2.26.23.72"],
              ["WhatsApp Business", "iOS", "2.26.23.72"],
              ["WhatsApp Business", "Android", "2.26.23.70"],
            ],
          },
        },
        {
          type: "p",
          text: "The official guidance is to install the latest available version from the device's official app store and to check WhatsApp Business separately when both apps are installed. WhatsApp's advisory also notes that app store release notes may not list every security fix, which means the absence of a CVE mention does not prove the app is up to date on security.",
        },
        {
          type: "callout",
          callout: {
            kind: "ponto",
            title: "Why the store version is not evidence",
            body: "Background automatic updates can fail due to storage, battery or device policy, and the app stays on the previous version without a clear warning. In a corporate inventory, the data that counts is the version reported by the device, not the version available in the store.",
          },
        },
      ],
    },
    {
      heading: "Mitigation recommendations",
      blocks: [
        {
          type: "p",
          text: "The fix is official and the update is simple. The real work is proving it reached every device, including the ones nobody audits:",
        },
        {
          type: "list",
          items: [
            "**Update WhatsApp from the official app store**, then check the installed version in the app settings.",
            "**Check WhatsApp Business separately**, because it is a distinct app with its own release cycle and version.",
            "**Prioritize Android devices** running versions earlier than 2.26.35.74 and 2.26.17.4, which concentrate the two flaws with the highest exposure.",
            "**Add the messaging app to the software inventory** and to update routines instead of treating it as a personal tool.",
            "**Confirm the version on MDM-managed devices** when the update policy depends on the user, since the store can apply the update without central logging.",
            "**Instruct users to avoid tapping suspicious order details messages** while the update is not confirmed.",
            "**Be cautious with messages containing external media links** tied to Click to WhatsApp ads, especially on accounts used for customer service.",
            "**Follow WhatsApp's official security advisories**, because app store release notes do not list every fix.",
          ],
        },
        {
          type: "p",
          text: "For teams using WhatsApp as a service channel, it helps to separate two problems that are often treated as one: updating the app and deciding how much the corporate number should be exposed. The first is operational and is solved with inventory and verification. The second is architectural, and it starts by deciding what the channel can receive before it becomes a collection surface for network data.",
        },
      ],
    },
    {
      heading: "What is still unknown and the limits of this article",
      blocks: [
        {
          type: "p",
          text: "The advisory does not publish the technical detail of the three fixes, does not state how many users may have been affected by IP exposure and does not identify organizations or sectors as targets. There is also no information on the volume of messages used in the cited spam campaigns.",
        },
        {
          type: "p",
          text: "This article is limited to what the WhatsApp security advisory and the Cyber Security News report state. It does not cover future app versions and does not replace reading the official advisory when assessing specific exposure. CyDef will update the analysis if WhatsApp or researchers publish new exploitation data.",
        },
      ],
    },
  ],
  sources: [
    {
      label: "WhatsApp: Security Advisories",
      url: "https://www.whatsapp.com/security/advisories",
    },
    {
      label:
        "Cyber Security News: WhatsApp Android Flaws Could Let Hackers Delete Users' Files and Expose IP Addresses",
      url: "https://cybersecuritynews.com/whatsapp-android-flaws/",
    },
  ],
  changelog: [
    "2026-11-23: first published version, based on the WhatsApp security advisory and the Cyber Security News report.",
  ],
};
