import type { BlogPost } from "./posts";

/**
 * Phishing campaign with blob URLs and Microsoft Teams - EN article (translation of the PT canonical).
 * Capa: public/assets/blog/phishing-blob-urls-microsoft-teams-thumb.webp
 */
export const phishingBlobPostEn: BlogPost = {
  slug: "phishing-blob-urls-microsoft-teams-navegador",
  title:
    "Phishing campaign builds fake login pages directly inside the victims' browser",
  category: "Threat Intelligence",
  excerpt:
    "A campaign analyzed by Barracuda abandons the hosted phishing page and assembles the malicious content inside the victim's browser, after a redirect chain that passes through Microsoft OAuth and Microsoft Teams.",
  date: "September 11, 2026",
  dateISO: "2026-09-11",
  readTime: "15 min read",
  image: "/assets/blog/phishing-blob-urls-microsoft-teams-thumb.webp",
  author: "CyDef Team",
  tags: [
    "Phishing",
    "Microsoft 365",
    "Microsoft Teams",
    "OAuth",
    "Blob URL",
    "Threat Intelligence",
    "Blue Team",
    "SOC",
    "Identity Security",
  ],
  toc: true,
  sections: [
    {
      blocks: [
        {
          type: "p",
          text: "A phishing campaign analyzed by Barracuda demonstrates an important evolution in social engineering techniques: instead of hosting the fake authentication page on a conventional website, the operators assemble the phishing content **inside the victim's own browser**, using **blob URLs**, **service workers**, **sandboxed iframes**, and a redirect chain that passes through legitimate Microsoft services.",
        },
        {
          type: "p",
          text: "The observed flow starts with an email themed around DocuSign and uses a calendar invite to reinforce the appearance of legitimacy. The victim is then directed through legitimate Microsoft OAuth infrastructure and Microsoft Teams before an external resource is loaded and converted by the browser into a blob URL.",
        },
        {
          type: "p",
          text: "The result is a fake page that may exist only during that browser session, reducing the usefulness of security mechanisms based exclusively on reputation or on prior inspection of the final URL.",
        },
        {
          type: "callout",
          callout: {
            kind: "ponto",
            title: "CyDef Assessment",
            body: "High risk for organizations that rely only on URL filters, domain reputation, and awareness based on visual verification of the initial address.",
          },
        },
        {
          type: "note",
          text: "Author: CyDef Team. Sources consulted and verified on September 11, 2026.",
        },
      ],
    },
    {
      heading: "Executive summary",
      blocks: [
        {
          type: "p",
          text: "The campaign stands out because it changes one of the most common premises of traditional phishing: the existence of a malicious page permanently hosted on a domain controlled by the attacker.",
        },
        {
          type: "p",
          text: "In the analyzed scenario, the chain uses:",
        },
        {
          type: "list",
          items: [
            "an email themed around DocuSign;",
            "a calendar invite as an element of legitimacy;",
            "a legitimate Microsoft OAuth endpoint;",
            "Microsoft Teams as part of the browsing chain;",
            "an external resource hosted on cdn.bloom[.]io;",
            "the creation of a **blob URL** by the browser;",
            "local rendering of the phishing page;",
            "**service worker** and **sandboxed iframe** to control parts of the flow;",
            "remote infrastructure to dynamically change the behavior of the campaign.",
          ],
        },
        {
          type: "p",
          text: "According to Barracuda, the campaign does not exploit a vulnerability in Microsoft Teams. What happens is the **abuse of legitimate services, browser features, and redirect mechanisms** to build a chain that is more convincing and less visible to traditional controls.",
        },
      ],
    },
    {
      heading: "What makes this campaign different?",
      blocks: [
        {
          type: "p",
          text: "In a conventional campaign, the attacker usually registers or compromises a domain, publishes a page similar to the legitimate service, and sends the link to the victim.",
        },
        {
          type: "p",
          text: "This model offers defenders several observation points:",
        },
        {
          type: "list",
          items: [
            "domain reputation;",
            "domain age;",
            "certificate;",
            "HTML content;",
            "hosting;",
            "automated screenshots;",
            "sandbox analysis;",
            "crawling mechanisms;",
            "inclusion of the URL in blocklists.",
          ],
        },
        {
          type: "p",
          text: "The campaign analyzed by Barracuda reduces part of that surface.",
        },
        {
          type: "p",
          text: "The final phishing content is created through a **blob URL**, that is, a temporary URL generated by the browser and associated with data stored locally in the session.",
        },
        {
          type: "p",
          text: "An address of this type may take a format similar to:",
        },
        { type: "code", text: "blob:https://exemplo/identificador" },
        {
          type: "p",
          text: "The important point is that this URL does not, by itself, represent a traditional page hosted on a web server that can be queried later by a security solution.",
        },
        {
          type: "p",
          text: "When the session ends, the content may cease to exist.",
        },
        {
          type: "p",
          text: "This creates a relevant problem for preventive analysis and incident response: **what the user saw may no longer be available when the SOC starts the investigation.**",
        },
      ],
    },
    {
      heading: "Observed attack chain",
      blocks: [
        {
          type: "p",
          text: "The sequence below reproduces the order described by the researchers, from the initial message to control of the browser session.",
        },
      ],
    },
    {
      heading: "1. Social engineering themed around DocuSign",
      blocks: [
        {
          type: "p",
          text: "The victim receives an email that simulates a request related to DocuSign.",
        },
        {
          type: "p",
          text: "This type of approach exploits a common context in corporate environments: documents that need to be reviewed, signed, or approved.",
        },
      ],
    },
    {
      heading: "2. Calendar invite as an element of trust",
      blocks: [
        {
          type: "p",
          text: "The message includes a calendar invite file.",
        },
        {
          type: "p",
          text: "The invite does not necessarily represent the main malicious payload. Its function is to make the communication more compatible with a legitimate business flow and to reduce the user's perception of risk.",
        },
      ],
    },
    {
      heading: "3. Redirect through legitimate Microsoft OAuth infrastructure",
      blocks: [
        {
          type: "p",
          text: "The initial navigation uses login.microsoftonline.com, legitimate Microsoft infrastructure.",
        },
        {
          type: "p",
          text: "This point is especially important for defensive analysis.",
        },
        {
          type: "p",
          text: "**The login.microsoftonline.com domain should not be treated in isolation as a malicious indicator or blocked.** Its relevance exists within the **context of the redirect chain**.",
        },
      ],
    },
    {
      heading: "4. Forwarding to Microsoft Teams",
      blocks: [
        {
          type: "p",
          text: "A crafted redirect parameter leads the victim to Microsoft Teams.",
        },
        {
          type: "p",
          text: "The presence of Microsoft services during navigation helps reduce signals that would normally raise suspicion in users and in certain automated analysis mechanisms.",
        },
      ],
    },
    {
      heading: "5. Loading of an external resource",
      blocks: [
        {
          type: "p",
          text: "During the flow observed by the researchers, Microsoft Teams loads an external resource hosted at:",
        },
        { type: "code", text: "cdn.bloom[.]io" },
        {
          type: "p",
          text: "This domain should be treated as an **artifact observed in the campaign**, and not as sufficient evidence, in isolation, to conclude compromise. Before applying any block in production, the organization should validate context, legitimate use, available threat intelligence, and possible operational impacts.",
        },
      ],
    },
    {
      heading: "6. Creation of the blob URL",
      blocks: [
        {
          type: "p",
          text: "The browser receives the content and creates a blob URL.",
        },
        {
          type: "p",
          text: "At this moment, the phishing stops depending on a traditionally hosted final page and starts being rendered locally.",
        },
      ],
    },
    {
      heading: "7. Rendering of the fake page",
      blocks: [
        {
          type: "p",
          text: "The phishing page is presented to the user within the browser session.",
        },
        {
          type: "p",
          text: "For the victim, the experience may resemble a common corporate authentication flow.",
        },
        {
          type: "p",
          text: "For certain security mechanisms, however, the final page may not exist as a conventional HTTP or HTTPS address that can be queried later.",
        },
      ],
    },
    {
      heading: "8. Session control",
      blocks: [
        {
          type: "p",
          text: "The campaign uses features such as:",
        },
        {
          type: "list",
          items: [
            "service workers;",
            "sandboxed iframes;",
            "browser communication mechanisms;",
            "backend infrastructure controlled by the operators.",
          ],
        },
        {
          type: "p",
          text: "These components allow the behavior of the page to be controlled and modified dynamically.",
        },
        {
          type: "p",
          text: "Barracuda also identified command and control configurations that indicate the flow is part of a manageable platform, rather than an isolated static page.",
        },
      ],
    },
    {
      heading: "Simplified chain diagram",
      blocks: [
        {
          type: "code",
          text: "E-mail com tema do DocuSign\n        |\n        v\nConvite de calendário\n        |\n        v\nMicrosoft OAuth\n(login.microsoftonline.com)\n        |\n        v\nMicrosoft Teams\n        |\n        v\nRecurso externo\n(cdn.bloom[.]io)\n        |\n        v\nConteúdo recebido pelo navegador\n        |\n        v\nCriação de blob URL\n        |\n        v\nPágina falsa renderizada localmente\n        |\n        +--> Service Worker\n        +--> Sandboxed iframe\n        +--> Backend do atacante\n        |\n        v\nPossível captura de credenciais\ne comprometimento de conta",
        },
      ],
    },
    {
      heading: "Why do blob URLs make detection harder?",
      blocks: [
        {
          type: "p",
          text: "Blob URLs are legitimate features of modern browsers. Web applications may use them to represent dynamically created objects, such as files, images, documents, and content generated during the execution of an application.",
        },
        {
          type: "p",
          text: "The problem is not in the technology itself, but in its abusive use.",
        },
      ],
    },
    {
      heading: "Absence of a conventional final page",
      blocks: [
        {
          type: "p",
          text: "A tool that tries to access the phishing URL later may not be able to reproduce the content viewed by the victim.",
        },
      ],
    },
    {
      heading: "Temporary nature",
      blocks: [
        {
          type: "p",
          text: "The page may exist only while the object remains associated with the browser session.",
        },
      ],
    },
    {
      heading: "Lower value of URL reputation",
      blocks: [
        {
          type: "p",
          text: "Solutions that depend heavily on blocklists or domain reputation may have difficulty evaluating a locally created URL.",
        },
      ],
    },
    {
      heading: "Dependence on the execution context",
      blocks: [
        {
          type: "p",
          text: "To understand the attack, it may be necessary to reconstruct:",
        },
        {
          type: "list",
          items: [
            "the received message;",
            "the initial click;",
            "the redirects;",
            "the external resource loaded;",
            "the browser behavior;",
            "the authentication performed later.",
          ],
        },
        {
          type: "p",
          text: "The analysis stops being purely URL-based and starts requiring **correlation between email, browser, endpoint, and identity**.",
        },
      ],
    },
    {
      heading: "Use of legitimate services as part of the chain",
      blocks: [
        {
          type: "p",
          text: "Another important aspect is the use of legitimate infrastructure.",
        },
        {
          type: "p",
          text: "The presence of Microsoft domains does not automatically make the session safe. Likewise, the presence of these domains in the logs of an investigation does not mean that Microsoft's infrastructure has been compromised.",
        },
        {
          type: "p",
          text: "The technique exploits the trust associated with known services and uses them as part of a navigation sequence. This reinforces an important change in the detection model:",
        },
        {
          type: "callout",
          callout: {
            kind: "regra",
            title: "Change of premise",
            body: "The reputation of a single domain is insufficient to determine the legitimacy of a complete navigation chain.",
          },
        },
      ],
    },
    {
      heading: "Possible impacts",
      blocks: [
        {
          type: "p",
          text: "If the victim enters credentials on the fake page or approves a later step controlled by the operators, the impacts may include:",
        },
      ],
    },
    {
      heading: "Credential theft",
      blocks: [
        {
          type: "p",
          text: "Users may provide a username, password, or other authentication data on an interface that appears to be legitimate.",
        },
      ],
    },
    {
      heading: "Account compromise",
      blocks: [
        {
          type: "p",
          text: "Valid credentials may allow improper access to corporate services, especially when additional identity controls are not in place.",
        },
      ],
    },
    {
      heading: "Access to cloud resources",
      blocks: [
        {
          type: "p",
          text: "A compromised account may expose, according to its privileges:",
        },
        {
          type: "list",
          items: [
            "email;",
            "documents;",
            "shared files;",
            "corporate information;",
            "SaaS applications;",
            "data stored in cloud services.",
          ],
        },
      ],
    },
    {
      heading: "Movement to other attacks",
      blocks: [
        {
          type: "p",
          text: "The initial identity compromise may be used as a starting point for new phishing campaigns, internal fraud, information gathering, and other post-compromise activities.",
        },
      ],
    },
    {
      heading: "Reduction of available evidence",
      blocks: [
        {
          type: "p",
          text: "Because part of the content is generated during the session, the investigation may lose relevant information if browser artifacts and identity events are not preserved quickly.",
        },
      ],
    },
    {
      heading: "Challenges for SOC and Blue Team",
      blocks: [
        {
          type: "p",
          text: "The campaign demonstrates why defense against modern phishing should not depend exclusively on email controls or lists of malicious domains.",
        },
      ],
    },
    {
      heading: "1. The first domain may be legitimate",
      blocks: [
        {
          type: "p",
          text: "The user may see known infrastructure at the start of navigation.",
        },
      ],
    },
    {
      heading: "2. The effective destination appears after multiple redirects",
      blocks: [
        {
          type: "p",
          text: "Analyzing only the first link may produce an incorrect conclusion.",
        },
      ],
    },
    {
      heading: "3. The final page may not be recoverable",
      blocks: [
        {
          type: "p",
          text: "When the analyst tries to reproduce the incident, the blob URL may no longer exist.",
        },
      ],
    },
    {
      heading: "4. Detection must cross multiple layers",
      blocks: [
        {
          type: "p",
          text: "The SOC must correlate data from:",
        },
        {
          type: "list",
          items: [
            "Secure Email Gateway;",
            "EDR/XDR;",
            "browser;",
            "proxy/SWG/SSE;",
            "DNS;",
            "identity;",
            "Microsoft Entra ID;",
            "Microsoft 365;",
            "SIEM;",
            "anti-phishing protection tools.",
          ],
        },
      ],
    },
    {
      heading: "Indicators and investigation artifacts",
      blocks: [
        {
          type: "table",
          table: {
            headers: ["Type", "Value / Artifact", "Classification", "Guidance"],
            rows: [
              [
                "Domain",
                "cdn.bloom[.]io",
                "Artifact observed in the campaign",
                "Investigate accesses in the context of the chain; validate before blocking",
              ],
              [
                "Domain",
                "login.microsoftonline.com",
                "Legitimate Microsoft infrastructure",
                "Do not treat as an isolated IoC and do not block",
              ],
              [
                "Service",
                "Microsoft Teams",
                "Legitimate service used in the chain",
                "Evaluate redirects and associated external loads",
              ],
              [
                "Scheme",
                "blob:",
                "Legitimate browser feature",
                "Investigate when associated with login pages or suspicious flows",
              ],
              [
                "Browser",
                "Service Worker",
                "Legitimate feature",
                "Evaluate records or anomalous behavior in a phishing context",
              ],
              [
                "Browser",
                "Sandboxed iframe",
                "Legitimate feature",
                "Correlate with external content and suspicious authentication flows",
              ],
              [
                "Email",
                "DocuSign theme",
                "Behavioral indicator",
                "Evaluate sender, email authentication, links, and the context of the request",
              ],
              [
                "Attachment",
                "Calendar invite",
                "Contextual indicator",
                "Do not consider malicious in isolation; analyze URLs and the associated chain",
              ],
            ],
          },
        },
      ],
    },
    {
      heading: "Note on IoCs",
      blocks: [
        {
          type: "p",
          text: "Not all elements of an attack chain should be treated as blockable IoCs. Services such as Microsoft OAuth and Teams have legitimate use at large scale.",
        },
        {
          type: "p",
          text: "Indiscriminate blocks may generate high operational impact and a high volume of false positives. The recommended approach is to combine **technical indicators, event sequence, and behavior**.",
        },
      ],
    },
    {
      heading: "MITRE ATT&CK mapping",
      blocks: [
        {
          type: "p",
          text: "The mapping below represents a defensive CyDef assessment based on the publicly described behavior and should be validated according to the evidence available in each incident.",
        },
        {
          type: "table",
          table: {
            headers: ["Tactic", "Technique", "ID", "Relation to the activity"],
            rows: [
              [
                "Initial Access",
                "Phishing",
                "T1566",
                "Email used to lead the victim to the malicious flow",
              ],
              [
                "Initial Access",
                "Spearphishing Link",
                "T1566.002",
                "Navigation induced by link/redirect",
              ],
              [
                "Execution",
                "User Execution: Malicious Link",
                "T1204.001",
                "The chain depends on the victim's interaction",
              ],
              [
                "Credential Access",
                "Input Capture",
                "T1056",
                "Fake page seeks to capture information provided by the user",
              ],
              [
                "Credential Access",
                "Web Portal Capture",
                "T1056.003",
                "Compatible with the use of a fake authentication page for credential collection",
              ],
            ],
          },
        },
        {
          type: "p",
          text: "Post-compromise techniques, such as the use of valid accounts, should only be attributed if there is evidence that captured credentials were effectively used.",
        },
      ],
    },
    {
      heading: "Detection hypotheses",
      blocks: [
        {
          type: "p",
          text: "Instead of creating a rule based only on a domain, Detection Engineering teams can work with correlation hypotheses.",
        },
      ],
    },
    {
      heading: "Hypothesis 1: Signature email followed by an unusual chain",
      blocks: [
        {
          type: "p",
          text: "Look for events in which:",
        },
        {
          type: "code",
          text: "mensagem com tema de assinatura/documento\nAND\nlink ou convite de calendário\nAND\nnavegação para serviço Microsoft legítimo\nAND\nredirecionamento ou acesso subsequente a domínio externo incomum",
        },
      ],
    },
    {
      heading: "Hypothesis 2: External domain right after Teams/OAuth",
      blocks: [
        {
          type: "p",
          text: "Correlate, within a short time window:",
        },
        {
          type: "code",
          text: "acesso a login.microsoftonline.com\nOR acesso a Microsoft Teams\nTHEN\nconexão com cdn.bloom.io ou outro domínio externo recém-observado\nTHEN\nevento de autenticação suspeito",
        },
        {
          type: "p",
          text: "The goal is not to consider the sequence automatically malicious, but to raise its priority for investigation when there is a context of suspicious email.",
        },
      ],
    },
    {
      heading: "Hypothesis 3: Anomalous authentication after a reported click",
      blocks: [
        {
          type: "p",
          text: "After a user reports interaction with a suspicious message, look for:",
        },
        {
          type: "list",
          items: [
            "new IP addresses;",
            "unusual ASN;",
            "location incompatible with the user's pattern;",
            "unrecognized device;",
            "atypical user agent;",
            "new sessions;",
            "changes to authentication methods;",
            "creation of mailbox rules;",
            "unusual consents or applications;",
            "access to files and services right after the event.",
          ],
        },
      ],
    },
    {
      heading: "Hypothesis 4: Blob URL used in an authentication context",
      blocks: [
        {
          type: "p",
          text: "When the organization has browser telemetry capable of recording this behavior, prioritize cases in which a blob URL is associated with:",
        },
        {
          type: "list",
          items: [
            "login form;",
            "credential request;",
            "navigation originating from email;",
            "loading of unusual scripts or external content;",
            "recent service worker registration.",
          ],
        },
        {
          type: "p",
          text: "The availability of this data varies according to the browser, EDR, corporate extension, and security architecture in use.",
        },
      ],
    },
    {
      heading: "Protection recommendations",
      blocks: [
        {
          type: "p",
          text: "The actions below follow the recommendations of the primary source and the experience of SOC operation, focusing on controls that remain valid when the phishing page ceases to exist as a URL.",
        },
      ],
    },
    {
      heading: "Monitor the complete redirect chain",
      blocks: [
        {
          type: "p",
          text: "Email and browsing protection tools should, whenever possible, analyze more than the first address present in the message.",
        },
        {
          type: "p",
          text: "The goal is to identify the destination and the behavior throughout the entire chain.",
        },
      ],
    },
    {
      heading: "Strengthen phishing-resistant authentication",
      blocks: [
        {
          type: "p",
          text: "Barracuda recommends mechanisms such as:",
        },
        {
          type: "list",
          items: ["FIDO2;", "security keys;", "passkeys."],
        },
        {
          type: "p",
          text: "Phishing-resistant methods reduce the risk associated with simple password theft and represent an important layer of protection against modern credential collection campaigns.",
        },
      ],
    },
    {
      heading: "Correlate email, identity, and endpoint",
      blocks: [
        {
          type: "p",
          text: "The click on the email should not be analyzed in isolation. A mature investigation should be able to relate:",
        },
        {
          type: "code",
          text: "E-mail\n  -> Clique\n  -> Navegação\n  -> Endpoint\n  -> Identidade\n  -> Sessão\n  -> Recursos acessados",
        },
      ],
    },
    {
      heading: "Monitor OAuth flows and redirects",
      blocks: [
        {
          type: "p",
          text: "Unexpected redirects, unusual parameters, and sequences involving authentication services should be evaluated in context.",
        },
      ],
    },
    {
      heading: "Increase browser visibility",
      blocks: [
        {
          type: "p",
          text: "Organizations with greater exposure to phishing can evaluate browser security mechanisms, SSE/SWG, corporate extensions, and telemetry capable of providing greater visibility into the behavior that occurred after the click.",
        },
      ],
    },
    {
      heading: "Update awareness training",
      blocks: [
        {
          type: "p",
          text: "Guidance such as “check whether the domain looks legitimate” remains useful, but is no longer sufficient in isolation. Users should also be guided to:",
        },
        {
          type: "list",
          items: [
            "be suspicious of unexpected signature requests;",
            "confirm sensitive requests through a known channel;",
            "stop the flow when an authentication request appears unexpectedly;",
            "report suspicious messages quickly, even after having clicked.",
          ],
        },
      ],
    },
    {
      heading: "Recommended actions in case of interaction",
      blocks: [
        {
          type: "p",
          text: "If a user has interacted with a similar campaign, the response should consider the degree of exposure.",
        },
      ],
    },
    {
      heading: "When there was only the click",
      blocks: [
        {
          type: "list",
          items: [
            "1) preserve the original message;",
            "2) record the approximate time of the interaction;",
            "3) collect the available chain of URLs and redirects;",
            "4) review endpoint and browser telemetry;",
            "5) consult proxy, DNS, and EDR events;",
            "6) review authentications that occurred right after the click;",
            "7) identify other recipients of the same campaign.",
          ],
        },
      ],
    },
    {
      heading: "When credentials may have been entered",
      blocks: [
        {
          type: "p",
          text: "In addition to the previous actions:",
        },
        {
          type: "list",
          items: [
            "1) reset the exposed credential;",
            "2) revoke applicable sessions and tokens;",
            "3) review authentication events;",
            "4) check for new devices and locations;",
            "5) review changes to MFA or authentication methods;",
            "6) look for suspicious forwarding or mailbox rules;",
            "7) analyze access to files and applications;",
            "8) check for signs of persistence or later use of the account.",
          ],
        },
      ],
    },
    {
      heading: "When there is evidence of account compromise",
      blocks: [
        {
          type: "p",
          text: "The organization should expand the scope of the investigation to determine:",
        },
        {
          type: "list",
          items: [
            "which services were accessed;",
            "which data was consulted or downloaded;",
            "whether messages were sent from the compromised account;",
            "whether other identities were targeted;",
            "whether applications or consents were added;",
            "whether additional credentials or tokens were obtained;",
            "whether the incident requires internal, legal, regulatory, or customer communication.",
          ],
        },
      ],
    },
    {
      heading: "What this campaign teaches",
      blocks: [
        {
          type: "p",
          text: "The main lesson is not only in the use of blob URLs.",
        },
        {
          type: "p",
          text: "The campaign demonstrates a broader trend: **attackers are shifting stages of the phishing chain into environments and services considered trustworthy**, reducing the value of controls based on static indicators.",
        },
        {
          type: "p",
          text: "The defensive question is no longer only:",
        },
        {
          type: "callout",
          callout: {
            kind: "ponto",
            title: "From the URL to the sequence",
            body: "“What is the malicious URL?” stops being the central question and starts to include: “What was the complete sequence of actions that led the user to the credential request?”.",
          },
        },
        {
          type: "p",
          text: "This model requires greater integration between email security, identity protection, browser, endpoint, and SIEM.",
        },
      ],
    },
    {
      heading: "Conclusion",
      blocks: [
        {
          type: "p",
          text: "The campaign analyzed by Barracuda shows how phishing techniques are evolving to bypass traditional analysis mechanisms.",
        },
        {
          type: "p",
          text: "By using Microsoft OAuth and Microsoft Teams as parts of a navigation chain and generating the fake page through a blob URL inside the browser, the operators reduce traditional compromise signals and make the investigation more dependent on context and correlation.",
        },
        {
          type: "p",
          text: "This does not represent a vulnerability in Microsoft Teams. It does, however, represent a relevant example of **abuse of legitimate features to build a more convincing and evasive phishing experience**.",
        },
        {
          type: "p",
          text: "For SOC, Blue Team, and Detection Engineering teams, the main mindset change is clear: **it is not enough to analyze where the click started. It is necessary to understand what the browser did after it.**",
        },
      ],
    },
    {
      blocks: [
        {
          type: "note",
          text: "This content is informative and intended for cybersecurity awareness. Technical indicators should be validated in the context of each environment before applying blocks or other containment actions.",
        },
      ],
    },
  ],
  sources: [
    {
      label:
        "Barracuda Networks: Phishing pages that exist only inside the victim’s browser (Ashitosh Deshnur, 09/09/2026)",
      url: "https://blog.barracuda.com/2026/09/09/browser-based-phishing-blob-urls-microsoft-redirects",
    },
    {
      label:
        "Cyber Security News: Hackers Use Blob URLs and Microsoft Teams to Create Phishing Pages Inside Victims’ Browsers (Tushar Subhra Dutta, 10/09/2026)",
      url: "https://cybersecuritynews.com/hackers-use-blob-urls/",
    },
  ],
  changelog: [
    "2026-09-11: first version, based on the public Barracuda Networks analysis and Cyber Security News coverage.",
  ],
};
