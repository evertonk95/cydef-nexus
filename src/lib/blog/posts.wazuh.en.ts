import type { BlogPost } from "./posts";

/**
 * Wazuh em Movimento: English translation (EN).
 * Source of truth: posts.wazuh.ts (PT canonical, v1, 04/09/2026). Human review via PR.
 */
export const wazuhEmMovimentoPostEn: BlogPost = {
  "slug": "wazuh-em-movimento",
  "title": "Wazuh in Motion: how to assess, stabilize, and mature a SIEM that is already in production",
  "category": "SOC Engineering",
  "excerpt": "A practical framework for anyone who inherits a Wazuh already in production: measure the event path between the source and the analyst, prove drops and coverage gaps, and evolve the SIEM without turning production into a laboratory.",
  "date": "September 4, 2026",
  "dateISO": "2026-09-04",
  "readTime": "31 min read",
  "image": "/assets/blog/wazuh-em-movimento-thumb.webp",
  "author": "Everton Nascimento",
  "authorRole": "Cybersecurity | SOC | Incident Response | Detection Engineering | Wazuh",
  "tags": [
    "Wazuh",
    "SIEM",
    "SOC",
    "Detection Engineering",
    "Blue Team",
    "Security Operations"
  ],
  "toc": true,
  "cta": {
    "title": "This article is part of a larger framework",
    "body": "The CyDef SIEM Health and Maturity Assessment Framework brings together the 14 phases, tables, commands, anonymized case study, quick collection playbook, and final checklist in a versioned, open document.",
    "label": "Explore the framework",
    "to": "/labs/siem-health-maturity-framework"
  },
  "sections": [
    {
      "heading": "Publication note and anonymization",
      "blocks": [
        {
          "type": "callout",
          "callout": {
            "kind": "ponto",
            "title": "Central idea",
            "body": "A Wazuh can look \"green\" on the dashboard, with services active and agents connected, and still lose events, concentrate load on a single node, index too much noise, run on a stale inventory, and deliver less detection coverage than it appears. The assessment exists to prove what happens between the source and the analyst, before you start changing anything."
          }
        },
        {
          "type": "p",
          "text": "This material came out of a recurring scenario in security operations: taking over a Wazuh that already exists, already receives data, and already supports a real operation. The practical examples were derived from a real technical assessment but were deliberately anonymized. No company name, real IP address, hostname, domain, secret, token, or any information that could identify the environment is reproduced in this document. Numbers are presented in aggregate or rounded form when the goal is to demonstrate the reasoning. The focus is not exposing a specific environment: it is showing a methodology that can be reapplied in any organization that needs to understand whether the SIEM is only working or is actually delivering security."
        },
        {
          "type": "callout",
          "callout": {
            "kind": "regra",
            "title": "Golden rule",
            "body": "this article is not a script for blind change. It is an investigation roadmap. In production, first you measure. Then you explain. Only then do you change, with rollback and validation criteria."
          }
        }
      ]
    },
    {
      "heading": "Executive summary",
      "blocks": [
        {
          "type": "p",
          "text": "Most of the content about Wazuh teaches you to install, integrate, and write rules. That is necessary, but there is a less discussed problem: what to do when you inherit an environment that is already in production and you do not know exactly how it was built, which decisions were made, what is being lost, and which controls are actually working."
        },
        {
          "type": "p",
          "text": "In that context, the first task should not be writing more rules, enlarging queues, or adding CPU. The first task should be **making the environment observable**. That means rebuilding the architecture, measuring the event path, comparing load across nodes, identifying drops, reviewing buffers, understanding the log sources, evaluating the Indexer, mapping rules and decoders, measuring detection coverage, reviewing the security of the SIEM itself, and turning all of it into a prioritized action plan."
        },
        {
          "type": "p",
          "text": "The proposed framework divides this activity into phases. Each phase has an objective, questions, evidence, commands, decision criteria, and deliverables. The final result is not a collection of screenshots: it is a technical **AS IS**, a **gap analysis**, a **maturity view**, a **TO BE** design, and a **roadmap** that allows evolving Wazuh without turning production into a laboratory."
        },
        {
          "type": "figure",
          "figure": {
            "src": "/assets/blog/wazuh-em-movimento-fig1.svg",
            "alt": "The path that must be proven during the assessment: from the log source to the analyst.",
            "caption": "The path that must be proven during the assessment: from the log source to the analyst."
          }
        }
      ]
    },
    {
      "heading": "1. The problem almost nobody discusses: getting into a moving car",
      "blocks": [
        {
          "type": "p",
          "text": "Installing Wazuh from scratch is a design problem. Inheriting a Wazuh in production is an investigation problem. In the first case, you choose the architecture, groups, retention, sources, use cases, and capacity criteria. In the second, all of those choices were already made by someone, at some point, under assumptions that may no longer hold."
        },
        {
          "type": "p",
          "text": "The environment may have been deployed in stages. It may have received emergency integrations. It may have been adjusted after incidents. It may carry legacy settings, abandoned rules, agents that no longer exist, open ports for discontinued technologies, queues enlarged without cause analysis, and a cluster that exists in the diagram but does not really distribute load."
        },
        {
          "type": "callout",
          "callout": {
            "kind": "ponto",
            "title": "The most important point",
            "body": "when you take over a SIEM in motion, the first goal is not \"improving the Wazuh\". It is finding out which Wazuh you actually have."
          }
        },
        {
          "type": "p",
          "text": "That is why the assessment must happen before tuning. Tuning modifies symptoms. The assessment explains the system."
        }
      ]
    },
    {
      "heading": "2. The principles that prevent bad diagnoses",
      "blocks": [
        {
          "type": "table",
          "table": {
            "headers": [
              "Principle",
              "Practical application"
            ],
            "rows": [
              [
                "Observe before changing",
                "The first collection must be a snapshot of the current state. Premature changes contaminate the evidence and make it harder to prove the cause."
              ],
              [
                "Separate incident from maturity",
                "An incident can reveal a bottleneck, but it should not constrain the assessment. The cause of the incident and the structural debt must be recorded separately."
              ],
              [
                "Follow the event end to end",
                "When an event \"does not show up\", find out at which layer it stopped existing. Agent, network, remoted, analysisd, alert file, Filebeat, Indexer, and Dashboard are different problems."
              ],
              [
                "A cumulative counter is not a snapshot",
                "Queue usage at zero right now does not invalidate a historical drop counter. Transient spikes disappear fast. Combine current state, counters, and time series."
              ],
              [
                "Cluster does not mean distribution",
                "Two connected Managers can represent a healthy cluster from the synchronization point of view while, at the same time, 99% of the load can sit on a single node."
              ],
              [
                "A bigger queue is not capacity planning",
                "Enlarging the buffer can absorb bursts, but it does not solve sustained generation above processing capacity. In some cases, it only postpones the loss."
              ],
              [
                "Log is not synonymous with value",
                "Collecting everything can be useful for forensics, but making all telemetry compete in the same detection pipeline can reduce the ability to identify what is truly important."
              ],
              [
                "Every change needs a hypothesis and a success criterion",
                "If there is no metric proving that the change worked, it is not complete."
              ]
            ]
          }
        }
      ]
    },
    {
      "heading": "3. The assessment framework",
      "blocks": [
        {
          "type": "p",
          "text": "The sequence below was designed to reduce the risk of premature conclusions. It starts at the infrastructure, crosses the data pipeline, reaches detection quality, and ends in governance and continuous evolution."
        },
        {
          "type": "figure",
          "figure": {
            "src": "/assets/blog/wazuh-em-movimento-fig2.svg",
            "alt": "Overview of the framework phases.",
            "caption": "Overview of the framework phases."
          }
        }
      ]
    },
    {
      "heading": "Phase 0: Preparation, scope, and evidence preservation",
      "blocks": [
        {
          "type": "p",
          "text": "Before the first command, define what the assessment needs to answer. An investigation without clear questions tends to produce hundreds of pieces of evidence without a conclusion."
        },
        {
          "type": "p",
          "text": "**Objectives**"
        },
        {
          "type": "list",
          "items": [
            "Identify the scope: Managers, Workers, Indexers, Dashboard, collectors, agents, integrations, and dependent services.",
            "Define the observation window and the available retention period.",
            "Record the incident or driver without turning the incident into the only objective of the work.",
            "Freeze non-emergency changes during the initial collection, whenever operationally possible.",
            "Define owners for Wazuh, network, firewall, Linux, Windows, database, cloud, and applications for later validations."
          ]
        },
        {
          "type": "p",
          "text": "**What not to collect**"
        },
        {
          "type": "p",
          "text": "Avoid putting secrets inside the assessment. Do not copy `client.keys`, private keys, passwords, tokens, full webhooks, or private certificates. If a secret appears in a configuration file, record the finding and mask the value."
        },
        {
          "type": "callout",
          "callout": {
            "kind": "regra",
            "title": "Good practice",
            "body": "create an evidence directory or repository with date, host, command, owner, and file hash when the context requires traceability. An assessment without organization turns into rework."
          }
        }
      ]
    },
    {
      "heading": "Phase 1: Technical inventory and real architecture",
      "blocks": [
        {
          "type": "p",
          "text": "The first product of the assessment is the AS IS. Do not rely only on an existing diagram: prove the role, version, capacity, interface, service, and dependency of each node."
        },
        {
          "type": "p",
          "text": "**Questions that need to be answered**"
        },
        {
          "type": "list",
          "items": [
            "How many servers make up the solution and what role does each one perform?",
            "Which versions of Wazuh, Filebeat, Indexer, Dashboard, Java, and operating system are installed?",
            "Are CPU, RAM, disk, and inodes sufficient for the current behavior?",
            "Are the clocks synchronized? Is there a timezone difference or clock skew between sources and the SIEM?",
            "Is there pending maintenance, reboot required, patch debt, or excessively long uptime?",
            "Which ports are open and on which interfaces do the services listen?"
          ]
        },
        {
          "type": "p",
          "text": "**Base collection**"
        },
        {
          "type": "code",
          "text": "hostnamectl / ip -br a / timedatectl / uptime / nproc / free -h / df -hT / df -i / lsblk\nsystemctl --failed / /var/ossec/bin/wazuh-control info"
        },
        {
          "type": "p",
          "text": "On Indexers, complement with the package version, JVM, swap, memory limits, and storage usage. In legacy environments, problems that seem to be \"Wazuh problems\" can be memory, swap, disk, or clock pressure."
        },
        {
          "type": "callout",
          "callout": {
            "kind": "exemplo",
            "title": "Anonymized example",
            "body": "in a real assessment, services appeared active and the environment seemed stable. The basic collection revealed clocks without effective synchronization, about 40 seconds of difference between a critical source and the Manager, more than a year of uptime on central components, Indexers with approximately 70% of disk occupied, and relevant swap usage. None of that showed up as a \"Wazuh incident\" on the dashboard."
          }
        }
      ]
    },
    {
      "heading": "Phase 2: Manager cluster and load distribution",
      "blocks": [
        {
          "type": "p",
          "text": "A Wazuh cluster must be evaluated in two dimensions: **synchronization** and **utilization**. The first shows whether the nodes share state. The second shows whether the horizontal capacity is actually being used."
        },
        {
          "type": "p",
          "text": "**Essential collections**"
        },
        {
          "type": "code",
          "text": "sudo /var/ossec/bin/wazuh-control status\nsudo /var/ossec/bin/cluster_control -l\nsudo /var/ossec/bin/cluster_control -i more\nsudo /var/ossec/bin/cluster_control -a"
        },
        {
          "type": "p",
          "text": "The Wazuh documentation recommends distributing agent connections across nodes and presents the load balancer as the preferred approach for clustered environments [1][2]."
        },
        {
          "type": "p",
          "text": "**What to measure**"
        },
        {
          "type": "table",
          "table": {
            "headers": [
              "Metric",
              "Why it matters"
            ],
            "rows": [
              [
                "Active agents per node",
                "Shows whether the capacity is distributed or whether a Manager became a concentration point."
              ],
              [
                "TCP sessions per node",
                "Helps confirm the distribution observed in cluster_control."
              ],
              [
                "Events per node",
                "Compares real load, not only the number of agents."
              ],
              [
                "Synchronization of groups, rules, and decoders",
                "Prevents a Worker from processing with a different configuration."
              ],
              [
                "Failures in cluster.log",
                "Reveals transient integrity or connectivity problems."
              ]
            ]
          }
        },
        {
          "type": "callout",
          "callout": {
            "kind": "exemplo",
            "title": "Anonymized example",
            "body": "the cluster had an apparently healthy Master and Worker. However, 97 active agents were on the Master and only 1 on the Worker. The same imbalance appeared in the TCP sessions. The lesson is simple: having a cluster does not mean having distribution."
          }
        },
        {
          "type": "p",
          "text": "**Conclusion that the assessment must produce:** classify the cluster as *synchronized or not synchronized* and, separately, as *balanced or unbalanced*. Do not mix the two concepts."
        }
      ]
    },

    {
      "heading": "Phase 3: Ingestion pipeline, queues, and drops",
      "blocks": [
        {
          "type": "p",
          "text": "This phase answers the most important question of a SIEM: **is everything that reaches the environment fully processed?** The answer must be based on counters, not on feeling."
        },
        {
          "type": "p",
          "text": "**Start with remoted and analysisd**"
        },
        {
          "type": "code",
          "text": "sudo cat /var/ossec/var/run/wazuh-remoted.state\nsudo cat /var/ossec/var/run/wazuh-analysisd.state"
        },
        {
          "type": "p",
          "text": "The `wazuh-analysisd.state` file is updated periodically and exposes received, processed, and discarded events, plus the utilization and size of the internal queues [6]. Wazuh also provides detailed statistics per event type through the API. If the queue selected in analysisd is full, the event is discarded [7][8]."
        },
        {
          "type": "p",
          "text": "**Why separate remoted from analysisd**"
        },
        {
          "type": "p",
          "text": "remoted receives events from agents over secure connections. analysisd, in turn, processes different categories of events. A `discarded_count` of zero in remoted does not prove that the pipeline is healthy: the drop can happen later."
        },
        {
          "type": "callout",
          "callout": {
            "kind": "exemplo",
            "title": "Anonymized example",
            "body": "in a real environment, remoted showed zero discards, while analysisd accumulated more than 211 thousand discarded events. The breakdown showed that more than 209 thousand were Syslog, and Syslog represented approximately three quarters of the load received by the analysis engine. The counters belonged to less than two days of daemon uptime, not the server's long uptime. The problem stopped being \"Wazuh is losing events\" and became \"analysisd is discarding Syslog\". That shift in precision transforms the action plan."
          }
        },
        {
          "type": "p",
          "text": "**Do not confuse current state with history**"
        },
        {
          "type": "p",
          "text": "It is common to find `event_queue_usage` at 0% while `events_dropped` is greater than zero. This happens when the saturation was transient. To capture the behavior, monitor the state file at short intervals during load periods."
        },
        {
          "type": "code",
          "text": "while true; do\n  echo \"===== $(date -Is) =====\"\n  grep -E \"events_received|events_dropped|event_queue_usage|rule_matching_queue_usage\" \\\n    /var/ossec/var/run/wazuh-analysisd.state\n  sleep 5\ndone | tee /tmp/analysisd_watch.log"
        },
        {
          "type": "p",
          "text": "**Use the breakdown to locate the event type**"
        },
        {
          "type": "p",
          "text": "Adjusting all queues at the same time is a poor response. The documentation itself recommends observing which categories present drops and adjusting only what needs to be adjusted [8]. The investigation must answer: Syslog? EventChannel? Logcollector? Syscheck? Syscollector? Rule matching? The answer defines the next step."
        },
        {
          "type": "p",
          "text": "If the internal queues remain at the default value of 16,384 and there is proven drop, that becomes evidence for capacity analysis. The default value alone is not a problem. The problem is keeping the default when facing behavior that has already shown it can exceed the momentary capacity."
        }
      ]
    },
    {
      "heading": "3.1: When the problem is Syslog",
      "blocks": [
        {
          "type": "p",
          "text": "Remote Syslog deserves its own track, because the remote agent event queue does not apply to Syslog. In Wazuh, the `queue_size` of the `remote` block in a `secure` connection is related to agent events, not to Syslog events [9]."
        },
        {
          "type": "code",
          "text": "sudo grep -n -A15 -B3 '<remote>' /var/ossec/etc/ossec.conf\nsudo ss -lunp | grep -E ':<PORTA1>|:<PORTA2>|:<PORTA3>'"
        },
        {
          "type": "p",
          "text": "Map protocol, port, allowed-ips, listening interface, and redundancy. Syslog over UDP must be treated with attention because the loss can happen before the event reaches the application and, therefore, does not appear in the analysisd drop counter."
        },
        {
          "type": "callout",
          "callout": {
            "kind": "exemplo",
            "title": "Anonymized example",
            "body": "in a 60-second window, virtually all observed Syslog belonged to firewalls, with close to 1,000 datagrams per second. Two sources accounted for about 95% of the volume. The Worker received zero Syslog: the entire flow was concentrated on the Master over UDP."
          }
        }
      ]
    },
    {
      "heading": "3.2: Find out the content before reducing the volume",
      "blocks": [
        {
          "type": "p",
          "text": "High volume is not synonymous with noise. In a firewall analysis, the profile of the three main sources showed approximately 72% to 81% of TRAFFIC and 17% to 26% of THREAT. That completely changes the decision: filtering indiscriminately could eliminate important telemetry."
        },
        {
          "type": "p",
          "text": "The goal is to classify what needs to be analyzed in real time, what needs to be retained for investigation, and what represents repetitive operational telemetry. THREAT, SYSTEM, USERID, authentication, administrative changes, and security events usually require priority. Allowed TRAFFIC can have high forensic value, but it needs to be sized and handled consciously."
        }
      ]
    },
    {
      "heading": "3.3: Use archives to discover top talkers",
      "blocks": [
        {
          "type": "p",
          "text": "When archives are enabled, they allow analyzing every received event, including those that did not generate alerts [10]. This is extremely useful for discovering origins, locations, applications, and volume patterns."
        },
        {
          "type": "code",
          "text": "sudo tail -n 500000 /var/ossec/logs/archives/archives.json | \\\n  jq -r '.location // \"sem_location\"' | sort | uniq -c | sort -nr | head -50"
        },
        {
          "type": "p",
          "text": "Mind the cost: archives can consume storage significantly and must be part of capacity planning and the retention policy [10]."
        }
      ]
    },
    {
      "heading": "Phase 4: Agents, client_buffer, groups, and lifecycle",
      "blocks": [
        {
          "type": "p",
          "text": "Phase 3 looks at what happens on the Manager. Phase 4 looks at what may be lost before the event reaches the Manager. This is where client_buffer, antiflooding, groups, synchronization, and inventory hygiene come in."
        }
      ]
    },
    {
      "heading": "4.1: Inventory groups and centralized configuration",
      "blocks": [
        {
          "type": "code",
          "text": "sudo /var/ossec/bin/agent_groups -l\nsudo find /var/ossec/etc/shared -maxdepth 2 -type f -name 'agent.conf' -print\nsudo grep -Rni -A8 -B3 '<client_buffer>' /var/ossec/etc/shared/"
        },
        {
          "type": "p",
          "text": "Wazuh allows distributing configuration through `agent.conf`, and an agent can belong to several groups. Configurations are merged, and in case of conflict the last group has higher priority [5]. Therefore, \"the agent is in the Windows group\" is not enough: you need to understand the **resulting configuration**."
        }
      ]
    },
    {
      "heading": "4.2: Understand client_buffer before touching it",
      "blocks": [
        {
          "type": "p",
          "text": "By default, client_buffer has a `queue_size` of 5,000 events and an `events_per_second` of 500. The allowed size goes up to 100,000 and the throughput up to 1,000 EPS [3]."
        },
        {
          "type": "code",
          "text": "<client_buffer>\n  <disabled>no</disabled>\n  <queue_size>5000</queue_size>\n  <events_per_second>500</events_per_second>\n</client_buffer>"
        },
        {
          "type": "callout",
          "callout": {
            "kind": "ponto",
            "title": "Critical point",
            "body": "a large buffer does not automatically increase the drain capacity. If the agent produces 800 EPS on a sustained basis and can only transmit 500 EPS, the queue grows 300 events per second until it is full."
          }
        },
        {
          "type": "p",
          "text": "With a `queue_size` of 100,000, a sustained difference of 300 EPS would fill the queue in just over five minutes. That is why `queue_size` and `events_per_second` must be evaluated together."
        }
      ]
    },
    {
      "heading": "4.3: Look for antiflooding evidence",
      "blocks": [
        {
          "type": "p",
          "text": "Wazuh rules 202 to 205 help identify the state of the agent queue. Rule 203 indicates a full queue and alerts that events may be lost; 204 indicates flooding; 205 records the return to normal [4][8]."
        },
        {
          "type": "table",
          "table": {
            "headers": [
              "Rule ID",
              "Operational interpretation"
            ],
            "rows": [
              [
                "202",
                "Queue reached the warning level, 90% by default."
              ],
              [
                "203",
                "Queue full. Events may be lost."
              ],
              [
                "204",
                "Queue in flooded state. Investigate configuration and event generation."
              ],
              [
                "205",
                "Queue returned to the normal level."
              ]
            ]
          }
        },
        {
          "type": "p",
          "text": "Search a representative period, for example 30 days, and aggregate by `agent.name` and `rule.id`. The raw count of rule 203 is not equal to the number of incidents, because the rule can repeat while the queue remains full. Build **episodes** from the sequence 202 → 203/204 → 205."
        },
        {
          "type": "callout",
          "callout": {
            "kind": "exemplo",
            "title": "Anonymized example",
            "body": "in 30 days, an environment presented 908 antiflooding alerts, corresponding to 83 distinct saturation episodes. There were 681 queue full records, and in 47 episodes the queue reached the flooded state. Four agents concentrated the entire problem. The buffer was already configured at 100,000 events (the maximum limit) and the throughput remained at 500 EPS. One of the top talkers was precisely the only agent connected to the Worker, while the Worker presented no drops. That cross-reference was decisive: the bottleneck in that case was on the agent itself or in local generation, not on the Manager's capacity. The conclusion was not \"enlarge the queue\": the queue was already at its maximum. The investigation became \"which local workload produces the burst and why?\"."
          }
        }
      ]
    },
    {
      "heading": "4.4: Look for temporal patterns and local causality",
      "blocks": [
        {
          "type": "p",
          "text": "On one of the Linux agents, flooding episodes appeared repeatedly around the same time of day. That is a signal to correlate cron, systemd timers, backups, pipelines, log rotation, scanners, FIM, and application jobs. On a database server, the largest episode remained saturated for about ten minutes. These are problems that require host analysis, not Manager analysis."
        }
      ]
    },
    {
      "heading": "4.5: Do not confuse disconnected agents with a current failure",
      "blocks": [
        {
          "type": "p",
          "text": "An inventory with many disconnected agents can indicate a serious problem, or just historical debt. Use `lastKeepAlive`, `disconnection_time`, and reconciliation with the CMDB. In a real case, there were 235 registered agents, 137 disconnected, but 136 of those had not communicated for at least 30 days and dozens had not reported for more than a year. The correct reading was \"unhygienic inventory\", not \"58% of the fleet went down today\"."
        }
      ]
    },
    {
      "heading": "4.6: Check group consistency and synchronization",
      "blocks": [
        {
          "type": "p",
          "text": "Compare the detected operating system, assigned groups, and `group_config_status`. In an analyzed environment, all 98 active agents were synced. Only three active agents were outside the specialized group expected for the operating system. That detail avoided an unfair conclusion that the entire group model was broken."
        }
      ]
    },
    {
      "heading": "4.7: Versioning is also maturity",
      "blocks": [
        {
          "type": "p",
          "text": "Record agent versions and compare them with the Manager. Excessive fragmentation indicates the absence of a lifecycle. By default, Wazuh does not accept agents with a version higher than the Manager when the `allow_higher_versions` option remains disabled [11]. Even when communication works, the assessment must record the condition outside the guaranteed compatibility baseline and propose an update policy."
        }
      ]
    },

    {
      "heading": "Phase 5: Log source coverage and telemetry quality",
      "blocks": [
        {
          "type": "p",
          "text": "After proving that the pipeline works, comes the most uncomfortable question: **are we receiving what we should be receiving?** A SIEM can process millions of events and still be blind to the assets that truly matter."
        },
        {
          "type": "p",
          "text": "**Build a Log Source Coverage matrix**"
        },
        {
          "type": "table",
          "table": {
            "headers": [
              "Source",
              "Security value",
              "Questions"
            ],
            "rows": [
              [
                "Windows Security",
                "Identity, authentication, privilege",
                "Integrated? Channels? Retention?"
              ],
              [
                "PowerShell",
                "Execution and administration",
                "Operational and ScriptBlock?"
              ],
              [
                "Sysmon",
                "Endpoint telemetry",
                "Does it exist? Configuration? Noise?"
              ],
              [
                "Linux auth/auditd",
                "Authentication and privileged activity",
                "Which hosts and rules?"
              ],
              [
                "Firewall/WAF/F5",
                "Network, attacks, policies",
                "Protocol, EPS, log type, criticality"
              ],
              [
                "AD/Entra/IdP",
                "Identity",
                "Sign-in, admin, MFA, and changes coverage"
              ],
              [
                "DNS/Proxy/VPN",
                "Browsing and remote access",
                "Sources, volume, and use cases"
              ],
              [
                "Cloud",
                "CloudTrail, Azure, GCP, etc.",
                "Accounts, regions, buckets, APIs"
              ],
              [
                "EDR/XDR",
                "Endpoint detection",
                "Integration and redundancy"
              ],
              [
                "Critical databases and applications",
                "Transactions and audit trail",
                "Useful events and volume"
              ]
            ]
          }
        },
        {
          "type": "p",
          "text": "Do not evaluate only \"integrated or not\". Record volume, format, decoder, timestamp, criticality, owner, dependent use cases, and data quality."
        },
        {
          "type": "p",
          "text": "**What to do with a very high-volume source**"
        },
        {
          "type": "list",
          "items": [
            "Prove who generates the volume and at what time.",
            "Classify event types and severities.",
            "Find out whether a few policies or applications generate most of the logs.",
            "Separate telemetry needed for real-time detection from telemetry aimed at hunting and forensics.",
            "Evaluate noise reduction at the source before increasing infrastructure.",
            "Preserve high-value events and validate any filter against existing use cases."
          ]
        }
      ]
    },
    {
      "heading": "Phase 6: Alert transport, Indexer, and Dashboard",
      "blocks": [
        {
          "type": "p",
          "text": "The event can be processed and still not appear in the Dashboard. That is why the investigation must continue after `alerts.json`."
        }
      ]
    },
    {
      "heading": "6.1: Filebeat and forwarding",
      "blocks": [
        {
          "type": "code",
          "text": "sudo systemctl status filebeat --no-pager -l\nsudo filebeat test config\nsudo filebeat test output\nsudo journalctl -u filebeat --since \"24 hours ago\" --no-pager"
        },
        {
          "type": "p",
          "text": "Look for retries, timeout, connection reset, bulk errors, backoff, TLS failure, and backlog. The goal is to answer: did the Manager generate the alert but the transport fail?"
        }
      ]
    },
    {
      "heading": "6.2: Indexer health",
      "blocks": [
        {
          "type": "code",
          "text": "curl -k -u <usuario> https://localhost:9200/_cluster/health?pretty\ncurl -k -u <usuario> https://localhost:9200/_cat/nodes?v\ncurl -k -u <usuario> https://localhost:9200/_cat/indices?v\ncurl -k -u <usuario> https://localhost:9200/_cat/shards?v\ncurl -k -u <usuario> https://localhost:9200/_cat/thread_pool/write?v"
        },
        {
          "type": "callout",
          "callout": {
            "kind": "aviso",
            "title": "Warning",
            "body": "never put a password in evidence or in a screenshot. Use interactive input, a protected variable, or a proper authentication mechanism."
          }
        }
      ]
    },
    {
      "heading": "6.3: Memory, heap, and swap",
      "blocks": [
        {
          "type": "p",
          "text": "The Wazuh documentation recommends avoiding the Indexer JVM being swapped and suggests a heap around half of the RAM, with Xms and Xmx equal [12]."
        },
        {
          "type": "code",
          "text": "grep -E '^-Xm[sx]' /etc/wazuh-indexer/jvm.options\nswapon --show\nsysctl vm.swappiness\nsystemctl show wazuh-indexer -p LimitMEMLOCK\nPID=$(pgrep -f 'org.opensearch.bootstrap.OpenSearch' | head -1)\ngrep -E 'VmRSS|VmSwap' /proc/$PID/status"
        },
        {
          "type": "callout",
          "callout": {
            "kind": "exemplo",
            "title": "Anonymized example",
            "body": "two Indexers had the same storage volume and quite different memory resources. One of them used 100% of the configured swap and the other showed relevant usage. Both were close to 70% of disk occupancy. That alone did not prove the cause of the drops, but it required investigation before any ingestion growth."
          }
        }
      ]
    },
    {
      "heading": "6.4: High availability and quorum",
      "blocks": [
        {
          "type": "p",
          "text": "OpenSearch uses quorum for cluster decisions. With two voting nodes, fault tolerance is zero: both must remain available to keep a majority. Three voting nodes tolerate the loss of one [13]. Therefore, saying \"there are two Indexers, so there is HA\" is not enough. You must verify `node.roles`, voting configuration, replicas, and behavior during failure."
        }
      ]
    },
    {
      "heading": "Phase 7: Wazuh functional controls",
      "blocks": [
        {
          "type": "p",
          "text": "After stabilizing infrastructure and pipeline, review what the platform is effectively doing on the endpoints. Classify each module as **nonexistent, default, customized, validated, or monitored**."
        },
        {
          "type": "table",
          "table": {
            "headers": [
              "Module",
              "What to verify"
            ],
            "rows": [
              [
                "FIM / syscheck",
                "Directories, frequency, realtime/whodata, report_changes, exclusions"
              ],
              [
                "SCA",
                "Applied policies, coverage, periodicity, exceptions"
              ],
              [
                "Syscollector",
                "Hardware, software, ports, and processes inventory"
              ],
              [
                "Vulnerability Detection",
                "Feeds, coverage, delay, and remediation"
              ],
              [
                "Rootcheck",
                "Scope and operational relevance"
              ],
              [
                "Logcollector",
                "Files, EventChannel, commands, and applications"
              ],
              [
                "Active Response",
                "Enabled actions, safety, scope, and rollback"
              ],
              [
                "Integrations",
                "Cloud, Office 365, APIs, CTI, notifications"
              ],
              [
                "Agent upgrade",
                "Versioning and rollout policy"
              ],
              [
                "Labels",
                "Business context, criticality, and ownership"
              ]
            ]
          }
        },
        {
          "type": "p",
          "text": "Maturity shows up when the configuration is explainable. \"It is enabled\" is only the first level."
        }
      ]
    },
    {
      "heading": "Phase 8: Rules, decoders, and Detection Engineering",
      "blocks": [
        {
          "type": "p",
          "text": "A mature Wazuh is not measured by the number of installed rules. It is measured by the ability to detect relevant behaviors with reliable data, low noise, and a defined operational response."
        },
        {
          "type": "p",
          "text": "**Minimum inventory**"
        },
        {
          "type": "code",
          "text": "/var/ossec/etc/rules/\n/var/ossec/etc/decoders/\n/var/ossec/etc/rules/local_rules.xml\n/var/ossec/etc/decoders/local_decoder.xml"
        },
        {
          "type": "list",
          "items": [
            "How many custom rules exist?",
            "Which rules alert the most?",
            "Which rules never alerted?",
            "Which rules depend on a log source that no longer exists?",
            "Which technologies arrive without an adequate decoder?",
            "Which rules generate recurring false positives?",
            "Which rules have an owner and an associated playbook?"
          ]
        },
        {
          "type": "p",
          "text": "**Build a use case catalog**"
        },
        {
          "type": "table",
          "table": {
            "headers": [
              "ID",
              "Use case",
              "Source",
              "MITRE",
              "Detection",
              "Status"
            ],
            "rows": [
              [
                "UC-001",
                "Identity brute force",
                "Windows/IdP",
                "T1110",
                "Rule / correlation",
                "Validate"
              ],
              [
                "UC-002",
                "Suspicious PowerShell",
                "Windows",
                "T1059.001",
                "EventChannel / Sysmon",
                "Validate"
              ],
              [
                "UC-003",
                "Privilege escalation",
                "Windows/Linux",
                "T1548",
                "Rules and context",
                "Validate"
              ],
              [
                "UC-004",
                "Persistence",
                "Endpoint",
                "Various",
                "FIM / events",
                "Validate"
              ],
              [
                "UC-005",
                "Web attack",
                "WAF/F5",
                "Various",
                "Decoder / rule",
                "Validate"
              ],
              [
                "UC-006",
                "Lateral movement",
                "Endpoint/Network",
                "Various",
                "Correlation",
                "Validate"
              ]
            ]
          }
        },
        {
          "type": "p",
          "text": "The question that operations must be able to answer is: **what exactly was this SIEM designed to detect?**"
        }
      ]
    },
    {
      "heading": "Phase 9: Alert quality and SOC operations",
      "blocks": [
        {
          "type": "p",
          "text": "A healthy SIEM can be operationally useless if the analyst receives thousands of repetitive alerts without context. That is why the assessment must leave the infrastructure and enter the SOC routine."
        },
        {
          "type": "list",
          "items": [
            "Top 20 rules by volume.",
            "Alerts by severity, agent, user, technology, and time of day.",
            "Rules with high repetition and low operational action.",
            "Known false positives and existing tuning.",
            "Alerts without a playbook or owner.",
            "MTTA, MTTR, and SLA adherence when available.",
            "Context quality: hostname, user, IP, MITRE technique, critical asset, owner, and investigation link."
          ]
        },
        {
          "type": "callout",
          "callout": {
            "kind": "regra",
            "title": "Practical rule",
            "body": "a million alerts are not evidence of good detection. It can be evidence that the SIEM is turning telemetry into noise."
          }
        }
      ]
    },
    {
      "heading": "Phase 10: Security of the SIEM itself",
      "blocks": [
        {
          "type": "p",
          "text": "The SIEM concentrates sensitive telemetry, integration credentials, inventory, and response capability. It must be treated as a critical asset."
        },
        {
          "type": "table",
          "table": {
            "headers": [
              "Control",
              "Questions"
            ],
            "rows": [
              [
                "TLS and certificates",
                "Validity, chain, algorithm, expiration, key distribution"
              ],
              [
                "RBAC",
                "Least privilege, administrative accounts, SOC profiles"
              ],
              [
                "MFA/SSO",
                "Integration, enforcement for privileged accounts"
              ],
              [
                "API",
                "Network exposure, authentication, and audit"
              ],
              [
                "Dashboard",
                "Exposure, TLS, session, and administrative access"
              ],
              [
                "SSH",
                "Allowed origin, keys, root, logging"
              ],
              [
                "Firewall/ACL",
                "Strictly necessary ports"
              ],
              [
                "Secrets",
                "Tokens, webhooks, passwords, and private keys out of plaintext"
              ],
              [
                "Legacy configuration",
                "Listeners and integrations of discontinued products"
              ]
            ]
          }
        },
        {
          "type": "callout",
          "callout": {
            "kind": "exemplo",
            "title": "Anonymized example",
            "body": "during a configuration review, a legacy Syslog listener was found still active for a technology that no longer existed in the environment, accepting a broad origin, plus an old webhook stored in plaintext inside commented-out configuration. Another critical listener also used an overly permissive allowlist. The environment worked, but the exposure surface had grown silently. The correct fix is to inventory legitimate sources, validate network ACLs, and only then restrict or remove listeners, so that valid telemetry is not interrupted."
          }
        }
      ]
    },
    {
      "heading": "Phase 11: Backup, Disaster Recovery, and resilience",
      "blocks": [
        {
          "type": "p",
          "text": "The question is not \"is there a backup?\". The question is **\"how long does it take to recover the SIEM and how much data can be lost?\"**"
        },
        {
          "type": "list",
          "items": [
            "Backup of `ossec.conf`, `agent.conf`, rules, decoders, CDB lists, and integration settings.",
            "Protection and recovery of certificates and secrets through a secure mechanism.",
            "Indexer snapshots and retention policy.",
            "Documented and tested restore procedure.",
            "Defined RTO and RPO.",
            "Failure test of Manager, Worker, Indexer, and Dashboard.",
            "Validation of agent behavior during unavailability.",
            "Validation of quorum and replicas in OpenSearch."
          ]
        },
        {
          "type": "p",
          "text": "A backup that was never restored is only a recovery hypothesis."
        }
      ]
    },
    {
      "heading": "Phase 12: Capacity planning and monitoring the SIEM itself",
      "blocks": [
        {
          "type": "p",
          "text": "Capacity planning turns growth into an early decision. Without it, the environment only finds out that it grew too much when the incident has already happened."
        },
        {
          "type": "p",
          "text": "**Minimum metrics**"
        },
        {
          "type": "table",
          "table": {
            "headers": [
              "Category",
              "Metrics"
            ],
            "rows": [
              [
                "Ingestion",
                "Average EPS, peak EPS, events/day, alerts/day, bytes/day"
              ],
              [
                "Managers",
                "CPU, RAM, queues, drops, threads, sessions, agents per node"
              ],
              [
                "Agents",
                "buffer usage, rules 202–205, local EPS, top talkers"
              ],
              [
                "Indexer",
                "CPU, heap, swap, write rejected, shards, replicas, search latency"
              ],
              [
                "Storage",
                "GB/day, retention, growth, watermark, archives"
              ],
              [
                "Operations",
                "FP rate, alerts per rule, MTTA, MTTR, SLA"
              ]
            ]
          }
        },
        {
          "type": "p",
          "text": "**The SIEM must monitor the SIEM**"
        },
        {
          "type": "list",
          "items": [
            "Agent disconnected above the baseline.",
            "Agent buffer warning, full, or flooded.",
            "`events_dropped` greater than zero.",
            "Cluster node unavailable.",
            "Indexer cluster yellow/red.",
            "Disk above defined thresholds.",
            "Heap pressure, swap, or write rejection.",
            "Filebeat without connectivity.",
            "Certificate close to expiring.",
            "Backup or snapshot failing.",
            "Ingestion stopped or EPS abnormally high/low."
          ]
        },
        {
          "type": "callout",
          "callout": {
            "kind": "regra",
            "title": "Maturity goal",
            "body": "the SOC must find out that the SIEM is sick before finding out that logs were missing during an incident."
          }
        }
      ]
    },

    {
      "heading": "Phase 13: Turning evidence into maturity and an action plan",
      "blocks": [
        {
          "type": "p",
          "text": "Collection only creates value when it ends in a decision. Screenshots and outputs are raw material. The final product is a plan that links evidence to risk, action, and validation."
        },
        {
          "type": "figure",
          "figure": {
            "src": "/assets/blog/wazuh-em-movimento-fig3.svg",
            "alt": "The chain that turns technical collection into controlled improvement.",
            "caption": "The chain that turns technical collection into controlled improvement."
          }
        }
      ]
    },
    {
      "heading": "13.1: Gap register model",
      "blocks": [
        {
          "type": "table",
          "table": {
            "headers": [
              "Field",
              "Example"
            ],
            "rows": [
              [
                "ID",
                "WAZUH-ING-001"
              ],
              [
                "Domain",
                "Ingestion"
              ],
              [
                "Finding",
                "Events discarded by analysisd"
              ],
              [
                "Evidence",
                "state/API with counter and breakdown"
              ],
              [
                "Probable cause",
                "Transient saturation in a specific category"
              ],
              [
                "Impact",
                "Telemetry loss before correlation"
              ],
              [
                "Risk",
                "Possible loss of a security event"
              ],
              [
                "Priority",
                "P0"
              ],
              [
                "Action",
                "Treat source, distribution, capacity, and tuning"
              ],
              [
                "Rollback",
                "Restore the previous configuration"
              ],
              [
                "Validation",
                "events_dropped remains stable with zero increment"
              ],
              [
                "KPI",
                "Drops/hour, peak EPS, queue usage"
              ]
            ]
          }
        }
      ]
    },
    {
      "heading": "13.2: Prioritization",
      "blocks": [
        {
          "type": "table",
          "table": {
            "headers": [
              "Priority",
              "When to use"
            ],
            "rows": [
              [
                "P0",
                "Data loss, risk of blindness, unavailability, critical exposure, directly exploitable security failure."
              ],
              [
                "P1",
                "High availability, distribution, capacity, architecture, and high risks that can generate P0."
              ],
              [
                "P2",
                "Log coverage, detection, tuning, lifecycle, and operational quality."
              ],
              [
                "P3",
                "Optimization, dashboards, automation, documentation, and incremental governance."
              ]
            ]
          }
        }
      ]
    },
    {
      "heading": "13.3: Maturity score",
      "blocks": [
        {
          "type": "table",
          "table": {
            "headers": [
              "Score",
              "Meaning"
            ],
            "rows": [
              [
                "0",
                "Nonexistent"
              ],
              [
                "1",
                "Initial or default, without management"
              ],
              [
                "2",
                "Implemented"
              ],
              [
                "3",
                "Managed and measured"
              ],
              [
                "4",
                "Optimized and continuously improved"
              ]
            ]
          }
        },
        {
          "type": "p",
          "text": "Apply the scale per domain: architecture, high availability, agents, log sources, ingestion, performance, storage, rules/decoders, detection, FIM, SCA, vulnerabilities, IAM/RBAC, hardening, backup/DR, monitoring, and governance."
        }
      ]
    },
    {
      "heading": "14. Anonymized case study: how several small \"normalities\" add up",
      "blocks": [
        {
          "type": "p",
          "text": "The value of the framework appears when the findings stop being treated in isolation. The case below summarizes patterns found in a single real assessment, without any identification of the environment."
        },
        {
          "type": "table",
          "table": {
            "headers": [
              "Domain",
              "Observed pattern"
            ],
            "rows": [
              [
                "Infrastructure",
                "Services active, but clocks without effective synchronization, observable clock skew, very long uptime, and pending maintenance."
              ],
              [
                "Managers",
                "Synchronized cluster, yet 97 active agents on one node and only 1 on the other."
              ],
              [
                "Ingestion",
                "remoted without discards, analysisd with more than 211 thousand drops."
              ],
              [
                "Syslog",
                "More than 99% of the drops belonged to Syslog; flow concentrated on the firewall and received over UDP on the Master."
              ],
              [
                "Top talkers",
                "A few sources accounted for almost the entire Firewall volume, close to 1,000 datagrams/s in an observed window."
              ],
              [
                "Quality",
                "Firewalls were not sending only noise. There was a consistent mix of TRAFFIC and THREAT, requiring ingestion engineering instead of a blind filter."
              ],
              [
                "Agents",
                "client_buffer at 100,000 events and 500 EPS, yet 83 saturation episodes in 30 days, with flooding in part of them."
              ],
              [
                "Inventory",
                "235 registered agents, 137 disconnected, but almost all disconnected ones were historical and needed inventory sanitation."
              ],
              [
                "Synchronization",
                "100% of the active agents had group_config_status synced."
              ],
              [
                "Lifecycle",
                "Fleet fragmented across several agent versions, including agents newer than the Manager and duplicated legacy records."
              ],
              [
                "Indexer",
                "Storage close to 70%, relevant swap, and memory asymmetry between nodes."
              ],
              [
                "Hardening",
                "Legacy listener, broad allowlist, and an old secret found in the configuration."
              ],
              [
                "Retention",
                "Enabled archives generated current files in the tens of gigabytes, reinforcing the need for a retention policy and capacity planning."
              ],
              [
                "Resilience",
                "The topology needed to be validated regarding quorum, replicas, and real fault tolerance."
              ]
            ]
          }
        },
        {
          "type": "p",
          "text": "None of these items alone describes the environment. Together, they tell a story: the Wazuh was functional, but there was debt in architecture, ingestion, lifecycle, security, and capacity. The tool did not need to be replaced. It needed to be understood and matured."
        }
      ]
    },
    {
      "heading": "15. The most common traps when inheriting a Wazuh",
      "blocks": [
        {
          "type": "table",
          "table": {
            "headers": [
              "Dangerous shortcut",
              "Why it fails"
            ],
            "rows": [
              [
                "\"Increase the queue\"",
                "Can hide the problem for longer. First find out who produces the burst, which queue saturates, and whether the generation is necessary."
              ],
              [
                "\"There are two nodes, so there is HA\"",
                "Distribution, quorum, replicas, and failover must be proven."
              ],
              [
                "\"The dashboard is green\"",
                "Visual health does not guarantee pipeline integrity."
              ],
              [
                "\"There are many disconnected, so half the fleet is down\"",
                "Compare lastKeepAlive and CMDB before declaring impact."
              ],
              [
                "\"Let us filter ALLOW\"",
                "Network telemetry can be important for hunting, and the same flow can carry THREAT events."
              ],
              [
                "\"Everything on default is bad\"",
                "Default is only a problem when it does not serve the observed behavior. Do not confuse customization with maturity."
              ],
              [
                "\"More alerts means more security\"",
                "Volume without context and playbook can reduce the SOC's capacity."
              ],
              [
                "\"A backup exists\"",
                "Without a restore test, RTO, and RPO, there is no evidence of recoverability."
              ],
              [
                "\"Update the agents and then the Manager\"",
                "Lifecycle must respect compatibility and rollout policy."
              ]
            ]
          }
        }
      ]
    },
    {
      "heading": "16. How to turn the assessment into a roadmap",
      "blocks": [
        {
          "type": "p",
          "text": "After the collection, group actions into waves. This reduces risk and shows value early."
        },
        {
          "type": "table",
          "table": {
            "headers": [
              "Wave",
              "Objective",
              "Examples"
            ],
            "rows": [
              [
                "0. Containment",
                "Stop loss or critical exposure",
                "Drops, exposed secret, unnecessary listener, cluster red."
              ],
              [
                "1. Stabilization",
                "Make the pipeline operate predictably",
                "NTP, distribution, buffers, sources, Filebeat, Indexer."
              ],
              [
                "2. Architecture",
                "Remove single points and prepare growth",
                "Load balancer, Syslog relay, quorum, replicas, storage."
              ],
              [
                "3. Detection Engineering",
                "Improve what the SIEM detects",
                "Decoders, rules, use cases, MITRE, tuning."
              ],
              [
                "4. Operations",
                "Turn detection into response",
                "Playbooks, ownership, SLA, dashboards, KPIs."
              ],
              [
                "5. Continuous optimization",
                "Avoid regression",
                "Self monitoring, capacity review, lifecycle, maturity reassessment."
              ]
            ]
          }
        },
        {
          "type": "p",
          "text": "Each action must have an owner, dependency, effort, change risk, change window when applicable, rollback, acceptance criteria, and post-change metric."
        }
      ]
    },
    {
      "heading": "17. Acceptance criteria worth more than \"it worked\"",
      "blocks": [
        {
          "type": "table",
          "table": {
            "headers": [
              "Domain",
              "Acceptance criterion"
            ],
            "rows": [
              [
                "Drops",
                "No increment in events_dropped during the defined normal and peak windows."
              ],
              [
                "Agent buffer",
                "Zero recurring rule 203/204 after treating top talkers, except for a documented exception."
              ],
              [
                "Distribution",
                "Load across Managers within the defined operational range, not just agents \"spread out\"."
              ],
              [
                "Indexer",
                "Expected cluster health, no write rejection, heap and swap within limits, storage with headroom."
              ],
              [
                "Log sources",
                "Critical sources inventoried, with owner, format, volume, and mapped use cases."
              ],
              [
                "Detection",
                "Use cases tested with evidence of firing and a playbook."
              ],
              [
                "Inventory",
                "Stale agents reconciled and a decommissioning process established."
              ],
              [
                "Resilience",
                "Failover and restore tested with measured RTO/RPO."
              ],
              [
                "Security",
                "No secret in plaintext, reviewed RBAC, and strictly necessary listeners."
              ]
            ]
          }
        }
      ]
    },
    {
      "heading": "18. Quick collection playbook (appendix)",
      "blocks": [
        {
          "type": "p",
          "text": "The appendix below summarizes an efficient order for the first round. It does not replace the rest of the article, but it helps to start without losing the line of investigation."
        },
        {
          "type": "p",
          "text": "**Managers**"
        },
        {
          "type": "code",
          "text": "hostnamectl / nproc / free -h / df -hT / timedatectl\n/var/ossec/bin/wazuh-control info\n/var/ossec/bin/wazuh-control status\n/var/ossec/bin/cluster_control -l\n/var/ossec/bin/cluster_control -i more\ncat /var/ossec/var/run/wazuh-remoted.state\ncat /var/ossec/var/run/wazuh-analysisd.state"
        },
        {
          "type": "p",
          "text": "**Groups and agents**"
        },
        {
          "type": "code",
          "text": "/var/ossec/bin/agent_groups -l\n/var/ossec/bin/cluster_control -a\n/var/ossec/bin/agent_control -l\ngrep -Rni -A8 -B3 '<client_buffer>' /var/ossec/etc/shared/"
        },
        {
          "type": "p",
          "text": "**Filebeat**"
        },
        {
          "type": "code",
          "text": "systemctl status filebeat --no-pager -l\nfilebeat test config\nfilebeat test output\njournalctl -u filebeat --since \"24 hours ago\" --no-pager"
        },
        {
          "type": "p",
          "text": "**Indexers**"
        },
        {
          "type": "code",
          "text": "systemctl status wazuh-indexer --no-pager -l\ngrep -Ev '^\\s*(#|$)' /etc/wazuh-indexer/opensearch.yml\ngrep -E '^-Xm[sx]' /etc/wazuh-indexer/jvm.options\nswapon --show\ncurl -k -u <usuario> https://localhost:9200/_cluster/health?pretty\ncurl -k -u <usuario> https://localhost:9200/_cat/nodes?v\ncurl -k -u <usuario> https://localhost:9200/_cat/shards?v\ncurl -k -u <usuario> https://localhost:9200/_cat/thread_pool/write?v"
        },
        {
          "type": "p",
          "text": "**Syslog and volume**"
        },
        {
          "type": "code",
          "text": "grep -n -A15 -B3 '<remote>' /var/ossec/etc/ossec.conf\nss -lunp\n# Amostra agregada de archives\ntail -n 500000 /var/ossec/logs/archives/archives.json | \\\n  jq -r '.location // \"sem_location\"' | sort | uniq -c | sort -nr | head -50"
        },
        {
          "type": "p",
          "text": "**Antiflooding**"
        },
        {
          "type": "p",
          "text": "In the Dashboard, search for rule.id 202, 203, 204, and 205 and aggregate by `agent.name`. Build episodes by temporal sequence, not only raw count."
        }
      ]
    },
    {
      "heading": "19. Final assessment checklist",
      "blocks": [
        {
          "type": "list",
          "items": [
            "AS IS architecture drawn and validated.",
            "Function and capacity of each node documented.",
            "NTP and clock skew validated.",
            "Manager cluster evaluated in synchronization and distribution.",
            "remoted and analysisd evaluated with drop counters.",
            "Drops classified by event category.",
            "Syslog mapped by source, port, protocol, and volume.",
            "Top talkers and event types identified.",
            "client_buffer, EPS, and antiflooding evaluated.",
            "Stale and duplicated agents reconciled.",
            "Groups, precedence, and config sync validated.",
            "Agent versions and lifecycle reviewed.",
            "Filebeat tested.",
            "Indexer evaluated in health, heap, swap, shards, replicas, write rejection, and storage.",
            "Log Source Coverage completed.",
            "Wazuh controls evaluated.",
            "Rules and decoders inventoried.",
            "Use case catalog started.",
            "MITRE coverage and alert quality evaluated.",
            "Hardening and secrets reviewed.",
            "Backup, DR, RTO, and RPO evaluated.",
            "Capacity planning developed.",
            "Self monitoring defined.",
            "Maturity score calculated.",
            "Gap register, priorities, roadmap, rollback, and acceptance criteria defined."
          ]
        }
      ]
    },
    {
      "heading": "20. Conclusion",
      "blocks": [
        {
          "type": "p",
          "text": "The biggest gain of this kind of assessment is not finding out that a queue is full. It is changing how the organization sees the SIEM. Wazuh stops being a set of servers and starts being treated as a security pipeline that must be observed, measured, protected, and continuously improved."
        },
        {
          "type": "p",
          "text": "When you get into a moving car, the worst thing you can do is start replacing parts without understanding how the vehicle behaves. First you read the dashboard. Then you listen to the engine. You check fuel, temperature, pressure, alignment, and maintenance history. Only then do you decide what needs to be fixed."
        },
        {
          "type": "p",
          "text": "With Wazuh it is the same thing. Architecture, ingestion, buffers, sources, Indexer, detection, operations, and resilience are part of the same system. The tool can have enormous potential, but that potential only appears when the operation knows what it receives, what it loses, what it detects, and how it reacts."
        },
        {
          "type": "callout",
          "callout": {
            "kind": "regra",
            "title": "Final message",
            "body": "the goal is not to have a \"customized\" Wazuh. The goal is to have a Wazuh that is explainable, measurable, resilient, and aligned with business risk."
          }
        }
      ]
    }
  ],
  "sources": [
    {
      "label": "Agent connections in a Wazuh server cluster",
      "url": "https://documentation.wazuh.com/current/user-manual/wazuh-server-cluster/agent-connections.html"
    },
    {
      "label": "Load balancers for Wazuh server cluster",
      "url": "https://documentation.wazuh.com/current/user-manual/wazuh-server-cluster/load-balancers.html"
    },
    {
      "label": "client_buffer configuration",
      "url": "https://documentation.wazuh.com/current/user-manual/reference/ossec-conf/client-buffer.html"
    },
    {
      "label": "Wazuh agent queue and antiflooding",
      "url": "https://documentation.wazuh.com/current/user-manual/agent/agent-management/antiflooding.html"
    },
    {
      "label": "Centralized configuration (agent.conf)",
      "url": "https://documentation.wazuh.com/current/user-manual/reference/centralized-configuration.html"
    },
    {
      "label": "wazuh-analysisd.state statistics",
      "url": "https://documentation.wazuh.com/current/user-manual/reference/statistics-files/wazuh-analysisd-state.html"
    },
    {
      "label": "wazuh-analysisd daemon",
      "url": "https://documentation.wazuh.com/current/user-manual/reference/daemons/wazuh-analysisd.html"
    },
    {
      "label": "Queuing mechanisms",
      "url": "https://documentation.wazuh.com/current/user-manual/manager/wazuh-server-queue.html"
    },
    {
      "label": "remote configuration",
      "url": "https://documentation.wazuh.com/current/user-manual/reference/ossec-conf/remote.html"
    },
    {
      "label": "Event logging and archives",
      "url": "https://documentation.wazuh.com/current/user-manual/manager/event-logging.html"
    },
    {
      "label": "auth configuration and allow_higher_versions",
      "url": "https://documentation.wazuh.com/current/user-manual/reference/ossec-conf/auth.html"
    },
    {
      "label": "Wazuh indexer tuning",
      "url": "https://documentation.wazuh.com/current/user-manual/wazuh-indexer/wazuh-indexer-tuning.html"
    },
    {
      "label": "Voting and quorum",
      "url": "https://docs.opensearch.org/latest/tuning-your-cluster/discovery-cluster-formation/voting-quorums/"
    },
    {
      "label": "Wazuh server cluster overview",
      "url": "https://documentation.wazuh.com/current/user-manual/wazuh-server-cluster/index.html"
    },
    {
      "label": "Local configuration reference",
      "url": "https://documentation.wazuh.com/current/user-manual/reference/ossec-conf/index.html"
    }
  ]
};
