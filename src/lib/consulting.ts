// Serviços da CyDef Consulting (decisão do Everton, 12/11/2026).
// Fonte única da lista: a página de Consultoria, a seção da home e o JSON-LD
// usam esta mesma ordem. O texto de cada serviço vive no i18n
// (`consulting.items.<key>`), com paridade PT/EN/ES garantida pelo tipo `Dict`.
import type { LucideIcon } from "lucide-react";
import { Eye, Radar, ScanLine, Bug, Wrench, BrainCircuit } from "lucide-react";

export const CONSULTING_KEYS = ["soc", "ir", "cti", "pentest", "compliance", "ai"] as const;

export type ConsultingKey = (typeof CONSULTING_KEYS)[number];

export const CONSULTING_ICONS: Record<ConsultingKey, LucideIcon> = {
  soc: Eye,
  ir: Radar,
  cti: ScanLine,
  pentest: Bug,
  compliance: Wrench,
  ai: BrainCircuit,
};
