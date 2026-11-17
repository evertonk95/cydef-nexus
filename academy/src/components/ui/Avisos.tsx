import { AnimatePresence, motion } from "motion/react";
import { useCallback, useRef, useState, type ReactNode } from "react";
import { CtxAvisos, type Aviso } from "./avisos-ctx";
import { CheckCircle2, Info } from "lucide-react";

export function ProvedorAvisos({ children }: { children: ReactNode }) {
  const [avisos, setAvisos] = useState<Aviso[]>([]);
  const seq = useRef(0);
  const mostrar = useCallback((a: Omit<Aviso, "id">) => {
    seq.current += 1;
    const id = seq.current;
    setAvisos((l) => [...l.slice(-2), { ...a, id }]);
    window.setTimeout(() => setAvisos((l) => l.filter((x) => x.id !== id)), 4200);
  }, []);
  return (
    <CtxAvisos.Provider value={mostrar}>
      {children}
      <div aria-live="polite" role="status" className="pointer-events-none fixed right-5 bottom-5 z-50 flex w-[min(380px,calc(100vw-40px))] flex-col gap-2">
        <AnimatePresence initial={false}>
          {avisos.map((a) => (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0, transition: { duration: 0.24, ease: [0.2, 0.8, 0.2, 1] } }}
              exit={{ opacity: 0, y: 8, transition: { duration: 0.16, ease: [0.4, 0, 1, 1] } }}
              className={
                a.tipo === "ok"
                  ? "flex items-center gap-3 rounded-2xl border border-ok/45 bg-[rgba(10,20,13,0.96)] px-4 py-3 shadow-[0_20px_50px_-18px_rgba(74,222,128,0.45)]"
                  : "flex items-center gap-3 rounded-2xl border border-orange/45 bg-[rgba(20,12,6,0.96)] px-4 py-3 shadow-[0_20px_50px_-18px_rgba(249,115,22,0.45)]"
              }
            >
              {a.tipo === "ok" ? <CheckCircle2 className="size-6 flex-none text-ok" aria-hidden="true" /> : <Info className="size-6 flex-none text-orange" aria-hidden="true" />}
              <div>
                <p className="m-0 text-[15px] font-semibold">{a.titulo}</p>
                {a.texto && <p className="m-0 text-[13.5px] text-muted">{a.texto}</p>}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </CtxAvisos.Provider>
  );
}

