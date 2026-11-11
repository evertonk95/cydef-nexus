import type { BlogPost } from "./posts";

/**
 * CyDef Inora redesign status update (EN, translated from the PT canonical).
 * Source: internal records of redesign phases 1 to 8 (10 and 11 November 2026).
 */
export const cydefInoraRedesignPostEn: BlogPost = {
  slug: "cydef-inora-andamento-redesign",
  title: "CyDef Inora: where the platform redesign stands",
  category: "SOC Engineering",
  excerpt:
    "A full interface redesign, migration to React 19 and Tailwind 4, a rebuilt knowledge base and a new search. What has already shipped in CyDef Inora, what validation covered and what is still missing.",
  date: "11 de Novembro, 2026",
  dateISO: "2026-11-11",
  readTime: "6 min",
  image: "/assets/blog/cydef-inora-redesign-thumb.webp",
  author: "Equipe CyDef",
  tags: [
    "CyDef Inora",
    "SOC",
    "Product",
    "Engineering",
    "Interface Design",
    "Quality",
  ],
  toc: true,
  sections: [
    {
      blocks: [
        {
          type: "p",
          text: "CyDef Inora is the SOC operations platform CyDef is building in the open. Over the past weeks the work moved from features to experience: every main screen was rewritten, the front end moved to a new technical base, and validation now covers the platform on both supported databases. This is a status report, not an availability announcement.",
        },
        {
          type: "callout",
          callout: {
            kind: "ponto",
            title: "The short version",
            body: "The interface was rebuilt screen by screen, the front end moved to React 19 and Tailwind 4, and every phase shipped behind the same validation gate: types, lint, tests on both databases, cross-tenant isolation, build, dependency analysis and secret scanning.",
          },
        },
      ],
    },
    {
      heading: "What was rebuilt in the interface",
      blocks: [
        {
          type: "p",
          text: "This was not a color adjustment. Each screen gained its own structure, with empty states, filters and counts coming from the API instead of being computed in the browser. The list below follows the order in which the phases shipped.",
        },
        {
          type: "list",
          title: "Screens delivered",
          items: [
            "**Login**: two-column layout with a brand panel, an in-house SVG mark and micro-interactions that respect the system reduced-motion preference.",
            "**Shell and dashboard**: sidebar with counters and a collapsed mode, global search, notification bell, and an indicator band with a daily alert series by severity.",
            "**Alerts and approvals**: queue and alert detail rebuilt, with a severity summary, related alerts, an assignee filter and a dedicated approvals screen.",
            "**Case**: new header, summary band with owner, remaining SLA, risk and playbook, and the tasks, observables, evidence and governed response tabs split into their own files.",
            "**Merging alerts**: product-standard modal with a preview of what the merge will do before confirming, including unified observables and new tags.",
            "**Settings**: the monolith became URL-addressable sections, from organizations and users to playbooks, SLA, SSO, webhooks, security and preferences.",
            "**Knowledge base**: turned into a library, with Markdown reading, a side table of contents, editing with live preview, version history with diff and chain integrity verification.",
            "**Search**: a keyboard palette with results grouped by type, typed filters, recent searches, and a results page with a refinement panel and an empty state that suggests the next step.",
          ],
        },
        {
          type: "note",
          text: "Every new screen ships in the product's three languages (Portuguese, English and Spanish) and shares the same component set, so the visual identity does not drift between pages.",
        },
      ],
    },
    {
      heading: "The technical base changed too",
      blocks: [
        {
          type: "p",
          text: "The interface was on React 18 with a styling layer that kept growing without rules. The migration phase moved the project to React 19 and Tailwind 4, with a single CSS entry point and the old styles preserved in a compatibility layer, precisely so the redesign would not break what already worked.",
        },
        {
          type: "p",
          text: "The most visible consequence was the initial bundle: routes are now loaded on demand, with error boundaries on every page, and the first load dropped from roughly 689 kB to roughly 490 kB. In a tool an analyst uses all shift long, that shows up as faster startup and navigation without waiting between screens.",
        },
        {
          type: "list",
          title: "In practice",
          items: [
            "Routes loaded on demand, with a discreet fallback during transitions.",
            "Standardized interface components, with the same focus, error and loading states across screens.",
            "Styles organized by area, without duplicated rules between pages.",
            "No new dependency entered without passing the gate's dependency analysis.",
          ],
        },
      ],
    },
    {
      heading: "Quality: what validation actually found",
      blocks: [
        {
          type: "p",
          text: "Every phase shipped with the same checks, and that is where the work gets interesting: the process caught real defects, not just code style issues.",
        },
        {
          type: "list",
          items: [
            "A partial task update erased fields that had not been sent, because the validation schema kept default values. The schema is now declared field by field.",
            "After publishing a knowledge base article, the screen kept showing the previous state, because the read reused the editing cache. Publishing now invalidates the read.",
            "A scrollable preview panel had no keyboard access. It gained focus, a region role and an accessible label.",
          ],
        },
        {
          type: "p",
          text: "Integration tests run against both supported databases, SQLite and PostgreSQL, with the same scenario and the same expected result, including cross-tenant isolation. The end-to-end suite, which walks the screens the way an analyst would, closed the latest phase with 38 of 38 scenarios passing.",
        },
      ],
    },
    {
      heading: "What is not ready yet",
      blocks: [
        {
          type: "p",
          text: "So that progress does not turn into a promise: the platform is not open to the public yet, and there are known fronts still open.",
        },
        {
          type: "list",
          items: [
            "A second factor with security keys (WebAuthn) and full identity federation (OIDC and SAML) remain in development.",
            "Notification channels beyond what exists today.",
            "The load test around 10 thousand events and the backup and restore procedure have not been executed yet.",
          ],
        },
        {
          type: "p",
          text: "When those fronts close, the next status report shows the measured result, not the intention. It is the same standard we use in technical articles: only state what has been verified.",
        },
      ],
    },
  ],
  sources: [
    { label: "CyDef Labs", url: "https://cydef.com.br/en/labs" },
    { label: "CyDef Academy", url: "https://cydef.com.br/en/academy" },
  ],
  changelog: [
    "2026-11-11: first version, based on internal records of redesign phases 1 to 8.",
  ],
};
