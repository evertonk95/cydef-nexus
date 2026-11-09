import type { BlogPost } from "./posts";

/**
 * RatHat: Android banking trojan with AI-driven control (EN).
 * Content prepared from the Malwarebytes report disclosed in September
 * 2026 (Zimperium zLabs analysis) and from the publication reviewed by
 * Cyber Security News. Cover: public/assets/blog/rathat-android-banking-trojan-thumb.webp
 */
export const rathatAndroidTrojanPostEn: BlogPost = {
  slug: "rathat-trojan-bancario-android-controle-ia",
  title:
    "RatHat: Android banking trojan uses AI to steal credentials, codes and rebuild PINs",
  category: "Threat Intelligence",
  excerpt:
    "An Android banking trojan identified as RatHat combines social engineering, abuse of the accessibility service and misuse of the Android Debug Bridge to overlay screens of financial apps, intercept authentication codes and rebuild PINs and unlock patterns from touch coordinates.",
  date: "September 21, 2026",
  dateISO: "2026-09-21",
  readTime: "10 min read",
  image: "/assets/blog/rathat-android-banking-trojan-thumb.webp",
  author: "CyDef Team",
  tags: [
    "Android",
    "RatHat",
    "Banking trojan",
    "Mobile malware",
    "Accessibility Service",
    "Wireless Debugging",
    "ADB",
    "Social engineering",
    "Threat Intelligence",
    "Blue Team",
  ],
  toc: true,
  sections: [
    {
      blocks: [
        {
          type: "p",
          text: "An Android banking trojan identified as **RatHat** was analyzed in September 2026 by **Zimperium zLabs**, with disclosure by **Malwarebytes**. The malware does not rely on a software flaw to enter the device: the campaign begins with social engineering and ends with system-level remote control, reached through the misuse of legitimate Android features.",
        },
        {
          type: "p",
          text: "The chain abuses three pillars of the operating system itself: the **accessibility service**, **Wireless Debugging** and the **Android Debug Bridge** (ADB). With this combination, RatHat obtains a shell-level session, installs hidden native components and starts operating outside the limits of an ordinary application.",
        },
        {
          type: "p",
          text: "The differentiator highlighted in the analysis is the use of a **real-time AI assistant** to inspect the interface and decide where to tap or scroll. Instead of following only fixed instructions, the malware adapts navigation to what it finds on the screen, which tends to reduce the effectiveness of detection based only on signatures.",
        },
        {
          type: "callout",
          callout: {
            kind: "ponto",
            title: "CyDef Assessment",
            body: "The case is not interesting because of an isolated exotic technique, but because of the composition: an accessibility permission granted by mistake, wireless debugging enabled and ADB as a bridge for command execution. Each of these items is legitimate and useful when properly used. The risk appears when the three coexist, and that is where policy controls on corporate devices and education about application installation become worth more than antivirus signatures.",
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
          text: "What is known as of September 21, 2026, based on the Malwarebytes report, the Zimperium zLabs analysis and the publication consulted:",
        },
        {
          type: "list",
          items: [
            "**Family:** RatHat, an Android banking trojan with AI-driven control.",
            "**Reported detection:** Android/Trojan.Exploit.RatHat, according to Malwarebytes.",
            "**Initial vector:** phishing SMS (smishing) or malicious ads that lead to fake download pages, imitating well-known applications.",
            "**Prerequisite:** manual installation of the APK outside an official store (sideload) and granting of the accessibility service permission.",
            "**Escalation:** enabling Wireless Debugging, reading the six-digit pairing code and pairing through ADB up to a shell-level session.",
            "**Components:** native agent written in Go to execute system commands and reverse tunnel component to a server controlled by the attacker.",
            "**Fraud:** overlay of fake screens on financial applications, SMS interception and capture of touch coordinates to rebuild PINs and patterns.",
            "**Persistence:** the malicious application can be restored after conventional removal, through a hidden component.",
            "**Target:** users of Android devices and financial applications, with a focus on campaigns distributed through smishing.",
            "**Incident scope:** the activity is a large-scale financial crime campaign, not an attack directed at a specific organization.",
          ],
        },
      ],
    },
    {
      heading: "Activity profile",
      blocks: [
        {
          type: "table",
          table: {
            headers: ["Attribute", "Detail"],
            rows: [
              ["Name", "RatHat"],
              ["Type", "Android banking trojan"],
              [
                "Motivation",
                "Theft of banking credentials, authentication codes and unlock PINs",
              ],
              ["Distribution", "Smishing and malicious ads with fake download pages"],
              ["Disclosure", "Activity analyzed and disclosed in September 2026"],
              ["Analysis", "Zimperium zLabs, with disclosure by Malwarebytes"],
              ["Target", "Users of Android devices and financial applications"],
              [
                "Core technique",
                "Abuse of accessibility, Wireless Debugging, ADB and AI-driven decisions",
              ],
              [
                "Components",
                "Malicious APK, accessibility service, ADB, Go agent and reverse tunnel",
              ],
            ],
          },
        },
      ],
    },
    {
      heading: "How the attack chain works",
      blocks: [
        {
          type: "table",
          table: {
            headers: ["Stage", "Technique", "Detail"],
            rows: [
              [
                "1",
                "Social engineering",
                "Phishing SMS or malicious ad with a link to a fake download page",
              ],
              [
                "2",
                "Sideload",
                "Induction of the victim to install an APK outside an official store, often imitating a well-known application",
              ],
              [
                "3",
                "Abuse of accessibility",
                "Request for the accessibility service permission with a false justification, such as removing a supposed network restriction",
              ],
              [
                "4",
                "Wireless Debugging",
                "Activation of developer options and reading of the six-digit pairing code",
              ],
              [
                "5",
                "ADB",
                "Automatic pairing and obtainment of a shell-level session on the device",
              ],
              [
                "6",
                "Hidden components",
                "Deployment of a Go agent to execute commands and of a reverse tunnel component",
              ],
              [
                "7",
                "Banking fraud",
                "Overlay of fake screens, SMS interception and reconstruction of PIN or pattern",
              ],
            ],
          },
        },
        {
          type: "callout",
          callout: {
            kind: "aviso",
            title: "The first permission request is the decision point",
            body: "The strongest protection remains not granting the first permission. An entertainment, finance or browser application has no legitimate reason to request accessibility control, which allows reading the screen and acting on behalf of the user.",
          },
        },
      ],
    },
    {
      heading: "What AI changes in the operation and in detection",
      blocks: [
        {
          type: "p",
          text: "According to the analysis disclosed, RatHat can use a live AI assistant to inspect the interface and decide where to tap or scroll. This replaces rigid automation scripts, which usually fail when the application version changes or when a warning appears along the way.",
        },
        {
          type: "p",
          text: "For detection, the practical consequence is that behavior is no longer predictable in a fixed sequence of events. Rules that depend on an exact order of taps or on a single flow of screens lose accuracy. Context signals gain weight: which permissions were granted, whether wireless debugging was enabled, whether a native component is running and whether there are persistent connections out of the device.",
        },
      ],
    },
    {
      heading: "Wireless Debugging and ADB: why the abuse is so effective",
      blocks: [
        {
          type: "p",
          text: "Wireless Debugging is a legitimate feature for development, which allows pairing a device with a workstation without a cable. Pairing requires a six-digit code displayed on the device, precisely so that someone with physical access confirms the operation.",
        },
        {
          type: "p",
          text: "With the accessibility permission already granted, the malware can navigate the settings, enable the feature and read the code displayed on the screen. From the pairing onward, ADB offers a shell-level session, far beyond what an ordinary application could do. It is this bridge that allows installing the hidden components and sustaining the operation.",
        },
      ],
    },
    {
      heading: "Touch capture and PIN reconstruction",
      blocks: [
        {
          type: "p",
          text: "The most unusual feature described in the analysis is the capture of coordinates directly from the device input driver, recording where the finger touches the screen. RatHat compares these points with the layouts of numeric keypads and unlock patterns to rebuild the PIN or the pattern.",
        },
        {
          type: "p",
          text: "Because the method works with the position of the touch, and not with the reading of screen content, it bypasses protections designed to prevent screen capture in sensitive applications. Together with the overlay of fake screens and SMS interception, the result is a set of techniques that attacks precisely the layers financial applications usually trust.",
        },
      ],
    },
    {
      heading: "Persistence: removing the application may not be enough",
      blocks: [
        {
          type: "p",
          text: "According to the disclosure, RatHat can restore the malicious application after conventional removal, relying on a hidden component in the background. In practice, deleting a suspicious application may not end the compromise, which changes the response recommendation.",
        },
        {
          type: "callout",
          callout: {
            kind: "regra",
            title: "Consequence for the response playbook",
            body: "On a device with suspected compromise by this family, the indicated path is a factory reset before restoring data, and not only the uninstallation of the application. Password changes and access reviews should be done from another trusted device.",
          },
        },
      ],
    },
    {
      heading: "Indicators of compromise and signals of interest",
      blocks: [
        {
          type: "table",
          table: {
            headers: ["Type", "Value", "Description"],
            rows: [
              ["Family", "RatHat", "Android banking trojan with AI-driven control"],
              [
                "Detection",
                "Android/Trojan.Exploit.RatHat",
                "Identification reported by Malwarebytes",
              ],
              [
                "Application",
                "APK installed by sideload",
                "Malicious package distributed outside official stores",
              ],
              [
                "Service",
                "Accessibility Service",
                "Permission used to observe the screen and interact with applications",
              ],
              [
                "Feature",
                "Wireless Debugging",
                "Functionality abused to enable ADB pairing",
              ],
              [
                "Tool",
                "Android Debug Bridge",
                "Used to obtain a shell-level session",
              ],
              ["Component", "Native Go agent", "Used to execute system commands"],
              [
                "Component",
                "Reverse tunnel",
                "Persistent connection to a server controlled by the attacker",
              ],
            ],
          },
        },
        {
          type: "p",
          text: "Signals that deserve investigation on a corporate or personal device: accessibility permission granted to an application installed outside an official store, wireless debugging enabled without development use, an application that reappears after being uninstalled and persistent traffic to an unknown destination.",
        },
      ],
    },
    {
      heading: "Potential impact",
      blocks: [
        {
          type: "list",
          items: [
            "**Credentials:** theft of username and password from banking applications through the overlay of fake screens.",
            "**Authentication:** interception of SMS, one-time codes and multi-factor authentication codes sent by message.",
            "**Device unlock:** reconstruction of PINs and unlock patterns from touch coordinates.",
            "**Remote control:** execution of system commands and communication through a persistent tunnel with the attacker.",
            "**Persistence:** restoration of the malicious application after conventional removal.",
            "**Financial fraud:** unauthorized access to financial applications and movement in bank accounts.",
          ],
        },
      ],
    },
    {
      heading: "Mitigation",
      blocks: [
        {
          type: "list",
          items: [
            "Install applications only from Google Play or another trusted official store, never through a link, ad or download page.",
            "Remove Android applications installed through links, ads or unofficial sources.",
            "Reject accessibility service permission requests without a legitimate and clear accessibility purpose.",
            "Keep developer options and wireless debugging disabled when there is no real development need.",
            "Enable Advanced Protection Mode on compatible devices.",
            "Keep Android and mobile security applications updated.",
            "Change banking passwords from another trusted device, never from the suspicious device.",
            "Contact financial institutions to review accesses and transactions.",
          ],
        },
      ],
    },
    {
      heading: "In case of compromise",
      blocks: [
        {
          type: "list",
          items: [
            "Perform a factory reset of the device before restoring data, bringing back only what is essential and trusted.",
            "Do not reuse a device backup made after the infection, because it may contain the malicious component.",
            "Change the passwords of exposed accounts from another trusted device.",
            "Review bank accounts and recent transactions, with support from the financial institution.",
            "Seek professional support when the device is used to access corporate systems.",
          ],
        },
      ],
    },
    {
      heading: "What we still do not know / limits of this article",
      blocks: [
        {
          type: "p",
          text: "This article was prepared from the report disclosed by Malwarebytes, the Zimperium zLabs analysis and the publication consulted, with verification on September 21, 2026. There is no CyDef telemetry of its own about this campaign, no exploitation observed internally and no attribution of authorship made here.",
        },
        {
          type: "p",
          text: "As of the verification date, there is no consolidated public estimate of the number of victims, nor a complete public list of financial applications overlaid by the campaign. The indicators disclosed are mostly behavioral (permissions, abused features and components), and not fixed values such as hashes or domains, which limits detection by ready-made lists. This text will be updated when there is new verifiable information.",
        },
      ],
    },
    {
      heading: "Next steps",
      blocks: [
        {
          type: "list",
          items: [
            "Review the mobile device policy regarding accessibility permissions and the use of developer options.",
            "Check in MDM or management tooling which applications installed outside an official store remain active.",
            "Audit devices with wireless debugging enabled and remove the configuration where there is no development use.",
            "Add periodic review of sensitive permissions on the devices of employees who access financial systems.",
            "Reinforce guidance about application installation and about links received by SMS and ads.",
          ],
        },
      ],
    },
  ],
  sources: [
    {
      label:
        "Malwarebytes: New Android malware uses AI to steal bank logins and reconstruct your PIN",
      url: "https://www.malwarebytes.com/blog/news/2026/09/new-android-malware-uses-ai-to-steal-bank-logins-and-pins",
    },
    {
      label:
        "Cyber Security News: New Android Malware Uses AI to Steal Bank Logins and Reconstruct Your PIN",
      url: "https://cybersecuritynews.com/android-malware-uses-ai/",
    },
  ],
  changelog: [
    "2026-09-21: first version, based on the Malwarebytes report and the Zimperium zLabs analysis disclosed in September 2026.",
  ],
};
