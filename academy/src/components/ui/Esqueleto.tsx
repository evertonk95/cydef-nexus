import { cn } from "@/lib/cn";

export function Esqueleto({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cn("skeleton", className)} />;
}
