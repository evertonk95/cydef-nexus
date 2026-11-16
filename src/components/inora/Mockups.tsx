// Telas ilustrativas do CyDef Inora para a página comercial (/<lang>/inora).
// Desenhadas em HTML/CSS (e não print) para ficarem nítidas em qualquer tela e
// traduzidas nos três idiomas. Os números são dados de demonstração, e a
// página diz isso abaixo do hero. Cada tela é uma ilustração: `role="img"` com
// rótulo, sem elementos focáveis dentro.
import { useId, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import {
  LayoutGrid,
  Zap,
  FolderClosed,
  ArrowLeftRight,
  ShieldCheck,
  Search,
  BookOpen,
  Settings,
  Home,
  ChevronRight,
  Clock,
  Timer,
  Shield,
  AlertOctagon,
  AlertTriangle,
  ListChecks,
  Filter,
  BarChart3,
  CheckCircle2,
  Circle,
  CircleDot,
  Copy,
  FileText,
  Building2,
  Briefcase,
  Gauge,
} from "lucide-react";

type T = (key: string) => string;
const useUi = (): T => {
  const { t } = useTranslation();
  return (key: string) => String(t(`inora.ui.${key}`));
};
const useUiList = (key: string): string[] => {
  const { t } = useTranslation();
  return t(`inora.ui.${key}`, { returnObjects: true }) as string[];
};

/** Marca do produto: ícone da CyDef + "CyDef INORA" (INORA em laranja). */
export const InoraLockup = ({ size = "md" }: { size?: "sm" | "md" | "lg" }) => {
  const icon = size === "lg" ? "h-11 w-11" : size === "sm" ? "h-5 w-5" : "h-8 w-8";
  const text = size === "lg" ? "text-3xl" : size === "sm" ? "text-[13px]" : "text-xl";
  return (
    <span className="inline-flex items-center gap-2.5">
      <img src="/assets/cydef-icon.webp" alt="" className={`${icon} rounded-full`} width={44} height={44} />
      <span className={`font-display font-bold tracking-tight text-white ${text}`}>
        CyDef <span className="text-orange-500">INORA</span>
      </span>
    </span>
  );
};

/** Moldura de janela de aplicação. */
const Frame = ({ children, className = "", label }: { children: ReactNode; className?: string; label: string }) => (
  <div
    role="img"
    aria-label={label}
    className={`relative overflow-hidden rounded-xl border border-white/10 bg-[#0b0b0d] text-left shadow-[0_30px_80px_-30px_rgba(0,0,0,0.9)] ${className}`}
  >
    {children}
  </div>
);

const Spark = ({ points, className = "" }: { points: number[]; className?: string }) => {
  const gid = `inora-spark-${useId().replace(/:/g, "")}`;
  const w = 120;
  const h = 32;
  const max = Math.max(...points);
  const min = Math.min(...points);
  const step = w / (points.length - 1);
  const y = (v: number) => h - 3 - ((v - min) / (max - min || 1)) * (h - 6);
  const d = points.map((v, i) => `${i === 0 ? "M" : "L"}${(i * step).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={`h-8 w-full ${className}`} preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id={gid} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#f97316" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${d} L${w},${h} L0,${h} Z`} fill={`url(#${gid})`} />
      <path d={d} fill="none" stroke="#fb923c" strokeWidth="1.6" vectorEffect="non-scaling-stroke" />
    </svg>
  );
};

const SEV = {
  critical: "bg-red-500/15 text-red-300 border-red-500/30",
  high: "bg-orange-500/15 text-orange-300 border-orange-500/30",
  medium: "bg-amber-400/15 text-amber-300 border-amber-400/30",
  low: "bg-sky-400/15 text-sky-300 border-sky-400/30",
} as const;

const Chip = ({ tone, children }: { tone: keyof typeof SEV | "ok" | "muted"; children: ReactNode }) => {
  const cls =
    tone === "ok"
      ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
      : tone === "muted"
        ? "bg-white/5 text-neutral-300 border-white/10"
        : SEV[tone];
  return (
    <span className={`inline-flex items-center whitespace-nowrap rounded-md border px-1.5 py-0.5 text-[10px] font-semibold ${cls}`}>
      {children}
    </span>
  );
};

