// Landing content — English (editorial translation of data.ts, 2026-09-03).
// Same shapes as the PT canonical data. Human review via PR.
import type { CourseItem, StepItem, FaqItem } from "./data-types";

export const COURSES_EN: CourseItem[] = [
  {
    id: "fundamentos-para-soc",
    title: "SOC Fundamentals",
    description:
      "Essential concepts of operational security, alert triage and first steps to work in a Security Operations Center.",
    level: "Beginner",
    duration: "~4h",
    topics: ["SOC concepts", "Alert triage", "First steps"],
  },
  {
    id: "cybersecurity-fundamentals",
    title: "Cybersecurity Fundamentals",
    description:
      "Information security foundation for everyday work: principles, common threats and defense best practices.",
    level: "Beginner",
    duration: "~6h",
    topics: ["Security principles", "Common threats", "Best practices"],
  },
];

export const STEPS_EN: StepItem[] = [
  {
    title: "Pre-enroll",
    description: "Fill out the form in under 30 seconds and confirm your email.",
  },
  {
    title: "Get access",
    description: "We will send access to the free courses to your email.",
  },
  {
    title: "Study at your own pace",
    description: "Hands-on content to start building your foundation in security.",
  },
];

export const FAQ_ITEMS_EN: FaqItem[] = [
  {
    question: "Is it really free?",
    answer:
      "Yes. These two entry courses are 100% free, no credit card and no hidden fees. The CyDef Academy will have paid courses in the future: you will always be clearly informed about what is free and what is paid.",
  },
  {
    question: "When does it start?",
    answer:
      "Pre-enrollment cohorts start when the content is published and you receive access by email. Confirming your pre-enrollment does not guarantee an immediate spot; it guarantees priority in communications.",
  },
  {
    question: "Do I need experience?",
    answer:
      "No. Both courses are beginner level, designed for people who are starting out or moving into cybersecurity (SOC, Blue Team, governance and other areas).",
  },
  {
    question: "What comes next?",
    answer:
      "After the free courses, you will get to know the full CyDef Academy, with advanced and paid tracks, always with transparency about costs and content.",
  },
];
