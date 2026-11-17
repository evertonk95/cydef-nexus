import { useEffect, useRef } from "react";

/**
 * Fundo da central: grade sutil, arco de partículas no horizonte e rede de
 * pontos que reage ao mouse. Pausa quando a aba sai de foco e fica estático
 * para quem pediu menos movimento no sistema.
 */
export function FundoParticulas({ intensidade = "cheia" }: { intensidade?: "cheia" | "discreta" }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current;
    const ctx = cv?.getContext("2d");
    if (!cv || !ctx) return;
    const reduzir = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    const DPR = Math.min(window.devicePixelRatio || 1, 1.5);
    let W = 0;
    let H = 0;
    let mx = 0;
    let my = 0;
    let tx = 0;
    let ty = 0;
    let raf = 0;
    const t0 = performance.now();
    type Ponto = { x: number; y: number; vx: number; vy: number; s: number };
    type Grao = { a: number; d: number; o: number };
    let pontos: Ponto[] = [];
    let arco: Grao[] = [];

    const semente = (n: number) => {
      let s = n;
      return () => {
        s = (s * 9301 + 49297) % 233280;
        return s / 233280;
      };
    };

    const montar = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      cv.width = W * DPR;
      cv.height = H * DPR;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      const r = semente(7);
      const total = intensidade === "cheia" ? Math.round(Math.min(90, (W * H) / 16000)) : 24;
      pontos = Array.from({ length: total }, () => ({
        x: r() * W, y: r() * H, vx: (r() - 0.5) * 0.18, vy: (r() - 0.5) * 0.18, s: r() * 1.4 + 0.4,
      }));
      const r2 = semente(3);
      arco = intensidade === "cheia" ? Array.from({ length: 420 }, () => ({ a: r2(), d: r2(), o: r2() })) : [];
    };

    const quadro = (agora: number) => {
      const t = (agora - t0) / 1000;
      tx += (mx - tx) * 0.05;
      ty += (my - ty) * 0.05;
      ctx.clearRect(0, 0, W, H);

      ctx.strokeStyle = "rgba(255,255,255,0.025)";
      ctx.lineWidth = 1;
      const g = 56;
      const ox = (tx * 8) % g;
      const oy = (ty * 8) % g;
      ctx.beginPath();
      for (let x = -g + ox; x < W + g; x += g) { ctx.moveTo(x, 0); ctx.lineTo(x, H); }
      for (let y = -g + oy; y < H + g; y += g) { ctx.moveTo(0, y); ctx.lineTo(W, y); }
      ctx.stroke();

      if (arco.length) {
        const cx = W * 1.02 - tx * 18;
        const cy = H * 1.05 - ty * 12;
        const R = Math.max(W, H) * 0.95;
        const grad = ctx.createLinearGradient(W * 0.35, 0, W, H * 0.4);
        grad.addColorStop(0, "rgba(249,115,22,0)");
        grad.addColorStop(0.6, "rgba(249,115,22,.55)");
        grad.addColorStop(1, "rgba(251,146,60,.9)");
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.6;
        ctx.shadowColor = "rgba(249,115,22,.9)";
        ctx.shadowBlur = 18;
        ctx.beginPath();
        ctx.arc(cx, cy, R, Math.PI * 1.08, Math.PI * 1.62);
        ctx.stroke();
        ctx.shadowBlur = 0;
        for (const p of arco) {
          const ang = Math.PI * 1.08 + p.a * Math.PI * 0.54;
          const rr = R - p.d * p.d * 90;
          const px = cx + Math.cos(ang + t * 0.004) * rr;
          const py = cy + Math.sin(ang + t * 0.004) * rr;
          const brilho = 0.35 + 0.65 * Math.abs(Math.sin(t * 1.3 + p.o * 20));
          ctx.fillStyle = `rgba(251,146,60,${((1 - p.d) * 0.55 * brilho).toFixed(3)})`;
          ctx.fillRect(px, py, 1.4, 1.4);
        }
      }

      for (const a of pontos) {
        a.x += a.vx; a.y += a.vy;
        if (a.x < 0) a.x = W; if (a.x > W) a.x = 0;
        if (a.y < 0) a.y = H; if (a.y > H) a.y = 0;
      }
      for (let i = 0; i < pontos.length; i += 1) {
        const A = pontos[i]!;
        const ax = A.x + tx * 6 * A.s;
        const ay = A.y + ty * 6 * A.s;
        for (let j = i + 1; j < pontos.length; j += 1) {
          const B = pontos[j]!;
          const bx = B.x + tx * 6 * B.s;
          const by = B.y + ty * 6 * B.s;
          const d = (ax - bx) ** 2 + (ay - by) ** 2;
          if (d < 12000) {
            ctx.strokeStyle = `rgba(249,115,22,${(0.1 * (1 - d / 12000)).toFixed(3)})`;
            ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke();
          }
        }
        ctx.fillStyle = `rgba(255,255,255,${(0.18 + A.s * 0.12).toFixed(3)})`;
        ctx.fillRect(ax, ay, A.s, A.s);
      }
      if (!reduzir) raf = requestAnimationFrame(quadro);
    };

    const aoMover = (e: PointerEvent) => {
      mx = (e.clientX / W - 0.5) * 2;
      my = (e.clientY / H - 0.5) * 2;
    };
    const aoRedimensionar = () => {
      montar();
      if (reduzir) quadro(performance.now());
    };
    const aoVisibilidade = () => {
      if (reduzir) return;
      cancelAnimationFrame(raf);
      if (!document.hidden) raf = requestAnimationFrame(quadro);
    };

    montar();
    quadro(performance.now());
    window.addEventListener("resize", aoRedimensionar);
    window.addEventListener("pointermove", aoMover, { passive: true });
    document.addEventListener("visibilitychange", aoVisibilidade);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", aoRedimensionar);
      window.removeEventListener("pointermove", aoMover);
      document.removeEventListener("visibilitychange", aoVisibilidade);
    };
  }, [intensidade]);

  return (
    <>
      <canvas ref={ref} aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 size-full" />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(1200px_700px_at_50%_120%,rgba(0,0,0,0.85),transparent_60%),radial-gradient(900px_500px_at_85%_-10%,rgba(249,115,22,0.10),transparent_70%)]"
      />
    </>
  );
}
