import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, GraduationCap } from "lucide-react";
import { primaryCtaClass } from "./ctaStyles";

/** Miolo do botao principal (icone laranja + texto + seta). Serve para Link, <a> e <button>. */
export const PrimaryCtaContent = ({ children, icon }: { children: ReactNode; icon?: ReactNode }) => (
  <>
    <span className="shrink-0 w-8 h-8 rounded-full bg-gradient-to-b from-orange-400 to-orange-600 flex items-center justify-center ring-1 ring-white/20 shadow-lg shadow-orange-500/30">
      {icon ?? <GraduationCap className="w-4 h-4 text-white" aria-hidden="true" />}
    </span>
    <span className="tracking-tight sm:whitespace-nowrap">{children}</span>
    <span className="shrink-0 w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-white/80 group-hover:translate-x-0.5 transition-transform duration-200 ease-out">
      <ArrowRight className="w-3 h-3" aria-hidden="true" />
    </span>
  </>
);

/** Botao principal como link interno. */
export const PrimaryCta = ({ to, children }: { to: string; children: ReactNode }) => (
  <Link to={to} className={primaryCtaClass}>
    <PrimaryCtaContent>{children}</PrimaryCtaContent>
  </Link>
);
