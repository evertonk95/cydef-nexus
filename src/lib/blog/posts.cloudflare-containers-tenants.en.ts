import type { BlogPost } from "./posts";

/**
 * Cloudflare Containers: cross-tenant residual data exposure - EN article
 * (translation of the PT canonical). Prepared from the technical analysis
 * published by Cloudflare on 2026-09-24, the Accomplish report (responsible
 * disclosure on 2026-09-04), and the publication analyzed by Cyber Security News.
 * Cover: public/assets/blog/cloudflare-containers-cross-tenant-thumb.webp
 */
export const cloudflareContainersTenantsPostEn: BlogPost = {
  slug: "cloudflare-containers-isolamento-entre-tenants",
  title:
    "Cloudflare Containers: cross-tenant isolation flaw exposed residual data from previous workloads",
  category: "Cloud Security",
  excerpt:
    "A flaw in the storage layer of Cloudflare Containers shared pools allowed a workload to recover residual disk blocks left behind by containers belonging to other customers on the same physical host. The exposure reached file system metadata, database pages, and structurally complete SQLite databases. The fix has already been applied across the entire fleet, with no change to customer-side configuration.",
  date: "September 25, 2026",
  dateISO: "2026-09-25",
  readTime: "11 min read",
  image: "/assets/blog/cloudflare-containers-cross-tenant-thumb.webp",
  author: "CyDef Team",
  tags: [
    "Cloudflare",
    "Cloudflare Containers",
    "Cloudflare Sandboxes",
    "Cross-tenant isolation",
    "dm-thin",
    "Firecracker",
    "Cloud Security",
    "Data exposure",
    "Multi-tenant",
    "Blue Team",
  ],
  toc: true,
  sections: [
    {
      blocks: [
        {
          type: "p",
          text: "Cloudflare fixed a cross-tenant data exposure vulnerability in the **Cloudflare Containers** platform, which also affected **Cloudflare Sandboxes**, built on top of Containers. The flaw allowed a workload to recover residual disk blocks left behind by containers belonging to other customers on the same physical host.",
        },
        {
          type: "p",
          text: "The problem was not in a conventional container nor in a virtual machine escape. The origin was the **storage layer**: device mapper thin provisioning (**dm-thin**) ran with the `skip_block_zeroing` option enabled on the shared pools, which caused recycled physical blocks to be handed out without prior cleanup.",
        },
        {
          type: "p",
          text: "Responsible disclosure was made on **September 4, 2026** by researcher **Oren Yomtov**, of **Accomplish**, through Cloudflare's bug bounty program on HackerOne. Cloudflare published the technical analysis on **September 24, 2026** and states it found no evidence of malicious exploitation by third parties in the historical disk I/O telemetry it retains.",
        },
        {
          type: "callout",
          callout: {
            kind: "ponto",
            title: "CyDef Assessment",
            body: "The case matters less for the technique and more for the layer that was hit. In the shared cloud model, cross-customer isolation is a promise the organization does not control and cannot verify on its own: it depends on the provider. That is why the right response has two parts. The first is technical, and Cloudflare has already carried it out (zeroing of new allocations, retirement of running disks, and cleanup of cached snapshots). The second is governance: review which secrets and sensitive data were present in multi-tenant workloads and decide on preventive rotation, according to each organization's risk policy.",
          },
        },
        {
          type: "note",
          text: "Author: CyDef Team. Sources consulted and verified on September 25, 2026.",
        },
      ],
    },
    {
      heading: "Executive summary",
      blocks: [
        {
          type: "p",
          text: "What is known as of September 25, 2026, based on the technical analysis published by Cloudflare, the Accomplish report, and the publication consulted:",
        },
        {
          type: "list",
          items: [
            "**Affected products:** Cloudflare Containers and Cloudflare Sandboxes, on shared multi-tenant infrastructure.",
            "**Layer of the flaw:** storage, in dm-thin thin provisioning, with the `skip_block_zeroing` option enabled on the shared pools.",
            "**Exploitation prerequisite:** a Workers Paid account. The attacker could not choose the victim, the host, the workload, or the data exposed.",
            "**Mechanism:** recycled 64 KiB physical blocks were handed out without zeroing, which allowed reading up to 60 KiB of residual data from another customer after a write of only 4 KiB.",
            "**Scale observed in validation:** residual material in 18 of 24 placements and in 20 of 22 underlying nodes, across four continents.",
            "**Data types recovered:** directory structures, database pages, and structurally complete SQLite databases.",
            "**What the flaw did not allow:** access to actively attached disks, modification of another customer's active data, or unavailability of workloads.",
            "**Disclosure:** report on September 4, 2026, via HackerOne, by researcher Oren Yomtov, of Accomplish.",
            "**Fix:** global removal of `skip_block_zeroing`, retirement of running disks, cleanup of cached snapshots, and restart of the VMs, with no action required from the customer.",
            "**Malicious exploitation:** no activity identified beyond the authorized validations by the researchers and Cloudflare engineers.",
          ],
        },
      ],
    },
    {
      heading: "Case profile",
      blocks: [
        {
          type: "table",
          table: {
            headers: ["Attribute", "Detail"],
            rows: [
              [
                "Name",
                "Cross-tenant residual data exposure in Cloudflare Containers",
              ],
              ["Type", "Cross-tenant isolation flaw in the storage layer"],
              [
                "Affected layer",
                "dm-thin thin provisioning with skip_block_zeroing enabled",
              ],
              ["Products", "Cloudflare Containers and Cloudflare Sandboxes"],
              [
                "Execution isolation",
                "Dedicated Firecracker microVM per container",
              ],
              ["Disk presented to the VM", "/dev/vdc (writable root disk)"],
              ["Thin block size", "64 KiB"],
              ["Prerequisite", "Workers Paid account"],
              ["Disclosure", "September 4, 2026, via HackerOne"],
              ["Researcher", "Oren Yomtov, of Accomplish"],
              [
                "Publication of the analysis",
                "September 24, 2026, on the Cloudflare blog",
              ],
              ["CVE", "Not provided in the sources consulted"],
              [
                "Remediation",
                "Applied across the entire fleet, with no customer configuration",
              ],
            ],
          },
        },
      ],
    },
    {
      heading: "How container storage worked",
      blocks: [
        {
          type: "p",
          text: "Each container runs inside a **dedicated microVM** of the **Firecracker** virtual machine monitor. Cloudflare presents the writable root disk of that VM as `/dev/vdc`. Each container receives its own disk, and it is `dm-thin` that materializes that disk into physical storage.",
        },
        {
          type: "p",
          text: "Thin provisioning allocates physical space **only when** the virtual disk writes to a region that is not yet mapped. On the affected pools, the thin block size was **64 KiB**. When the thin volume backing a container's root disk was deleted, its physical blocks returned to a pool that served workloads from **several customer accounts**.",
        },
        {
          type: "p",
          text: "The central point is a pool configuration option, `skip_block_zeroing`. With that option enabled, `dm-thin` **stopped zeroing** newly allocated blocks before handing them out. A write the size of the block replaced all the previous content, but a smaller write changed only the portion written. The remainder could retain data from the previous owner of that physical block.",
        },
      ],
    },
    {
      heading: "How exploitation worked",
      blocks: [
        {
          type: "p",
          text: "Reading an unmapped region of a new thin disk does not reveal residual data: in that case, `dm-thin` returns zeros **without allocating a physical block**. That is why the reported technique needs an intermediate step, almost counterintuitive, to force the allocation.",
        },
        {
          type: "p",
          text: "The proof of concept identified regions aligned on **64 KiB** that corresponded to **free space** in the guest ext4 file system and wrote an aligned block of **4 KiB** into each region. That small write forced `dm-thin` to allocate a recycled 64 KiB physical block, replacing only 4 KiB. Because zeroing was disabled, the **remaining 60 KiB** could retain data from a previous container. A raw read of the device, in sequence, could then reveal bytes that the new container had never written.",
        },
        {
          type: "p",
          text: "The proof of concept ran, in order:",
        },
        {
          type: "list",
          items: [
            "Create a container using a Workers Paid account.",
            "Open the writable root disk at `/dev/vdc`.",
            "Read the disk and record a baseline.",
            "Write a 4 KiB block into each 64 KiB region corresponding to ext4 free space.",
            "Read the resulting blocks again.",
            "Examine only the portions not overwritten by the new container.",
          ],
        },
        {
          type: "callout",
          callout: {
            kind: "aviso",
            title: "Why the raw read matters",
            body: "The recovered content does not come from an application interface or an API: it comes from directly reading the block device. That means no application access control, file permission, or application-level encryption of data at rest interrupts the technique. The protection, in this case, is block cleanup at the storage layer, exactly what the fix restores.",
          },
        },
      ],
    },
    {
      heading: "How the flaw was validated",
      blocks: [
        {
          type: "p",
          text: "The researchers used **ext4 directory block checksums** (the `metadata_csum` feature) to separate blocks from the test file system itself from blocks originating in other file systems. When ext4 uses that feature, the directory block checksum incorporates values associated with the file system and the inode, which makes it possible to attribute a block to its origin.",
        },
        {
          type: "p",
          text: "The method was first calibrated against blocks that the researchers themselves created and deleted in the controlled file system of the proof of concept: **162 of 162** blocks were attributed correctly. Only then was the measurement applied to production placements.",
        },
        {
          type: "table",
          table: {
            headers: ["Metric", "Reported result"],
            rows: [
              [
                "Testable directory blocks",
                "5,614, distributed across six production placements",
              ],
              [
                "Blocks attributed to the researchers' file system",
                "0",
              ],
              [
                "Foreign directory inodes identified",
                "2,700",
              ],
              [
                "Method control (blocks created and deleted by the researchers)",
                "162 of 162 attributed correctly",
              ],
              ["Placements with residual material", "18 of 24"],
              ["Underlying nodes with residual material", "20 of 22"],
              ["Geographic reach", "Four continents"],
              [
                "Formats observed",
                "Directory structures, database pages, and structurally complete SQLite databases",
              ],
            ],
          },
        },
        {
          type: "p",
          text: "According to the report, the scripts used produced only **aggregate counts** and format checks, with no recovered file content. The materials sent to Cloudflare contained no recovered content values nor third-party identifiers, and the researchers confirmed the secure deletion of the recovered data after submission, in accordance with the HackerOne disclosure policy.",
        },
      ],
    },
    {
      heading: "Potential impact",
      blocks: [
        {
          type: "list",
          items: [
            "**Exposure of residual data:** the possibility of recovering bytes left behind by workloads of other customers on the same physical host.",
            "**File system metadata:** directory structures and other metadata readable in recycled blocks.",
            "**Databases:** database pages and structurally complete SQLite databases among the formats observed.",
            "**Broken isolation:** the flaw crossed the cross-tenant isolation boundary on shared infrastructure.",
            "**Secrets and application data:** direct risk for workloads that process credentials, tokens, or sensitive information in multi-tenant environments.",
          ],
        },
      ],
    },
    {
      heading: "What the flaw did not allow",
      blocks: [
        {
          type: "p",
          text: "Delimiting the reach of the flaw is part of the analysis. According to the sources consulted, the technique:",
        },
        {
          type: "list",
          items: [
            "Did not allow choosing the victim, the host, the workload, or the specific data exposed: workload placement is automatic and the customer does not select the host.",
            "Did not allow access to actively attached disks.",
            "Did not allow modifying another customer's active data.",
            "Did not allow affecting the availability of workloads.",
            "Did not guarantee the presence of residual data: the exposure depended on which released blocks the allocator reassigned, which makes extraction opportunistic rather than targeted.",
          ],
        },
        {
          type: "p",
          text: "Even with these limitations, the exposed fragments could contain file system metadata, application information, and sensitive database content. It is that possibility, and not certainty of access, that justifies treating the case as a high-severity incident.",
        },
      ],
    },
    {
      heading: "Timeline",
      blocks: [
        {
          type: "table",
          table: {
            headers: ["Date (UTC)", "Event"],
            rows: [
              [
                "September 4, 15:26",
                "Oren Yomtov, of Accomplish, reports the flaw through the bug bounty program on HackerOne.",
              ],
              [
                "September 4, 18:45",
                "Cloudflare opens the security incident and confirms the production configuration that caused the flaw.",
              ],
              [
                "September 4, 21:27",
                "Merge of the runtime fix and the block reuse test.",
              ],
              [
                "September 4, 22:03",
                "Merge of the changes for new pools and for active pools.",
              ],
              [
                "September 4, 23:15",
                "Start of the rollout of the changes.",
              ],
              [
                "September 7, 06:13",
                "Completion of the rollout of the changes and start of the data cleanup of the old pools.",
              ],
              [
                "September 14, 10:50",
                "Researchers confirm that the proof of concept stopped working.",
              ],
              [
                "September 14, 12:52",
                "Cloudflare grants the reward to the researcher.",
              ],
              [
                "September 19, 15:03",
                "Completion of the cleanup of all cached snapshots prior to the fix.",
              ],
              [
                "September 24, 15:00",
                "Publication of the technical analysis on the Cloudflare blog.",
              ],
            ],
          },
        },
      ],
    },
    {
      heading: "The fix applied by Cloudflare",
      blocks: [
        {
          type: "p",
          text: "The first measure was to remove `skip_block_zeroing` from the `dm-thin` pool configuration across the entire fleet, restoring the default behavior of **zeroing newly allocated blocks** before exposing them to a container. That interrupted the reported technique, in which a small write triggered the allocation and a larger read recovered the residual data from the rest of the block. The researchers independently confirmed that the proof of concept stopped working after the change.",
        },
        {
          type: "p",
          text: "Zeroing new allocations, however, **does not sanitize blocks already mapped** on existing thin devices. Those mappings remained on the disks of running containers and in the snapshot cache that each host prepares for OCI image layers. A new container could inherit mappings from a cached layer without allocating those blocks again, which kept residual bytes readable in unused regions, including in ext4 free space.",
        },
        {
          type: "p",
          text: "That is why remediation went beyond the configuration option:",
        },
        {
          type: "list",
          items: [
            "Retirement of all running container disks.",
            "Removal of the cached image snapshots created before the fix.",
            "Draining of hosts during lower-usage hours.",
            "Restart of the virtual machines of each host.",
            "Cleanup of each host's image cache, so that disks and layers would be recreated with zeroed allocations.",
          ],
        },
        {
          type: "p",
          text: "The cleanup was completed across the entire Containers fleet. The remediation **requires no customer-side configuration change**, although organizations should assess whether the secrets handled by affected workloads justify preventive rotation under their own risk policies.",
        },
      ],
    },
    {
      heading: "Detection and evidence of exploitation",
      blocks: [
        {
          type: "p",
          text: "The proof of concept produced a characteristic relationship between writes and reads: a 4 KiB write into an unmapped region triggered the allocation of a reused 64 KiB block and the following reads recovered far more data than the new container had overwritten.",
        },
        {
          type: "p",
          text: "Based on that characteristic, Cloudflare developed **detection signatures** and applied them to the available historical disk I/O telemetry. The review identified activity attributable to the researchers and to Cloudflare engineers under authorized validation, and **no additional activity** compatible with the reported technique.",
        },
        {
          type: "callout",
          callout: {
            kind: "regra",
            title: "Useful signal for monitoring",
            body: "The ratio between a small write and a larger read on the same newly allocated block is a cheap signal to implement in disk telemetry for multi-tenant environments. The pattern is unusual in normal operation and serves both for detection and for validating block reuse hypotheses.",
          },
        },
      ],
    },
    {
      heading: "Recommended actions",
      blocks: [
        {
          type: "p",
          text: "The fix is on the provider side, but exposure assessment is on the customer side. The actions below follow the recommendations of the sources consulted:",
        },
        {
          type: "list",
          items: [
            "Identify workloads that use Cloudflare Containers or Cloudflare Sandboxes.",
            "Assess whether the secrets processed by affected workloads require preventive rotation.",
            "Review sensitive data that could have been stored or processed in those workloads.",
            "Monitor anomalous disk read and write activity in the workloads.",
            "Investigate patterns of 4 KiB writes followed by larger reads on newly allocated blocks.",
            "Review logs and telemetry related to the affected workloads.",
            "Confirm that the fixes published by Cloudflare apply to the environment in use.",
          ],
        },
      ],
    },
    {
      heading: "When the assessment cannot be completed immediately",
      blocks: [
        {
          type: "list",
          items: [
            "Rotate secrets and credentials processed by potentially affected workloads.",
            "Isolate or restrict workloads that handle sensitive information until the assessment is complete.",
            "Prioritize the rotation of the secrets with the broadest reach, such as cloud provider tokens, third-party API keys, and database credentials.",
            "Record the decision and the criterion used, so that the choice is auditable later.",
          ],
        },
      ],
    },
    {
      heading: "What we still do not know / limits of this article",
      blocks: [
        {
          type: "p",
          text: "This article was prepared from the technical analysis published by Cloudflare on September 24, 2026, the Accomplish report, and the publication consulted, with verification on September 25, 2026. There is no CyDef telemetry of its own about this case, no exploitation observed internally, and no attribution of authorship made here.",
        },
        {
          type: "p",
          text: "The sources consulted do not provide a **CVE identifier**, specific versions or builds, nor a list of affected placements by region. The validation numbers come from the researchers themselves and from Cloudflare. There is also, as of the verification date, no public estimate of how many customers or workloads had residual data exposed, since the exposure depended on workload placement and on block reassignment by the allocator. This text will be updated when new verifiable information is available.",
        },
      ],
    },
    {
      heading: "Next steps",
      blocks: [
        {
          type: "list",
          items: [
            "Inventory which teams use Cloudflare Containers or Sandboxes and where production secrets exist in those workloads.",
            "Define a criterion for preventive secret rotation for when a cloud provider reports a cross-tenant isolation flaw.",
            "Add detection of the anomalous I/O pattern (small write followed by a larger read on a newly allocated block) to the monitoring of multi-tenant environments.",
            "Review the reliance on the provider's implicit isolation in threat models for multi-tenant applications.",
            "Follow Cloudflare's technical analysis to incorporate storage architecture lessons into vendor requirements.",
          ],
        },
      ],
    },
  ],
  sources: [
    {
      label:
        "Cloudflare: How Cloudflare addressed a cross-tenant data exposure vulnerability in Containers",
      url: "https://blog.cloudflare.com/containers-cross-tenant-vulnerability/",
    },
    {
      label:
        "Cyber Security News: Cloudflare Containers Vulnerability Could Leak Data Between Customer Workloads",
      url: "https://cybersecuritynews.com/cloudflare-containers-vulnerability/",
    },
    {
      label: "Accomplish: Escaping the Cloudflare Sandbox",
      url: "https://accomplish.ai/blog/escaping-the-cloudflare-sandbox/",
    },
  ],
  changelog: [
    "2026-09-25: first version, based on Cloudflare's technical analysis, the Accomplish report, and the publication consulted.",
  ],
};
