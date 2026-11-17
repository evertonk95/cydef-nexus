import { Link } from "react-router";

export function Logo({ para = "/" }: { para?: string }) {
  return (
    <Link
      to={para}
      className="group flex items-center gap-2.5 whitespace-nowrap font-display text-[21px] font-bold tracking-tight"
      aria-label="CyDef Academy, ir para o painel"
    >
      <img
        src="/cydef-icon.webp"
        alt=""
        width={34}
        height={34}
        className="size-[34px] drop-shadow-[0_0_10px_rgba(249,115,22,0.35)] transition-transform duration-500 ease-[var(--ease-out-soft)] group-hover:rotate-60 motion-reduce:transition-none"
      />
      <span>
        CyDef <span className="text-orange">Academy</span>
      </span>
    </Link>
  );
}
