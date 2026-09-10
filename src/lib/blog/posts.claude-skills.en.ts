import type { BlogPost } from "./posts";

/**
 * Claude Skills for Information Security - artigo EN (tradução do canônico PT).
 * Conteúdo traduzido do editorial PT aprovado (10/09/2026).
 * Capa: public/assets/blog/claude-skills-seguranca-da-informacao-thumb.webp
 */
export const claudeSkillsPostEn: BlogPost = {
  "slug": "claude-skills-seguranca-da-informacao",
  "title": "Claude Skills for Information Security: what they are, how they work, and 50 skills worth using",
  "category": "Applied AI",
  "excerpt": "A skill is a folder with a SKILL.md that teaches the agent to perform a task your way, loaded only when the task shows up. This guide explains the mechanism (discovery, three-level loading, risks of installing third-party instruction) and organizes 50 useful skills for those who work with information security.",
  "date": "September 10, 2026",
  "dateISO": "2026-09-10",
  "readTime": "16 min read",
  "image": "/assets/blog/claude-skills-seguranca-da-informacao-thumb.webp",
  "author": "CyDef Team",
  "tags": [
    "Claude Skills",
    "AI Agents",
    "SKILL.md",
    "AppSec",
    "Blue Team",
    "DevSecOps",
    "Static Analysis"
  ],
  "toc": true,
  "sections": [
    {
      "blocks": [
        {
          "type": "callout",
          "callout": {
            "kind": "ponto",
            "title": "Core idea",
            "body": "A skill is not a plugin, not a slash command, and not a saved prompt. It is a folder with a SKILL.md file that teaches the agent to perform a task your way, loaded only when the task shows up. The gain does not come from collecting skills: it comes from turning your process into reusable instruction."
          }
        },
        {
          "type": "note",
          "text": "Author: CyDef Team. Source verification date: September 10, 2026."
        }
      ]
    },
    {
      "heading": "How this list was assembled",
      "blocks": [
        {
          "type": "p",
          "text": "This curation is written from the perspective of someone who works with information security: code analysis, AppSec, SOC and detection, incident response, malware analysis, supply chain, and vulnerability management. The criterion was not popularity, but practical usefulness: each item is here because it solves a concrete step of the work. The descriptions were written from the documentation of the projects themselves, reading the SKILL.md and the README of each repository, and not from third-party reviews. The 50 links were verified on September 10, 2026, and all of them returned HTTP 200 on that date."
        }
      ]
    },
    {
      "heading": "Executive summary",
      "blocks": [
        {
          "type": "p",
          "text": "Installing a skill takes a minute. Choosing the right skill, and understanding what you are delivering to the agent when you install it, takes longer. The article has two parts. The first explains the mechanism: what a skill is, how the agent discovers and loads it, what changes in relation to a prompt, a plugin, a command, and MCP, and what risks exist when installing third-party instruction. The second is the list of 50 skills organized into eight categories by stage of the security work, with link, origin, and a short description."
        }
      ]
    },
    {
      "heading": "1. The bottleneck is not the model. It is the instruction",
      "blocks": [
        {
          "type": "p",
          "text": "Anyone who uses a code agent or an AI assistant frequently recognizes the pattern: the result improves a lot when the instruction is good and gets much worse when the instruction is vague. The problem is that the good instruction usually exists only in the head of the person who asked. It is rewritten every session, with variation, and the agent relearns the same context from scratch every time."
        },
        {
          "type": "p",
          "text": "There are three common ways to solve this, and only one of them scales well:"
        },
        {
          "type": "list",
          "items": [
            "**Repeat it in the prompt.** It works, but you pay the cost of typing and reviewing it every time, and each session has a slightly different version of your process.",
            "**Keep it in a document.** It improves consistency, but the agent only uses it if you remember to attach it. A document is not triggered by context, it is attached by a human decision.",
            "**Package it as a skill.** The procedure stays in a file, with metadata that says when it should be used, and the agent loads it on its own at the right moment."
          ]
        },
        {
          "type": "p",
          "text": "A skill is the third option. It solves an old prompt engineering problem: the instruction stops being disposable text and becomes a versionable, reviewable, and reusable artifact."
        },
        {
          "type": "callout",
          "callout": {
            "kind": "regra",
            "title": "Starting point",
            "body": "If a skill does not change the agent's behavior, it is just decoration. The success criterion is not having many installed, it is the agent getting it more right the second time than it did the first time."
          }
        }
      ]
    },
    {
      "heading": "2. What a skill is, in practice",
      "blocks": [
        {
          "type": "p",
          "text": "A skill is a directory with a required file named SKILL.md. The directory name is the identity of the skill. Inside the SKILL.md there are two parts:"
        },
        {
          "type": "list",
          "items": [
            "**YAML frontmatter**, with metadata. The two essential fields are name (the skill name) and description (what it does and when it should be used).",
            "**Markdown body**, with the procedure: steps in order, completion criteria, examples, and known pitfalls."
          ]
        },
        {
          "type": "p",
          "text": "Optionally, the skill can bring support files, such as scripts, long references, templates, and examples. These files do not need to be read right away: they come into play only when the procedure itself points to them. That is what allows a skill to carry a lot of content without inflating the agent's context all the time."
        },
        {
          "type": "p",
          "text": "The minimal skeleton is this:"
        },
        {
          "type": "code",
          "text": "---\nname: soc-alert-review\ndescription: Reviews a SIEM alert and produces a hypothesis, evidence, and next step.\n  Use it when the user pastes a raw alert or asks for alert triage.\n---\n\n# SOC alert review\n\n1. Extract from the alert: rule, host, user, process, timestamp, and origin.\n2. Separate what is fact from what is inference.\n3. Raise at most three hypotheses, from the most likely to the least likely.\n4. For each hypothesis, list the evidence that would support it or rule it out.\n5. Close with a recommendation, confidence level, and next step.\n6. Do not conclude \"false positive\" without citing the evidence that supports the conclusion."
        },
        {
          "type": "p",
          "text": "Notice what makes this example work: the description says what the skill does and when to use it, the steps are imperative, there is a completion criterion, and there is an explicit prohibition. A skill is not pretty text about a subject. It is operational instruction."
        }
      ]
    },
    {
      "heading": "3. How the skill comes into play: three-level loading",
      "blocks": [
        {
          "type": "p",
          "text": "A skill is not loaded in full into the conversation. Loading is progressive, in three levels, and that explains why an agent can have dozens of skills installed without an absurd context cost."
        },
        {
          "type": "table",
          "table": {
            "headers": ["Level", "What loads", "When"],
            "rows": [
              ["1. Metadata", "name and description of all available skills", "Always, at the start of the session"],
              ["2. Body", "The contents of the SKILL.md", "When the task matches the description"],
              ["3. Support", "Scripts, references, templates, and examples", "When the procedure asks for that file"]
            ]
          }
        },
        {
          "type": "p",
          "text": "The practical consequence is direct: **the description is the most important part of the skill**. It is what the agent reads before deciding, and it is what defines whether the skill will be triggered at the right moment or never. A generic description such as \"helps with security\" is never triggered. A description with a trigger, like \"use it when the user pastes a raw alert\", is triggered without you needing to ask for it by name."
        },
        {
          "type": "p",
          "text": "This design also explains the cost difference in relation to other forms of extension. An integration that dumps 16 thousand tokens of tools into the context is extremely expensive in every session. The same capability packaged as a skill takes up a few tokens until the moment it is really needed."
        },
        {
          "type": "callout",
          "callout": {
            "kind": "aviso",
            "title": "Practical consequence",
            "body": "Installing 40 skills does not break the agent. Installing 40 skills with vague descriptions does: the agent starts choosing wrong, and sometimes triggers a procedure that was not the case."
          }
        }
      ]
    },
    {
      "heading": "4. Skill, command, plugin, MCP: what is what",
      "blocks": [
        {
          "type": "p",
          "text": "The ecosystem uses similar names for different things, and that creates confusion when it comes time to choose. The table below separates the concepts."
        },
        {
          "type": "table",
          "table": {
            "headers": ["Resource", "What it is", "Who triggers it", "What it is for"],
            "rows": [
              ["Skill", "Folder with SKILL.md and support files", "The agent, by context", "Procedure, knowledge, and execution standard"],
              ["Saved prompt", "Reusable text", "The person", "A starting phrase, not a process"],
              ["Slash command", "Explicit shortcut typed in the interface", "The person", "Start a named flow"],
              ["Plugin", "Package that groups skills, commands, agents, and integrations", "The person installs it, the agent uses it", "Distribution of several capabilities together"],
              ["MCP", "Connection to external tools and data", "The agent, via a tool", "Access systems, databases, and APIs"],
              ["Subagent", "Separate session with its own context", "The agent", "Delegate long work without polluting the main context"]
            ]
          }
        },
        {
          "type": "p",
          "text": "The distinction that matters most: **MCP gives access, a skill gives method**. Connecting an MCP without a procedure is handing over a key and no manual. A skill without access, on the other hand, is still useful: a code review procedure, a hardening checklist, or a writing standard work without touching any system."
        }
      ]
    },
    {
      "heading": "5. What separates a good skill from a pretty folder",
      "blocks": [
        {
          "type": "p",
          "text": "When writing or reviewing a skill, these criteria are the ones that change the result the most:"
        },
        {
          "type": "list",
          "items": [
            "**Description with a trigger and an exclusion.** Say when to use it and when not to use it. The exclusion prevents wrong triggering on a similar task.",
            "**Imperative steps and short duration.** \"Run X, then check Y\" ages well. \"Consider the possibility of maybe evaluating\" does not change behavior.",
            "**Completion criterion per step.** Each step needs a verifiable condition. Without that, the agent considers it done when it looks done.",
            "**Narrow scope.** A skill that does everything is not triggered for anything. Prefer several small skills over one encyclopedia.",
            "**No redundancy.** A sentence that repeats the model's default behavior is noise. If the line does not change behavior, delete the line.",
            "**Long reference in a separate file.** The body of the SKILL.md is the procedure. A giant table, a catalog of examples, and extensive documentation go into support files, loaded only when needed.",
            "**Dangerous actions require confirmation.** A destructive command, an external write, and an operation in production need an explicit brake."
          ]
        }
      ]
    },
    {
      "heading": "6. Where skills live and why that is portable",
      "blocks": [
        {
          "type": "p",
          "text": "The format is file-based, which means installing is copying and organizing a directory. In Claude Code, the usual locations are the personal folder (~/.claude/skills/) and the project folder (.claude/skills/). The difference between them is one of scope: a personal skill applies to all your projects, a project skill travels with the repository, applies to the team, and goes into code review like any other file."
        },
        {
          "type": "p",
          "text": "The point that often goes unnoticed: the skills format was published as an open standard, Agent Skills. A skill that uses only name, description, and Markdown instructions is portable across tools that implement the standard. That reduces the risk of betting on a specific vendor: the knowledge you wrote remains usable when the tool changes."
        },
        {
          "type": "callout",
          "callout": {
            "kind": "ponto",
            "title": "Consequence for security teams",
            "body": "A project skill is executable documentation of the operational procedure. Unlike a wiki, the agent reads and applies it at the moment of execution, and the review happens in the same pull request that changes the process."
          }
        }
      ]
    },
    {
      "heading": "7. Security: treat a third-party skill as third-party code",
      "blocks": [
        {
          "type": "p",
          "text": "Here is the point that deserves more attention than it usually gets. A skill is not inert content. It is **instruction that the agent obeys** and, often, **a script that the agent runs** with the permissions it has. That changes the risk model."
        },
        {
          "type": "p",
          "text": "Concrete risks when installing a skill of unknown origin:"
        },
        {
          "type": "list",
          "items": [
            "**Instruction injection.** The body of the SKILL.md can contain instruction that diverts the agent from the user's goal, with or without bad intent from the original author.",
            "**Execution with your privileges.** A support script runs in your environment, with access to files, environment variables, and credentials that are available in the session.",
            "**Destructive command.** An improper git push, reset --hard, directory cleanup, and configuration change: actions that cannot be undone with a Ctrl+Z.",
            "**Data exfiltration.** Collection of files, history, or a code snippet and sending it to an external endpoint.",
            "**Supply chain.** An abandoned repository, a change of owner, a dependency added after your review. The skill you reviewed today is not necessarily the one that will run next month."
          ]
        },
        {
          "type": "p",
          "text": "Checklist before installing a third-party skill:"
        },
        {
          "type": "list",
          "items": [
            "Is there a clear SKILL.md, readable from start to finish?",
            "Does the description say when the skill should be triggered and when it should not?",
            "Are there concrete usage examples?",
            "Are dangerous actions conditioned on explicit confirmation?",
            "Has the repository been updated recently and does it have an identifiable owner?",
            "Does the skill solve a real pain in your flow, or is it a curiosity?",
            "Were the support scripts read line by line?",
            "Does any step ask for a credential, token, or network access? If it does, where does the data go?",
            "Was the behavior tested in an isolated repository before the production repository?",
            "Is there a mandatory review on every update of the skill?"
          ]
        },
        {
          "type": "callout",
          "callout": {
            "kind": "regra",
            "title": "Practical rule",
            "body": "A third-party skill falls under the same policy as any dependency: owner, version, scope, review, and the possibility of removal. Installing without reading is the equivalent of running a script downloaded from the internet with your user."
          }
        }
      ]
    },
    {
      "heading": "8. The 50 skills, by stage of the work",
      "blocks": [
        {
          "type": "p",
          "text": "The list is organized by stage of the security flow, not by popularity. Each item brings the origin, which helps calibrate the level of review before installing:"
        },
        {
          "type": "list",
          "items": [
            "**Official:** maintained by Anthropic, in the official skills repository.",
            "**Trail of Bits:** the Trail of Bits security package, with skills aimed at auditing, code analysis, and application testing. Many of them are part of the Application Security Testing Handbook material.",
            "**Community:** independent projects, with good adoption, but that require reading the SKILL.md before use in a production environment."
          ]
        },
        {
          "type": "p",
          "text": "Not every skill is aimed at offensive testing. A good part of security work is reading code, writing reports, organizing evidence, and communicating risk: that is why the list includes documents, spreadsheets, and presentations."
        }
      ]
    },
    {
      "heading": "8.1 Understand the target before hunting the bug (4)",
      "blocks": [
        {
          "type": "list",
          "items": [
            "**audit-context-building** (Trail of Bits): reads the code function by function and writes to a file what each one assumes and depends on, before starting to hunt bugs, without filling up the conversation context. [github.com/trailofbits/skills](https://github.com/trailofbits/skills/tree/main/plugins/audit-context-building/skills/audit-context-building)",
            "**trailmark** (Trail of Bits): builds a code and binary graph to map attack surface, blast radius, taint propagation, entry points, and structural differences; it generates Mermaid diagrams and context packages to delegate analysis to smaller models. [github.com/trailofbits/skills](https://github.com/trailofbits/skills/tree/main/plugins/trailmark/skills/trailmark)",
            "**entry-point-analyzer** (Trail of Bits): identifies externally callable functions that change state and classifies them by access level, generating a structured audit report. [github.com/trailofbits/skills](https://github.com/trailofbits/skills/tree/main/plugins/entry-point-analyzer/skills/entry-point-analyzer)",
            "**building-secure-contracts** (Trail of Bits): a security kit for smart contracts, with vulnerability scanners for six blockchains and development guideline assistants. [github.com/trailofbits/skills](https://github.com/trailofbits/skills/tree/main/plugins/building-secure-contracts/skills/secure-workflow-guide)"
          ]
        }
      ]
    },
    {
      "heading": "8.2 Static analysis and detection in the code (6)",
      "blocks": [
        {
          "type": "list",
          "items": [
            "**codeql** (Trail of Bits): data flow and taint analysis across functions, with support for Python, JavaScript and TypeScript, Go, Java and Kotlin, C and C++, C#, Ruby, and Swift. [github.com/trailofbits/skills](https://github.com/trailofbits/skills/tree/main/plugins/static-analysis/skills/codeql)",
            "**semgrep** (Trail of Bits): pattern scanning with selected rulesets and explicit approval before running, output consolidated in SARIF, and use of Semgrep Pro for cross-file taint when available. [github.com/trailofbits/skills](https://github.com/trailofbits/skills/tree/main/plugins/static-analysis/skills/semgrep)",
            "**sarif-parsing** (Trail of Bits): reads, aggregates, deduplicates, and filters SARIF from CodeQL, Semgrep, and other scanners, with integration into a CI/CD pipeline. [github.com/trailofbits/skills](https://github.com/trailofbits/skills/tree/main/plugins/static-analysis/skills/sarif-parsing)",
            "**semgrep-rule-creator** (Trail of Bits): creates custom Semgrep rules for bug and vulnerability patterns, with testing and validation of the rule before use. [github.com/trailofbits/skills](https://github.com/trailofbits/skills/tree/main/plugins/semgrep-rule-creator/skills/semgrep-rule-creator)",
            "**semgrep-rule-variant-creator** (Trail of Bits): generates variants of an existing rule for other languages, with applicability analysis and test-guided validation. [github.com/trailofbits/skills](https://github.com/trailofbits/skills/tree/main/plugins/semgrep-rule-variant-creator/skills/semgrep-rule-variant-creator)",
            "**variant-analysis** (Trail of Bits): starting from a known finding, it looks for vulnerabilities and bugs of the same pattern in other parts of the code. [github.com/trailofbits/skills](https://github.com/trailofbits/skills/tree/main/plugins/variant-analysis/skills/variant-analysis)"
          ]
        }
      ]
    },
    {
      "heading": "8.3 Code review and finding triage (8)",
      "blocks": [
        {
          "type": "list",
          "items": [
            "**differential-review** (Trail of Bits): security review focused on what changed, with history analysis via git blame, blast radius by caller count, verification of test coverage on the changed code, and a markdown report. [github.com/trailofbits/skills](https://github.com/trailofbits/skills/tree/main/plugins/differential-review/skills/differential-review)",
            "**fp-check** (Trail of Bits): verifies whether a finding is real or a false positive, with documented evidence and an explicit verdict for each item. [github.com/trailofbits/skills](https://github.com/trailofbits/skills/tree/main/plugins/fp-check/skills/fp-check)",
            "**vulnerability-triage-brocards** (Trail of Bits): triage of a vulnerability report, CVE, or bug bounty submission with seven rules of thumb, deciding to accept, discard, or request more information before escalating to deep analysis. [github.com/trailofbits/skills](https://github.com/trailofbits/skills/tree/main/plugins/vulnerability-triage-brocards/skills/vulnerability-triage-brocards)",
            "**sharp-edges** (Trail of Bits): identifies error-prone APIs, dangerous configuration, and designs that induce security failure, assessing whether the easy path leads to insecure use. [github.com/trailofbits/skills](https://github.com/trailofbits/skills/tree/main/plugins/sharp-edges/skills/sharp-edges)",
            "**spec-to-code-compliance** (Trail of Bits): checks whether the code complies with the documentation that specifies it, with one agent per requirement, divergence refuted before being reported, and evidence cited line by line. [github.com/trailofbits/skills](https://github.com/trailofbits/skills/tree/main/plugins/spec-to-code-compliance/skills/spec-to-code-compliance)",
            "**c-review** (Trail of Bits): security review of C and C++ code, with coverage verified against a parse of the source. [github.com/trailofbits/skills](https://github.com/trailofbits/skills/tree/main/plugins/c-review/skills/c-review)",
            "**rust-review** (Trail of Bits): Rust security review with agents specialized in the safe/unsafe boundary, memory in unsafe blocks, concurrency, denial of service by panic, stack overflow by recursion, FFI, and async runtime risks. [github.com/trailofbits/skills](https://github.com/trailofbits/skills/tree/main/plugins/rust-review/skills/rust-review)",
            "**second-opinion** (Trail of Bits): runs a review via an external LLM CLI on uncommitted changes, branch diffs, or specific commits, useful as a second opinion on a controversial finding. [github.com/trailofbits/skills](https://github.com/trailofbits/skills/tree/main/plugins/second-opinion/skills/second-opinion)"
          ]
        }
      ]
    },
    {
      "heading": "8.4 Testing, fuzzing, and low-level analysis (9)",
      "blocks": [
        {
          "type": "list",
          "items": [
            "**testing-handbook-skills** (Trail of Bits): a set of skills derived from the Application Security Testing Handbook, with libFuzzer, AFL++, Atheris, cargo-fuzz, libafl, OSS-Fuzz, Wycheproof, AddressSanitizer, coverage analysis, and fuzzing harness writing. [github.com/trailofbits/skills](https://github.com/trailofbits/skills/tree/main/plugins/testing-handbook-skills)",
            "**property-based-testing** (Trail of Bits): writes, reviews, and debugs property-based tests with Hypothesis, fast-check, proptest, jqwik, Echidna, and Medusa, covering the input domain instead of hand-picked examples. [github.com/trailofbits/skills](https://github.com/trailofbits/skills/tree/main/plugins/property-based-testing/skills/property-based-testing)",
            "**mutation-testing** (Trail of Bits): configures mutation testing campaigns with mewt for general languages and muton for TON contracts, defining scope, timeout, and optimization of long runs. [github.com/trailofbits/skills](https://github.com/trailofbits/skills/tree/main/plugins/mutation-testing/skills/mutation-testing)",
            "**webapp-testing** (official): interacts with a local web application using Playwright, verifies functionality, debugs interface behavior, captures screenshots, and reads browser logs. [github.com/anthropics/skills](https://github.com/anthropics/skills/tree/main/skills/webapp-testing)",
            "**playwright-skill** (community): application exploration and testing with Playwright in a lighter format than large MCP integrations. [github.com/lackeyjb/playwright-skill](https://github.com/lackeyjb/playwright-skill)",
            "**firebase-apk-scanner** (Trail of Bits): scans an Android APK for insecure Firebase configuration, including an open database, a storage bucket, an authentication failure, and an exposed cloud function. For authorized research. [github.com/trailofbits/skills](https://github.com/trailofbits/skills/tree/main/plugins/firebase-apk-scanner/skills/firebase-apk-scanner)",
            "**burpsuite-project-parser** (Trail of Bits): searches and extracts data from a Burp Suite project file for security analysis. [github.com/trailofbits/skills](https://github.com/trailofbits/skills/tree/main/plugins/burpsuite-project-parser/skills/burpsuite-project-parser)",
            "**constant-time-analysis** (Trail of Bits): detects compiler-induced timing side channels in cryptographic code. [github.com/trailofbits/skills](https://github.com/trailofbits/skills/tree/main/plugins/constant-time-analysis/skills/constant-time-analysis)",
            "**zeroize-audit** (Trail of Bits): detects the absence of zeroization of sensitive data or zeroization removed by compiler optimization, with assembly and control flow analysis. [github.com/trailofbits/skills](https://github.com/trailofbits/skills/tree/main/plugins/zeroize-audit/skills/zeroize-audit)"
          ]
        }
      ]
    },
    {
      "heading": "8.5 Detection, threat, and response (4)",
      "blocks": [
        {
          "type": "list",
          "items": [
            "**yara-rule-authoring** (Trail of Bits): YARA-X rule authoring with lint and quality analysis, covering naming convention, string selection, performance optimization, legacy YARA migration, and false positive reduction. [github.com/trailofbits/skills](https://github.com/trailofbits/skills/tree/main/plugins/yara-authoring/skills/yara-rule-authoring)",
            "**last30days** (community): researches recent discussions on X, Reddit, Hacker News, YouTube, and the web, useful for following active exploitation, technique debate, and rumor that is not yet documented. [github.com/mvanhorn/last30days-skill](https://github.com/mvanhorn/last30days-skill/tree/main/skills/last30days)",
            "**firecrawl-agent** (community): scraping, research, and browser automation for structured open-source collection. [github.com/firecrawl/cli](https://github.com/firecrawl/cli/tree/main/skills/firecrawl-agent)",
            "**printing-press** (community): turns a site or API into an interface and CLI that are easier for the agent to operate, a short path to building an internal query tool. [github.com/mvanhorn/cli-printing-press](https://github.com/mvanhorn/cli-printing-press/tree/main/skills/printing-press)"
          ]
        }
      ]
    },
    {
      "heading": "8.6 Supply chain and repository posture (6)",
      "blocks": [
        {
          "type": "list",
          "items": [
            "**supply-chain-risk-auditor** (Trail of Bits): audits npm, PyPI, and Go dependencies with advisories matched by version across the full lockfile tree, abandoned upstream, publisher concentration, and script execution at install time. [github.com/trailofbits/skills](https://github.com/trailofbits/skills/tree/main/plugins/supply-chain-risk-auditor/skills/supply-chain-risk-auditor)",
            "**agentic-actions-auditor** (Trail of Bits): audits GitHub Actions workflows for vulnerabilities in the integration with AI agents, including Claude Code Action, Gemini CLI, OpenAI Codex, and GitHub AI Inference. [github.com/trailofbits/skills](https://github.com/trailofbits/skills/tree/main/plugins/agentic-actions-auditor/skills/agentic-actions-auditor)",
            "**open-sourcing** (Trail of Bits): prepares a repository for publication, with secret hygiene in the history, license choice, documentation and CI checks, and packaging and release guidance. [github.com/trailofbits/skills](https://github.com/trailofbits/skills/tree/main/plugins/open-sourcing/skills/open-sourcing)",
            "**gh-cli** (Trail of Bits): intercepts GitHub URL searches and curl and wget commands, redirecting them to the authenticated gh CLI. [github.com/trailofbits/skills](https://github.com/trailofbits/skills/tree/main/plugins/gh-cli/skills/gh-cli)",
            "**github-triage** (Trail of Bits): triages open issues and pull requests via the gh CLI, with optional merge of a ready PR, closing an already resolved issue with an explanation, and linking it to the pending fix PR. [github.com/trailofbits/skills](https://github.com/trailofbits/skills/tree/main/plugins/github-triage/skills/github-triage)",
            "**git-guardrails** (community): prevents dangerous Git actions, such as an improper push, reset --hard, clean, and branch deletion. [github.com/mattpocock/skills](https://github.com/mattpocock/skills/tree/main/skills/misc/git-guardrails-claude-code)"
          ]
        }
      ]
    },
    {
      "heading": "8.7 Document, report, and communication (6)",
      "blocks": [
        {
          "type": "list",
          "items": [
            "**pdf** (official): reads and extracts text and tables, merges, splits, rotates pages, adds a watermark, fills forms, encrypts, and runs OCR on a scanned PDF. [github.com/anthropics/skills](https://github.com/anthropics/skills/tree/main/skills/pdf)",
            "**docx** (official): creates, edits, and analyzes a Word document, useful for an assessment report and an action plan. [github.com/anthropics/skills](https://github.com/anthropics/skills/tree/main/skills/docx)",
            "**xlsx** (official): opens, reads, edits, and fixes a spreadsheet, with formulas, formatting, and charts, including cleanup of malformed tabular data. [github.com/anthropics/skills](https://github.com/anthropics/skills/tree/main/skills/xlsx)",
            "**pptx** (official): creates and edits a presentation, useful for a security committee and a leadership briefing. [github.com/anthropics/skills](https://github.com/anthropics/skills/tree/main/skills/pptx)",
            "**doc-coauthoring** (official): co-authorship, review, and collaborative editing of a document, focused on consistency across versions. [github.com/anthropics/skills](https://github.com/anthropics/skills/tree/main/skills/doc-coauthoring)",
            "**internal-comms** (official): writes an internal notice, a status update, and a team communication, applicable to an incident communication and a maintenance notice. [github.com/anthropics/skills](https://github.com/anthropics/skills/tree/main/skills/internal-comms)"
          ]
        }
      ]
    },
    {
      "heading": "8.8 The security professional's working base (7)",
      "blocks": [
        {
          "type": "list",
          "items": [
            "**skill-creator** (official): creates your own skill with reusable structure and instruction. It is the path to turning your team's procedure into automatic execution. [github.com/anthropics/skills](https://github.com/anthropics/skills/tree/main/skills/skill-creator)",
            "**find-skills** (community): finds a relevant skill for a specific task before going out and installing on your own. [github.com/vercel-labs/skills](https://github.com/vercel-labs/skills/tree/main/skills/find-skills)",
            "**superpowers** (community): turns the agent into a complete engineering flow, with brainstorm, specification, plan, TDD, subagents, review, and debugging. [github.com/obra/superpowers](https://github.com/obra/superpowers)",
            "**planning-with-files** (community): creates persistent plans in files for a long task, avoiding context loss between sessions. [github.com/OthmanAdi/planning-with-files](https://github.com/OthmanAdi/planning-with-files)",
            "**karpathy-guidelines** (community): enforces simplicity, surgical change, checking, and reasoning before jumping into code. [github.com/multica-ai/andrej-karpathy-skills](https://github.com/multica-ai/andrej-karpathy-skills/tree/main/skills/karpathy-guidelines)",
            "**mcp-builder** (official): creates an MCP server to connect the agent to an internal tool, such as a SIEM, a ticket queue, an inventory, or a knowledge base. [github.com/anthropics/skills](https://github.com/anthropics/skills/tree/main/skills/mcp-builder)",
            "**claude-api** (official): support for integrating the API into a product and internal automation, including error handling and cost. [github.com/anthropics/skills](https://github.com/anthropics/skills/tree/main/skills/claude-api)"
          ]
        }
      ]
    },
    {
      "heading": "9. How to choose without becoming a digital hoarder",
      "blocks": [
        {
          "type": "p",
          "text": "The most common mistake is not installing the wrong skill. It is installing thirty at once, not noticing which one of them changed the result, and continuing to carry dead weight."
        },
        {
          "type": "list",
          "items": [
            "**Choose by pain, not by curiosity.** List what you repeat every week: finding triage, diff review, report writing, dependency checking. Start with the skills that attack that.",
            "**Install three to five, not fifty.** Each new skill changes the agent's behavior. Change in bulk is change you cannot attribute.",
            "**Measure the difference.** Before and after, on the same task. If the result did not change, the skill is not working, and the problem is usually in the description.",
            "**Remove without drama.** A skill that has not been triggered for a month is a candidate to leave. Clean context is part of performance.",
            "**Write your own.** The 50 in this list solve common pains in the field. The skill that changes your result the most is the one that describes your process: your triage checklist, your report format, your severity criterion, your detection rule.",
            "**Version what belongs to the team.** A project skill lives in the repository and goes through review. It is the cheapest way to turn an internal standard into automatic execution."
          ]
        },
        {
          "type": "callout",
          "callout": {
            "kind": "ponto",
            "title": "The point that closes the article",
            "body": "The best use of skills is not collecting. It is turning your way of working into reusable, reviewable, and portable instruction."
          }
        }
      ]
    },
    {
      "heading": "10. Conclusion",
      "blocks": [
        {
          "type": "p",
          "text": "A skill is a simple technology: a folder, a file, metadata, and a procedure. What it changes is not the model's capability, it is the repeatability of the result. Instead of re-explaining context every session, the process stays written down, versioned, triggered by context, and auditable."
        },
        {
          "type": "p",
          "text": "For those who work with security, the reading has two layers. The first is about productivity: finding triage, diff review, variant hunting, dependency checking, assessment report, and writing standard stop being tacit knowledge. The second is about risk: a third-party skill is third-party code, with the agent's privilege and execution in your environment. Whoever installs without reading is widening the attack surface with one click."
        },
        {
          "type": "p",
          "text": "Start small, choose by pain, measure the effect, and write the skill that describes your process. That is the gain that accumulates."
        }
      ]
    }
  ],
  "sources": [
    { "label": "Anthropic: official Agent Skills documentation", "url": "https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview" },
    { "label": "Anthropic: official skills repository", "url": "https://github.com/anthropics/skills" },
    { "label": "Trail of Bits: security skills package", "url": "https://github.com/trailofbits/skills" },
    { "label": "Trail of Bits: Application Security Testing Handbook", "url": "https://appsec.guide" },
    { "label": "Vercel Labs: skills repository", "url": "https://github.com/vercel-labs/skills" }
  ]
};
