import type { BlogPost } from "./posts";

/**
 * Windows BitLocker: flaws allow bypassing disk encryption
 * (CVE-2026-97015 and CVE-2026-119832, EN). Content prepared from the
 * Microsoft CVE records and the Cyber Security News publication, verified on
 * November 12, 2026. Cover: public/assets/blog/windows-bitlocker-bypass-thumb.webp
 */
export const windowsBitlockerBypassPostEn: BlogPost = {
  slug: "windows-bitlocker-bypass-cve-2026-97015",
  title:
    "BitLocker: two flaws allow bypassing disk encryption on Windows devices",
  category: "Threat Intelligence",
  excerpt:
    "Microsoft disclosed two Windows BitLocker vulnerabilities on November 10, 2026, CVE-2026-97015 and CVE-2026-119832, that allow bypassing security features through a physical attack. CVE-2026-119832 requires physical access and basic privileges to bypass system drive encryption.",
  date: "November 12, 2026",
  dateISO: "2026-11-12",
  readTime: "8 min read",
  image: "/assets/blog/windows-bitlocker-bypass-thumb.webp",
  author: "CyDef Team",
  tags: [
    "Windows",
    "BitLocker",
    "CVE-2026-97015",
    "CVE-2026-119832",
    "Encryption",
    "Buffer overflow",
    "Endpoint Security",
    "Threat Intelligence",
  ],
  toc: true,
  sections: [
    {
      blocks: [
        {
          type: "p",
          text: "On November 10, 2026, Microsoft disclosed two vulnerabilities in **Windows BitLocker**, identified as **CVE-2026-97015** and **CVE-2026-119832**. Both allow bypassing BitLocker security features through a physical attack on the device, but they have different causes and access requirements.",
        },
        {
          type: "p",
          text: "**CVE-2026-97015** is caused by a **heap-based buffer overflow**, classified as CWE-122. **CVE-2026-119832** stems from **improper access control**. In the case of CVE-2026-119832, Microsoft confirms that an attacker with physical access and basic privileges can bypass the encryption of the system storage device and access encrypted data.",
        },
        {
          type: "p",
          text: "The score reflects the physical nature of the vector: CVE-2026-97015 received CVSS 6.8 and CVE-2026-119832, CVSS 5.9, both rated Important. Neither requires the victim to click a link, open a file or approve a prompt.",
        },
        {
          type: "callout",
          callout: {
            kind: "ponto",
            title: "CyDef Assessment",
            body: "BitLocker is the layer that protects data at rest when the device is lost, stolen or physically accessed without the user. Flaws that bypass this layer through a physical attack hit exactly the scenario that disk encryption exists to cover. The practical risk depends on a fact that network telemetry cannot see: who has physical access to the device. The correct response combines patching with physical access control, and priority should fall on devices that hold sensitive data and can be physically accessed by third parties.",
          },
        },
        {
          type: "note",
          text: "Author: CyDef Team. Microsoft CVE records and Cyber Security News publication verified on November 12, 2026.",
        },
      ],
    },
    {
      heading: "Executive summary",
      blocks: [
        {
          type: "p",
          text: "What is known as of November 12, 2026, based on the Microsoft CVE records and the publication reviewed:",
        },
        {
          type: "list",
          items: [
            "**Disclosure:** November 10, 2026, in the monthly update cycle.",
            "**Flaws:** CVE-2026-97015 (heap-based buffer overflow, CWE-122) and CVE-2026-119832 (improper access control).",
            "**Rating:** both Important; CVSS 6.8 and 5.9, respectively.",
            "**Vector:** physical attack on the device; no user interaction.",
            "**Privileges:** CVE-2026-97015 requires none; CVE-2026-119832 requires basic privileges.",
            "**Result for CVE-2026-119832:** bypass of system drive encryption and access to encrypted data.",
            "**Known exploitation:** Microsoft stated CVE-2026-97015 was not publicly known or exploited at the publication date.",
            "**Target:** no sector or organization type specified as more affected.",
          ],
        },
      ],
    },
    {
      heading: "Affected products and versions",
      blocks: [
        {
          type: "p",
          text: "The affected product list is not identical between the two CVEs. CVE-2026-97015 has broader reach, including older Windows Server branches; CVE-2026-119832 covers a narrower set. The table below separates the two.",
        },
        {
          type: "table",
          table: {
            headers: ["Product / version", "CVE-2026-97015", "CVE-2026-119832"],
            rows: [
              ["Windows 10 1607", "Affected", "Not affected"],
              ["Windows 10 1809", "Affected", "Affected"],
              ["Windows 10 21H2", "Affected", "Affected"],
              ["Windows 10 22H2", "Affected", "Affected"],
              ["Windows 11 23H2", "Affected", "Affected"],
              ["Windows 11 24H2", "Affected", "Affected"],
              ["Windows 11 25H2", "Affected", "Affected"],
              ["Windows 11 26H1", "Affected", "Affected"],
              ["Windows 11 26H2", "Affected", "Affected"],
              ["Windows Server 2012", "Affected", "Not affected"],
              ["Windows Server 2012 R2", "Affected", "Not affected"],
              ["Windows Server 2016", "Affected", "Not affected"],
              ["Windows Server 2019", "Affected", "Affected"],
              ["Windows Server 2022", "Affected", "Affected"],
              ["Windows Server 2025", "Affected", "Affected"],
            ],
          },
        },
        {
          type: "p",
          text: "The difference in reach is a practical point: an inventory that treats the two flaws as a single list may conclude that a Windows Server 2012 or a Windows 10 1607 is protected against CVE-2026-119832 when it is in fact still exposed to CVE-2026-97015. Each CVE must be checked against its own official record.",
        },
      ],
    },
    {
      heading: "Patched builds per CVE",
      blocks: [
        {
          type: "p",
          text: "Microsoft released security updates with patched builds specific to each product and flaw. The table below summarizes the minimum patched builds indicated in the records.",
        },
        {
          type: "table",
          table: {
            headers: ["Product / version", "CVE-2026-97015", "CVE-2026-119832"],
            rows: [
              ["Windows 10 1607", "10.0.14393.9612", "Not affected"],
              ["Windows 10 1809", "10.0.17763.9376", "10.0.17763.9487"],
              ["Windows 10 21H2", "10.0.19044.7807", "10.0.19044.7846"],
              ["Windows 10 22H2", "10.0.19045.7807", "10.0.19045.7846"],
              ["Windows 11 23H2", "10.0.22631.7652", "10.0.22631.7711"],
              ["Windows 11 24H2", "10.0.26100.9711", "10.0.26100.9974"],
              ["Windows 11 25H2", "10.0.26200.9711", "10.0.26200.9974"],
              ["Windows 11 26H1", "10.0.28000.3231", "10.0.28000.3501"],
              ["Windows 11 26H2", "10.0.26300.9711", "10.0.26300.9974"],
              ["Windows Server 2012", "6.2.9200.26434", "Not affected"],
              ["Windows Server 2012 R2", "6.3.9600.23470", "Not affected"],
              ["Windows Server 2016", "10.0.14393.9612", "Not affected"],
              ["Windows Server 2019", "10.0.17763.9376", "10.0.17763.9487"],
              ["Windows Server 2022", "10.0.20348.5761", "10.0.20348.5870"],
              ["Windows Server 2025", "10.0.26100.33650", "10.0.26100.33822"],
            ],
          },
        },
        {
          type: "p",
          text: "Applying a November 2026 update does not by itself mean being protected against both flaws: the patched builds differ between CVE-2026-97015 and CVE-2026-119832. Verification must confirm the running build, not only the panel's success message.",
        },
      ],
    },
    {
      heading: "How the attack works",
      blocks: [
        {
          type: "p",
          text: "Both flaws share the same entry vector: physical access to the device. That is what distinguishes this case from a remote exploitation. There is no link to click, file to open or prompt to approve.",
        },
        {
          type: "list",
          items: [
            "**CVE-2026-97015:** a heap-based buffer overflow (CWE-122) allows bypassing a security feature through a physical attack. It requires no prior privileges.",
            "**CVE-2026-119832:** improper access control allows bypassing system drive encryption and accessing encrypted data. It requires basic privileges.",
          ],
        },
        {
          type: "p",
          text: "The consequence is what makes the case relevant: on a BitLocker device, disk encryption is precisely the mechanism that protects data if the equipment falls into the wrong hands. Bypassing that layer returns access to the content that encryption was supposed to make inaccessible.",
        },
      ],
    },
    {
      heading: "Potential impact",
      blocks: [
        {
          type: "list",
          items: [
            "**Confidentiality:** possible access to encrypted data on the system drive, in the case of CVE-2026-119832.",
            "**Integrity:** the CVE-2026-97015 vector indicates potential impact on the integrity and confidentiality of protected data.",
            "**Local exposure:** the risk concentrates on devices that can be physically accessed by third parties.",
            "**No remote vector:** the publication does not describe remote exploitation; physical access is a prerequisite.",
          ],
        },
      ],
    },
    {
      heading: "Mitigation recommendations",
      blocks: [
        {
          type: "list",
          items: [
            "**Inventory** the Windows devices with BitLocker and determine the version and build of each.",
            "**Check** the applicability of each CVE separately in the official Microsoft records.",
            "**Apply** the corresponding security updates, confirming that each device reached the patched build.",
            "**Prioritize** devices that store sensitive data.",
            "**Restrict** physical access to affected devices and review physical access controls.",
          ],
        },
        {
          type: "callout",
          callout: {
            kind: "regra",
            title: "When the update cannot be applied immediately",
            body: "Restrict physical access to affected devices and keep them in controlled locations until updates are applied. For a vector that depends on physical access, physical containment is the mitigation that closes the path while the patch is not applied.",
          },
        },
      ],
    },
    {
      heading: "What we still do not know / limits of this article",
      blocks: [
        {
          type: "p",
          text: "This article was prepared from the Microsoft CVE records and the Cyber Security News publication, with verification on November 12, 2026. There is no CyDef telemetry of its own about these vulnerabilities and no exploitation observed internally.",
        },
        {
          type: "p",
          text: "Microsoft stated that CVE-2026-97015 was not publicly known nor evidenced as exploited at the publication date. As of the verification date, there is no public information about active exploitation of either flaw, nor attribution of authorship. This text will be updated when there is new verifiable information.",
        },
      ],
    },
    {
      heading: "Next steps",
      blocks: [
        {
          type: "list",
          items: [
            "Enumerate the Windows devices with BitLocker in the environment, with version and build.",
            "Check the applicability of each CVE in the official Microsoft records.",
            "Apply the November 2026 updates, prioritizing devices with sensitive data.",
            "Review physical access controls and confirm that devices reached the patched builds.",
          ],
        },
      ],
    },
  ],
  sources: [
    {
      label:
        "Microsoft Security Response Center: CVE-2026-97015",
      url: "https://msrc.microsoft.com/update-guide/vulnerability/CVE-2026-97015",
    },
    {
      label:
        "Microsoft Security Response Center: CVE-2026-119832",
      url: "https://msrc.microsoft.com/update-guide/vulnerability/CVE-2026-119832",
    },
    {
      label:
        "CVE Program: CVE-2026-97015",
      url: "https://www.cve.org/CVERecord?id=CVE-2026-97015",
    },
    {
      label:
        "CVE Program: CVE-2026-119832",
      url: "https://www.cve.org/CVERecord?id=CVE-2026-119832",
    },
    {
      label:
        "Cyber Security News: Windows BitLocker Vulnerabilities Allow Attackers to Bypass Security Feature",
      url: "https://cybersecuritynews.com/windows-bitlocker-security-bypass/",
    },
  ],
  changelog: [
    "2026-11-12: first version, based on the Microsoft CVE records and the Cyber Security News publication, verified on this date.",
  ],
};
