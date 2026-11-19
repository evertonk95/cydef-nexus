import { Link } from "react-router";

/** Marca do portal: o nome Academy é um dos três lugares onde o laranja aparece. */
export function Logo({ para = "/" }: { para?: string }) {
  return (
    <Link
      to={para}
      className="flex items-center gap-2.5 whitespace-nowrap font-display text-lg font-semibold tracking-tight"
      aria-label="CyDef Academy, ir para o painel"
    >
      <img src="/cydef-icon.webp" alt="" width={30} height={30} className="size-[30px]" />
      <span>
        CyDef <span className="text-orange">Academy</span>
      </span>
    </Link>
  );
}
