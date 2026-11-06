import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const container = document.getElementById("root")!;

// O HTML já vem pré-renderizado (scripts/prerender.mjs) e serve para SEO: o
// primeiro paint ainda depende do JS, porque `createRoot` descarta o markup
// estático ao montar.
//
// Tentativa de `hydrateRoot` em 06/11/2026: o React 19 falha com erro #418
// (HTML do servidor não casa com o render do cliente) nesta árvore, então ele
// refaz tudo do zero e o conteúdo pré-renderizado pisca fora da tela entre a
// hidratação e o novo render. Enquanto a divergência não for corrigida, o
// caminho é o createRoot somado ao preload do chunk da rota (feito no
// scripts/prerender.mjs), que encurta a janela em branco.
createRoot(container).render(<App />);
