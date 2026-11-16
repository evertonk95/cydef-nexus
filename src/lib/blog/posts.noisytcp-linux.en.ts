import type { BlogPost } from "./posts";

/**
 * NoisyTCP: race condition in Linux TCP allows remote kernel panic
 * (CVE-2026-99288, EN). Content prepared from the advisory by researcher
 * Hyunwoo Kim (@v4bel) on GitHub and oss-security, and the Cyber Security News
 * publication, verified on November 16, 2026.
 * Cover: public/assets/blog/noisytcp-linux-kernel-tcp-dos-thumb.webp
 */
export const noisytcpLinuxPostEn: BlogPost = {
  slug: "noisytcp-linux-kernel-tcp-dos-cve-2026-99288",
  title:
    "NoisyTCP: 11-year-old Linux TCP flaw lets attackers crash servers remotely without authentication",
  category: "Threat Intelligence",
  excerpt:
    "After the embargo ended, CVE-2026-99288 (NoisyTCP) was disclosed, a race condition in the Linux kernel's TCP code that can be triggered remotely and without authentication to cause a kernel panic. The flaw has existed since 2015 and affects almost all Linux distributions.",
  date: "November 16, 2026",
  dateISO: "2026-11-16",
  readTime: "8 min read",
  image: "/assets/blog/noisytcp-linux-kernel-tcp-dos-thumb.webp",
  author: "CyDef Team",
  tags: [
    "Linux",
    "Kernel",
    "TCP",
    "NoisyTCP",
    "CVE-2026-99288",
    "Race condition",
    "Denial of service",
    "Threat Intelligence",
  ],
  toc: true,
  sections: [
    {
      blocks: [
        {
          type: "p",
          text: "On November 15, 2026, after the embargo period ended, the advisory for **CVE-2026-99288**, named **NoisyTCP**, was disclosed. It is a race condition in the Linux kernel's TCP code that can be triggered remotely and without authentication, causing a kernel panic and denial of service.",
        },
        {
          type: "p",
          text: "The cause is a race between packet-receiving contexts: a stale lookup finds an existing request socket, while another context frees that record and reuses the same memory for a new SYN cookie request with the same tuple. The first context passes its checks, but the new object has no attached listener, and the kernel dereferences a null listener and panics.",
        },
        {
          type: "p",
          text: "The flaw was introduced in commit 079096f103fa on October 3, 2015 and fixed in commit 4e2b3ef19e0e on November 3, 2026. That means nearly every Linux distribution carried the flaw for about 11 years.",
        },
        {
          type: "callout",
          callout: {
            kind: "ponto",
            title: "CyDef Assessment",
            body: "What makes NoisyTCP relevant is the minimal prerequisite: the server only needs to call listen() and receive packets from the attacker. No rare configuration, firewall rule or special socket. Nginx, Apache and SSH servers in their default configuration fall within the target. And there is an operational aggravator: for a service running in a container, the panic takes down the whole host, not only the application. The natural target is internet-facing Linux servers, and the correct response is to update the kernel and reboot.",
          },
        },
        {
          type: "note",
          text: "Author: CyDef Team. Advisory by Hyunwoo Kim (@v4bel) on GitHub and oss-security, and Cyber Security News publication verified on November 16, 2026.",
        },
      ],
    },
    {
      heading: "Executive summary",
      blocks: [
        {
          type: "p",
          text: "What is known as of November 16, 2026, based on the researcher's advisory and the publication reviewed:",
        },
        {
          type: "list",
          items: [
            "**CVE:** CVE-2026-99288 (NoisyTCP), in the Linux kernel TCP code.",
            "**Type:** race condition between packet-receiving contexts.",
            "**Result:** kernel panic and remote denial of service, without authentication.",
            "**Introduced:** commit 079096f103fa (October 3, 2015).",
            "**Fixed:** commit 4e2b3ef19e0e (November 3, 2026).",
            "**Prerequisite:** a server with two or more receive queues, or with RPS enabled.",
            "**Not RCE:** the publication does not present the flaw as remote code execution.",
            "**Target:** Linux servers with reachable TCP listeners, such as Nginx, Apache, SSH and proxies.",
          ],
        },
      ],
    },
    {
      heading: "Affected products and environments",
      blocks: [
        {
          type: "p",
          text: "The problem affects the Linux kernel itself, so the reach is defined by the environment, not by a specific application product.",
        },
        {
          type: "list",
          items: [
            "**Linux kernel:** versions including commit 079096f103fa (2015-2026), up to the 4e2b3ef19e0e fix.",
            "**Servers** with two or more packet receive queues, or with RPS enabled.",
            "**TCP listeners** reachable by the attacker's packets: Nginx, Apache, SSH and proxies in default configuration.",
          ],
        },
        {
          type: "p",
          text: "The race condition is easier to trigger in virtualized environments. In the researcher's tests, on QEMU/KVM virtual machines the trigger took about 5 seconds to 2 minutes, while on a quiet bare-metal server with 8 receive queues it took about 14 hours, even with a proof of concept tuned for the environment.",
        },
      ],
    },
    {
      heading: "How the attack works",
      blocks: [
        {
          type: "p",
          text: "The attacker sends IPv4 fragments and normal TCP packets that land on different CPUs, exploiting the difference in receive hash. This creates the race condition in which two parts of the kernel touch the same memory at the same instant.",
        },
        {
          type: "list",
          items: [
            "**Path 1 (request_sock reuse ABA race):** the stale lookup acquires a refcount on the new object and passes the tuple recheck, but the new request socket has no listener; the receive path dereferences a null listener and panics. Result: remote denial of service.",
            "**Path 2 (full child socket ABA race):** may cause remote use-after-free, but requires multiple races to succeed in sequence and is much harder to trigger.",
          ],
        },
        {
          type: "p",
          text: "The researcher states that, so far, he has only built a limited, lab-specific exploit targeting virtual servers, and is still researching a general-purpose exploit. Remote denial of service, however, is reachable without much difficulty.",
        },
      ],
    },
    {
      heading: "Potential impact",
      blocks: [
        {
          type: "list",
          items: [
            "**Kernel panic** and remote denial of service, without authentication.",
            "**Full host unavailability**, even when the affected service runs in a container.",
            "**Possible remote use-after-free** on the second trigger path, hard to exploit.",
            "**Broad reach:** nearly all Linux distributions, for about 11 years.",
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
            "**Install** updated kernels with the 4e2b3ef19e0e fix, from the distribution vendors.",
            "**Reboot** the systems after the kernel update.",
            "**Prioritize** public servers running TCP listeners.",
            "**Inventory** containers and separate network namespaces using affected kernels.",
            "**Monitor** servers for unexplained reboots.",
            "**Test** the kernel updates before deploying to production.",
          ],
        },
        {
          type: "callout",
          callout: {
            kind: "regra",
            title: "When the update cannot be applied immediately",
            body: "Two temporary mitigations: disable SYN cookies with `sudo sysctl -w net.ipv4.tcp_syncookies=0` (per network namespace, which reduces protection against SYN floods), or reduce the receive queues of the ingress interface to a single queue and disable RPS and RFS. Both block the race, but have their own cost and must be reverted after the patch.",
          },
        },
      ],
    },
    {
      heading: "What we still do not know / limits of this article",
      blocks: [
        {
          type: "p",
          text: "This article was prepared from the advisory by researcher Hyunwoo Kim (@v4bel) on GitHub and oss-security, and the Cyber Security News publication, with verification on November 16, 2026. There is no CyDef telemetry of its own about this vulnerability and no exploitation observed internally.",
        },
        {
          type: "p",
          text: "The flaw is not presented as remote code execution, and the researcher states there is no general-purpose exploit yet. The remote use-after-free path is described as hard to trigger. The race window is narrow, and on quiet bare-metal servers the trigger can take many hours. This text will be updated when there is new verifiable information.",
        },
      ],
    },
    {
      heading: "Next steps",
      blocks: [
        {
          type: "list",
          items: [
            "Check the kernel versions of the Linux servers in the environment.",
            "Apply the patched kernels from the distribution vendors and reboot.",
            "Prioritize public servers with TCP listeners.",
            "Inventory containers and separate network namespaces.",
            "Monitor unexplained reboots while the update is not complete.",
          ],
        },
      ],
    },
  ],
  sources: [
    {
      label:
        "GitHub: V4bel/NoisyTCP — Linux Kernel TCP Pre-auth Remote Corruption (CVE-2026-99288)",
      url: "https://github.com/V4bel/NoisyTCP",
    },
    {
      label:
        "oss-security: NoisyTCP — Linux Kernel TCP Pre-auth Remote Corruption (CVE-2026-99288)",
      url: "https://www.openwall.com/lists/oss-security/2026/11/15/2",
    },
    {
      label:
        "Cyber Security News: NoisyTCP — 11-Year-Old Linux Kernel Flaw Lets Unauthenticated Attackers Crash Servers Remotely",
      url: "https://cybersecuritynews.com/noisytcp-linux-kernel-vulnerability/",
    },
  ],
  changelog: [
    "2026-11-16: first version, based on the advisory by Hyunwoo Kim (@v4bel) and the Cyber Security News publication, verified on this date.",
  ],
};
