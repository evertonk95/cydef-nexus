import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const container = document.getElementById("root")!;
// O HTML já vem pré-renderizado (scripts/prerender.mjs) — o React assume o
// container no mount: o conteúdo estático fica visível até lá (SEO + perceived
// performance) e é substituído pelo mesmo markup. NOTA: hydrateRoot seria o
// ideal (sem re-paint), mas o React 18 não hidrata Suspense client-only (as
// rotas lazy do P3-01 exigem Suspense) — registrar para reavaliar no React 19.
createRoot(container).render(<App />);