/* ------------------------------------------------------------------ */
/* Hero: dashboard do SOC                                              */
/* ------------------------------------------------------------------ */

export const HeroDashboard = () => {
  const u = useUi();
  const nav: [typeof LayoutGrid, string, number?][] = [
    [LayoutGrid, u("nav.dashboard")],
    [Zap, u("nav.alerts"), 9],
    [FolderClosed, u("nav.cases")],
    [ArrowLeftRight, u("nav.changes")],
    [ShieldCheck, u("nav.approvals"), 2],
    [Search, u("nav.search")],
    [BookOpen, u("nav.kb")],
  ];
  const kpis: [typeof Clock, string, string, string, number[], boolean][] = [
    [Clock, u("kpiDetect"), "6 min", "-12%", [9, 8, 9, 7, 8, 6, 7, 6], true],
    [Timer, u("kpiTriage"), "13 min", "-41%", [22, 20, 21, 17, 18, 14, 15, 13], true],
    [Shield, u("kpiContain"), "47 min", "-57%", [110, 96, 102, 80, 74, 62, 55, 47], true],
  ];
  const phases = ["detection", "triage", "containment", "eradication"] as const;
  const phaseCount = [5, 4, 3, 2];
  const phaseWidth = [92, 74, 58, 36];
  // Barras empilhadas por severidade (crítica, alta, média, baixa) em 7 dias.
  const bars = [
    [2, 4, 6, 9],
    [3, 5, 7, 8],
    [1, 2, 3, 3],
    [1, 2, 2, 2],
    [2, 6, 7, 6],
    [3, 5, 8, 6],
    [4, 8, 9, 7],
  ];
  const barColors = ["bg-red-400", "bg-orange-500", "bg-amber-400", "bg-sky-400"];

  return (
    <Frame label={`${u("nav.dashboard")} · CyDef Inora`} className="w-full">
      <div className="grid grid-cols-[148px_1fr]">
        {/* Barra lateral */}
        <aside className="hidden sm:flex flex-col gap-0.5 border-r border-white/[0.06] bg-[#08080a] p-2.5 min-h-full">
          <div className="mb-3 px-1.5 pt-1">
            <InoraLockup size="sm" />
          </div>
          {nav.map(([Icon, label, count], i) => (
            <div
              key={label}
              className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-[11px] ${
                i === 0 ? "bg-orange-500/10 text-white shadow-[inset_2px_0_0_#f97316]" : "text-neutral-400"
              }`}
            >
              <Icon className={`h-3.5 w-3.5 ${i === 0 ? "text-orange-400" : ""}`} aria-hidden="true" />
              <span className="truncate">{label}</span>
              {count ? (
                <span className="ml-auto rounded-full bg-orange-500 px-1.5 text-[9px] font-bold text-black">{count}</span>
              ) : null}
            </div>
          ))}
          <div className="mt-auto flex items-center gap-2 px-2 pt-6 text-[11px] text-neutral-500">
            <Settings className="h-3.5 w-3.5" aria-hidden="true" /> {u("nav.settings")}
          </div>
        </aside>

        {/* Conteúdo */}
        <div className="col-span-2 sm:col-span-1 min-w-0 p-3.5">
          <div className="mb-3 flex items-center gap-2">
            <Home className="h-3 w-3 text-neutral-500" aria-hidden="true" />
            <ChevronRight className="h-3 w-3 text-neutral-600" aria-hidden="true" />
            <span className="text-[11px] font-semibold text-white">{u("nav.dashboard")}</span>
            <div className="ml-auto hidden md:flex w-56 items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.03] px-2 py-1 text-[10px] text-neutral-500">
              <Search className="h-3 w-3" aria-hidden="true" />
              <span className="truncate">{u("searchPlaceholder")}</span>
              <span className="ml-auto rounded border border-white/10 px-1 font-mono text-[9px]">Ctrl K</span>
            </div>
          </div>

          <div className="mb-3 flex items-end gap-2">
            <span className="font-display text-lg font-bold text-white">{u("nav.dashboard")}</span>
            <span className="mb-1 inline-flex items-center gap-1 text-[10px] text-neutral-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> {u("updated")}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {kpis.map(([Icon, label, value, delta, pts]) => (
              <div key={label} className="rounded-lg border border-white/[0.07] bg-[#111114] p-2.5">
                <div className="flex items-center gap-1.5 text-[10px] text-neutral-400">
                  <Icon className="h-3 w-3 text-orange-400" aria-hidden="true" />
                  <span className="truncate">{label}</span>
                </div>
                <div className="mt-1 flex items-baseline justify-between gap-1">
                  <span className="font-display text-base font-bold text-white">{value}</span>
                  <span className="text-[9px] font-semibold text-emerald-400">{delta}</span>
                </div>
                <Spark points={pts} />
              </div>
            ))}
          </div>

          <div className="mt-2 grid grid-cols-3 gap-2 text-[10px]">
            <div className="flex items-center gap-1.5 rounded-md border border-red-500/30 bg-red-500/[0.07] px-2 py-1.5 text-red-200">
              <AlertOctagon className="h-3 w-3" aria-hidden="true" /> <span className="truncate">{u("criticalOpen")}</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-md border border-amber-400/30 bg-amber-400/[0.07] px-2 py-1.5 text-amber-200">
              <AlertTriangle className="h-3 w-3" aria-hidden="true" /> <span className="truncate">{u("slaRisk")}</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.03] px-2 py-1.5 text-neutral-300">
              <ListChecks className="h-3 w-3" aria-hidden="true" /> <span className="truncate">{u("queued")}</span>
            </div>
          </div>

          <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
            <div className="min-w-0 rounded-lg border border-white/[0.07] bg-[#111114] p-2.5">
              <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold text-white">
                <Filter className="h-3 w-3 text-orange-400" aria-hidden="true" /> {u("funnel")}
              </div>
              <div className="space-y-1.5">
                {phases.map((p, i) => (
                  <div key={p} className="grid grid-cols-[minmax(0,5.5rem)_1fr_1.25rem] items-center gap-2 text-[10px]">
                    <span className="truncate text-neutral-400">{u(`phases.${p}`)}</span>
                    <span className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
                      <span
                        className="block h-full rounded-full bg-gradient-to-r from-orange-600 to-orange-400"
                        style={{ width: `${phaseWidth[i]}%` }}
                      />
                    </span>
                    <span className="text-right font-display font-bold text-white">{phaseCount[i]}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="min-w-0 rounded-lg border border-white/[0.07] bg-[#111114] p-2.5">
              <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold text-white">
                <BarChart3 className="h-3 w-3 text-orange-400" aria-hidden="true" /> {u("bySeverity")}
              </div>
              <div className="flex h-16 items-end gap-1.5">
                {bars.map((b, i) => (
                  <div key={i} className="flex flex-1 flex-col-reverse overflow-hidden rounded-sm">
                    {b
                      .slice()
                      .reverse()
                      .map((v, j) => (
                        <div key={j} className={barColors[3 - j]} style={{ height: `${v * 2}px` }} />
                      ))}
                  </div>
                ))}
              </div>
              <div className="mt-2 flex flex-wrap gap-x-2 gap-y-0.5 text-[9px] text-neutral-400">
                {(["critical", "high", "medium", "low"] as const).map((s, i) => (
                  <span key={s} className="inline-flex items-center gap-1">
                    <span className={`h-1.5 w-1.5 rounded-full ${barColors[i]}`} /> {u(`sev.${s}`)}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Frame>
  );
};

/* ------------------------------------------------------------------ */
/* Recursos                                                            */
/* ------------------------------------------------------------------ */

export const CaseTimelineMock = () => {
  const u = useUi();
  const rows: [string, string, string, "done" | "now" | "todo"][] = [
    ["detection", "14:02", u("timeline.detection"), "done"],
    ["triage", "14:10", u("timeline.triage"), "done"],
    ["investigation", "14:28", u("timeline.investigation"), "done"],
    ["containment", "14:47", u("timeline.containment"), "now"],
    ["eradication", "", "", "todo"],
  ];
  return (
    <Frame label={`${u("nav.cases")} #4587 · ${u("caseTitle")}`} className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-white/[0.06] px-4 py-3">
        <span className="font-mono text-[11px] text-neutral-400">#4587</span>
        <span className="truncate text-xs font-semibold text-white">{u("caseTitle")}</span>
        <span className="ml-auto">
          <Chip tone="high">{u("caseStatus")}</Chip>
        </span>
      </div>
      <ol className="flex flex-1 flex-col justify-evenly px-4 py-3">
        {rows.map(([phase, time, text, state], i) => (
          <li key={phase} className="relative flex gap-3 pb-3 last:pb-0">
            {i < rows.length - 1 ? (
              <span className="absolute left-[7px] top-4 h-full w-px bg-white/10" aria-hidden="true" />
            ) : null}
            {state === "done" ? (
              <CheckCircle2 className="relative h-4 w-4 shrink-0 text-emerald-400" aria-hidden="true" />
            ) : state === "now" ? (
              <CircleDot className="relative h-4 w-4 shrink-0 text-orange-400" aria-hidden="true" />
            ) : (
              <Circle className="relative h-4 w-4 shrink-0 text-neutral-600" aria-hidden="true" />
            )}
            <div className="grid min-w-0 flex-1 grid-cols-[88px_36px_1fr] items-baseline gap-2 text-[11px]">
              <span className={`font-semibold ${state === "todo" ? "text-neutral-500" : "text-white"}`}>
                {u(`phases.${phase}`)}
              </span>
              <span className="font-mono text-neutral-500">{time}</span>
              <span className="text-neutral-400">{text || "·"}</span>
            </div>
          </li>
        ))}
      </ol>
      <div className="mx-4 mb-4 rounded-lg border border-white/[0.07] bg-[#111114] p-3">
        <div className="mb-1 flex items-center gap-2 text-[10px] text-neutral-500">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-500/20 text-[9px] font-bold text-orange-300">
            JL
          </span>
          João Lima · {u("ago7")}
        </div>
        <p className="text-[11px] leading-relaxed text-neutral-300">{u("comment")}</p>
      </div>
    </Frame>
  );
};

export const AlertQueueMock = () => {
  const u = useUi();
  const rows = useUiList("alertRows");
  const data: [string, keyof typeof SEV, string][] = [
    ["10:41:26", "critical", u("sev.critical")],
    ["10:37:09", "high", u("sev.high")],
    ["10:21:55", "medium", u("sev.medium")],
  ];
  return (
    <Frame label={u("nav.alerts")}>
      <table className="w-full table-fixed text-[10.5px]">
        <colgroup>
          <col className="w-[66px]" />
          <col className="w-[52px]" />
          <col />
          <col className="w-[74px]" />
        </colgroup>
        <thead>
          <tr className="border-b border-white/[0.06] text-left text-neutral-500">
            <th className="px-3 py-2 font-medium">{u("cols.time")}</th>
            <th className="px-2 py-2 font-medium">{u("cols.source")}</th>
            <th className="px-2 py-2 font-medium">{u("cols.description")}</th>
            <th className="px-3 py-2 text-right font-medium">{u("cols.severity")}</th>
          </tr>
        </thead>
        <tbody>
          {data.map(([time, sev, label], i) => (
            <tr key={time} className="border-b border-white/[0.04] last:border-0">
              <td className="px-3 py-2 font-mono text-neutral-400">{time}</td>
              <td className="px-2 py-2 text-neutral-300">Wazuh</td>
              <td className="truncate px-2 py-2 text-neutral-200">{rows[i]}</td>
              <td className="px-3 py-2 text-right">
                <Chip tone={sev}>{label}</Chip>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Frame>
  );
};

export const AnalysisMock = () => {
  const u = useUi();
  return (
    <Frame label={`${u("reputation")} · 185.220.101.4`} className="p-3.5">
      <div className="mb-3 flex items-center gap-2 rounded-lg border border-white/10 bg-black/40 px-3 py-2">
        <span className="font-mono text-sm text-white">185.220.101.4</span>
        <Copy className="ml-auto h-3.5 w-3.5 text-neutral-500" aria-hidden="true" />
      </div>
      <dl className="grid grid-cols-[1fr_auto] gap-y-2 text-[11px]">
        <dt className="text-neutral-400">{u("reputation")}</dt>
        <dd className="text-right">
          <Chip tone="critical">{u("malicious")}</Chip>
        </dd>
        <dt className="text-neutral-400">TLP</dt>
        <dd className="text-right">
          <Chip tone="medium">TLP:AMBER</Chip>
        </dd>
        <dt className="text-neutral-400">PAP</dt>
        <dd className="text-right">
          <Chip tone="ok">PAP:GREEN</Chip>
        </dd>
      </dl>
      <div className="mt-3 flex gap-1.5 text-[9px] text-neutral-400">
        {["VirusTotal", "AbuseIPDB", "MISP"].map((s) => (
          <span key={s} className="rounded border border-white/10 px-1.5 py-0.5">
            {s}
          </span>
        ))}
      </div>
    </Frame>
  );
};

export const SearchMock = () => {
  const u = useUi();
  const results = useUiList("searchResults");
  const icons = [FolderClosed, Zap, FileText];
  return (
    <Frame label={u("nav.search")} className="p-3">
      <div className="mb-2 flex items-center gap-2 rounded-lg border border-orange-500/30 bg-black/40 px-2.5 py-2 shadow-[0_0_0_3px_rgba(249,115,22,0.08)]">
        <Search className="h-3.5 w-3.5 text-orange-400" aria-hidden="true" />
        <span className="font-mono text-xs text-white">{u("searchQuery")}</span>
        <span className="ml-0.5 h-3.5 w-px animate-pulse bg-orange-400" aria-hidden="true" />
        <span className="ml-auto rounded border border-white/10 px-1 font-mono text-[9px] text-neutral-500">Esc</span>
      </div>
      <ul className="space-y-1">
        {results.map((r, i) => {
          const Icon = icons[i] ?? FileText;
          return (
            <li
              key={r}
              className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-[10.5px] ${
                i === 0 ? "bg-orange-500/10 text-white shadow-[inset_2px_0_0_#f97316]" : "text-neutral-400"
              }`}
            >
              <Icon className="h-3 w-3 shrink-0" aria-hidden="true" />
              <span className="truncate">{r}</span>
            </li>
          );
        })}
      </ul>
    </Frame>
  );
};

export const KpiMock = () => {
  const u = useUi();
  return (
    <Frame label={u("bySeverity")} className="grid grid-cols-2 gap-2 p-3">
      <div className="rounded-lg border border-white/[0.07] bg-[#111114] p-2.5">
        <div className="text-[10px] text-neutral-400">{u("openCases")}</div>
        <div className="flex items-baseline gap-1.5">
          <span className="font-display text-xl font-bold text-white">28</span>
          <span className="text-[9px] font-semibold text-emerald-400">-12%</span>
        </div>
        <Spark points={[40, 38, 41, 35, 33, 31, 30, 28]} />
      </div>
      <div className="rounded-lg border border-white/[0.07] bg-[#111114] p-2.5">
        <div className="text-[10px] text-neutral-400">{u("slaOnTime")}</div>
        <div className="flex items-baseline gap-1.5">
          <span className="font-display text-xl font-bold text-white">{u("slaValue")}</span>
          <Gauge className="h-3 w-3 text-emerald-400" aria-hidden="true" />
        </div>
        <Spark points={[88, 90, 89, 92, 93, 95, 94, 96]} />
      </div>
    </Frame>
  );
};

export const ChangesMock = () => {
  const u = useUi();
  const rows = useUiList("changeRows");
  const states: ["waiting" | "approved" | "done", "high" | "ok" | "muted"][] = [
    ["waiting", "high"],
    ["approved", "ok"],
    ["done", "muted"],
  ];
  return (
    <Frame label={u("nav.changes")}>
      <ul className="divide-y divide-white/[0.05]">
        {states.map(([state, tone], i) => (
          <li key={state} className="flex items-center gap-3 px-3.5 py-2.5 text-[11px]">
            <span className="font-mono text-neutral-500">
              {u("changePrefix")}-{102 - i}
            </span>
            <span className="truncate text-neutral-200">{rows[i]}</span>
            <span className="ml-auto">
              <Chip tone={tone}>{u(`changeStatus.${state}`)}</Chip>
            </span>
          </li>
        ))}
      </ul>
    </Frame>
  );
};

export const KbMock = () => {
  const u = useUi();
  const rows = useUiList("kbRows");
  const status: ["published" | "review", "ok" | "medium"][] = [
    ["published", "ok"],
    ["published", "ok"],
    ["review", "medium"],
  ];
  return (
    <Frame label={u("nav.kb")}>
      <ul className="divide-y divide-white/[0.05]">
        {rows.map((r, i) => (
          <li key={r} className="flex items-center gap-2.5 px-3.5 py-2.5 text-[11px]">
            <FileText className="h-3.5 w-3.5 shrink-0 text-neutral-500" aria-hidden="true" />
            <span className="truncate text-neutral-200">{r}</span>
            <span className="ml-auto">
              <Chip tone={status[i][1]}>{u(`kbStatus.${status[i][0]}`)}</Chip>
            </span>
          </li>
        ))}
      </ul>
    </Frame>
  );
};

/* ------------------------------------------------------------------ */
/* Aprovação e MSSP                                                    */
/* ------------------------------------------------------------------ */

export const ApprovalMock = () => {
  const { t } = useTranslation();
  const trail = t("inora.approval.trail", { returnObjects: true }) as string[];
  return (
    <Frame
      label={String(t("inora.approval.action"))}
      className="border-orange-500/30 p-5 md:p-6 shadow-[0_0_60px_-15px_rgba(249,115,22,0.45)]"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="flex min-w-0 flex-1 gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-orange-500/30 bg-orange-500/10">
            <ShieldCheck className="h-4.5 w-4.5 text-orange-400" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-white">{t("inora.approval.action")}</div>
            <div className="mt-0.5 text-xs text-neutral-400">{t("inora.approval.requested")}</div>
            <div className="mt-2 inline-flex items-center gap-1.5 rounded-md border border-amber-400/30 bg-amber-400/10 px-2 py-1 text-[11px] font-medium text-amber-200">
              <AlertTriangle className="h-3 w-3" aria-hidden="true" />
              {t("inora.approval.waiting")}
            </div>
          </div>
        </div>
        <div className="flex gap-2 sm:flex-col">
          <span className="rounded-full bg-orange-500 px-5 py-1.5 text-center text-xs font-semibold text-black shadow-[0_8px_26px_-8px_rgba(249,115,22,0.65)]">
            {t("inora.approval.approve")}
          </span>
          <span className="rounded-full border border-white/20 px-5 py-1.5 text-center text-xs font-semibold text-neutral-200">
            {t("inora.approval.reject")}
          </span>
        </div>
      </div>
      <div className="mt-5 border-t border-white/[0.07] pt-4">
        <div className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-neutral-500">
          {t("inora.approval.trailTitle")}
        </div>
        <ol className="space-y-2.5">
          {trail.map((line, i) => (
            <li key={line} className="flex items-start gap-3 text-xs">
              <span className="mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full border-2 border-orange-500 bg-black" aria-hidden="true" />
              <span className="font-mono text-neutral-500">14:5{2 + i}</span>
              <span className="text-neutral-300">{line}</span>
            </li>
          ))}
        </ol>
      </div>
    </Frame>
  );
};

export const MsspMock = () => {
  const u = useUi();
  const rows = useUiList("msspRows");
  const clients: [string, string, string, "ok" | "medium" | "critical", string][] = [
    ["AT", "Alpha Tecnologia", "bg-emerald-500/20 text-emerald-300", "ok", u("healthStatus.ok")],
    ["BS", "Beta Serviços", "bg-amber-400/20 text-amber-300", "medium", u("healthStatus.warn")],
    ["GT", "Gama TI", "bg-red-500/20 text-red-300", "critical", u("healthStatus.bad")],
  ];
  const queue: [string, string, string, "ok" | "medium" | "critical"][] = [
    ["Alpha Tecnologia", "#4587", "3h 14", "ok"],
    ["Beta Serviços", "#4579", "37 min", "medium"],
    ["Gama TI", "#4572", u("atRisk"), "critical"],
  ];
  const side: [typeof LayoutGrid, string][] = [
    [Gauge, u("msspConsole")],
    [Building2, u("clientsNav")],
    [Briefcase, u("consolidated")],
    [Timer, "SLA"],
    [BarChart3, u("reports")],
  ];
  return (
    <Frame label={u("msspConsole")} className="w-full">
      <div className="flex items-center gap-3 border-b border-white/[0.06] px-3.5 py-2.5">
        <InoraLockup size="sm" />
        <span className="hidden sm:inline text-[11px] font-semibold text-white">{u("msspConsole")}</span>
        <span className="ml-auto inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.03] px-2 py-1 text-[10px] text-neutral-300">
          {u("clientLabel")}: Alpha Tecnologia
        </span>
        <span className="rounded border border-white/10 px-1.5 py-0.5 font-mono text-[9px] text-neutral-500">Alt + C</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-[132px_1fr]">
        <aside className="hidden sm:block border-r border-white/[0.06] bg-[#08080a] p-2">
          {side.map(([Icon, label], i) => (
            <div
              key={label}
              className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-[10.5px] ${
                i === 0 ? "bg-orange-500/10 text-white shadow-[inset_2px_0_0_#f97316]" : "text-neutral-400"
              }`}
            >
              <Icon className="h-3 w-3" aria-hidden="true" /> <span className="truncate">{label}</span>
            </div>
          ))}
        </aside>
        <div className="min-w-0 p-3">
          <div className="mb-2 text-[11px] font-semibold text-white">{u("health")}</div>
          <div className="mb-3 grid grid-cols-3 gap-2">
            {clients.map(([mono, name, color, tone, status]) => (
              <div key={name} className="flex items-center gap-2 rounded-lg border border-white/[0.07] bg-[#111114] p-2">
                <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[9px] font-bold ${color}`}>
                  {mono}
                </span>
                <div className="min-w-0">
                  <div className="truncate text-[10px] text-neutral-200">{name}</div>
                  <Chip tone={tone}>{status}</Chip>
                </div>
              </div>
            ))}
          </div>
          <div className="mb-1.5 text-[11px] font-semibold text-white">{u("queue")}</div>
          <table className="w-full table-fixed text-[10px]">
            <colgroup>
              <col className="w-[30%]" />
              <col className="w-[44px]" />
              <col />
              <col className="w-[60px]" />
            </colgroup>
            <thead>
              <tr className="text-left text-neutral-500">
                <th className="py-1 font-medium">{u("cols.client")}</th>
                <th className="py-1 font-medium">{u("cols.case")}</th>
                <th className="py-1 font-medium">{u("cols.description")}</th>
                <th className="py-1 text-right font-medium">{u("cols.sla")}</th>
              </tr>
            </thead>
            <tbody>
              {queue.map(([client, id, sla, tone], i) => (
                <tr key={id} className="border-t border-white/[0.05]">
                  <td className="truncate py-1.5 pr-2 text-neutral-300">{client}</td>
                  <td className="py-1.5 pr-2 font-mono text-neutral-400">{id}</td>
                  <td className="truncate py-1.5 pr-2 text-neutral-200">{rows[i]}</td>
                  <td className="py-1.5 text-right">
                    <Chip tone={tone}>{sla}</Chip>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Frame>
  );
};
