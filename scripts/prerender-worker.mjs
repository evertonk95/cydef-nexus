// Worker de pré-render de UMA rota (chamado pelo scripts/prerender.mjs).
// argv: [rota, caminhoDoBundle, origin]
// Imprime JSON { html } no stdout com o index.html final (root preenchido,
// title/lang corretos, links canonical/hreflang). Exit != 0 ou stdout vazio =
// rota falhou (o orquestrador mantém o template original — fail-safe).
import { JSDOM } from "jsdom";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const [route, bundleTmp, origin] = process.argv.slice(2);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

class NoopObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}

const file = path.join(
  ROOT,
  "dist",
  route === "/" ? "index.html" : path.join(route, "index.html"),
);
const template = readFileSync(file, "utf8");
const dom = new JSDOM(template, {
  url: `${origin}${route}`,
  pretendToBeVisual: true,
  runScripts: "outside-only",
});
const win = dom.window;

// --- polyfills no window do jsdom (APIs que ele não implementa) ---
if (typeof win.matchMedia !== "function") {
  Object.defineProperty(win, "matchMedia", {
    value: () => ({
      matches: false,
      media: "",
      onchange: null,
      addListener() {},
      removeListener() {},
      addEventListener() {},
      removeEventListener() {},
      dispatchEvent: () => false,
    }),
    configurable: true,
  });
}
win.scrollTo = () => {};
win.scrollBy = () => {};
if (typeof win.Element !== "undefined" && !win.Element.prototype.scrollIntoView) {
  win.Element.prototype.scrollIntoView = () => {};
}
if (win.navigator && typeof win.navigator.sendBeacon !== "function") {
  Object.defineProperty(win.navigator, "sendBeacon", {
    value: () => true,
    configurable: true,
  });
}

const sandbox = {
  window: win,
  document: win.document,
  self: win,
  top: win,
  parent: win,
  location: win.location,
  history: win.history,
  navigator: win.navigator,
  IntersectionObserver: NoopObserver,
  ResizeObserver: NoopObserver,
  MutationObserver: win.MutationObserver,
  getComputedStyle: (el) => win.getComputedStyle(el),
  requestAnimationFrame: (cb) => win.requestAnimationFrame(cb),
  cancelAnimationFrame: (id) => win.cancelAnimationFrame(id),
  // Stats da Academy (Supabase) fora do pré-render: o número real chega via
  // polling no cliente. Sem isso o HTML poderia sair com o número e o primeiro
  // render do cliente sem ele → mismatch de hidratação.
  fetch: (url, opts) =>
    String(url).includes("supabase.co")
      ? Promise.reject(new Error("prerender: supabase stats indisponivel"))
      : globalThis.fetch(url, opts),
  Headers: globalThis.Headers,
  Request: globalThis.Request,
  Response: globalThis.Response,
  TextEncoder: globalThis.TextEncoder,
  TextDecoder: globalThis.TextDecoder,
  atob: globalThis.atob,
  btoa: globalThis.btoa,
  crypto: globalThis.crypto,
  performance: globalThis.performance,
  structuredClone: globalThis.structuredClone,
  AbortController: globalThis.AbortController,
  AbortSignal: globalThis.AbortSignal,
  Blob: globalThis.Blob,
  File: globalThis.File,
  FormData: globalThis.FormData,
  ReadableStream: globalThis.ReadableStream,
  WritableStream: globalThis.WritableStream,
  TransformStream: globalThis.TransformStream,
  BroadcastChannel: globalThis.BroadcastChannel,
  DOMException: globalThis.DOMException,
  setTimeout,
  clearTimeout,
  setInterval,
  clearInterval,
  queueMicrotask,
  console,
  process,
  Buffer,
  URL,
  URLSearchParams,
  Promise,
};
sandbox.globalThis = sandbox;

// --- construtores do DOM do jsdom ---
// O sandbox expunha só APIs "soltas" (Blob, File, FormData, streams,
// DOMException). Os construtores do DOM ficavam de fora, e o bundle os usa via
// `instanceof`: com o formulário de captura ativo, o ref de `register()` do
// react-hook-form cai em `isHTMLElement` (`value instanceof HTMLElement`)
// durante os layout effects. Sem o construtor o ReferenceError derruba a
// árvore React, o #root fica com < 400 caracteres e o worker lança
// "HTML nao estabilizou" (fallback de shell). Repassamos os construtores do
// próprio jsdom (as mesmas funções que criaram os nós: `instanceof` funciona),
// pulando com segurança o que não existir no jsdom.
const DOM_GLOBALS = [
  // núcleo do DOM
  "Event",
  "CustomEvent",
  "UIEvent",
  "MouseEvent",
  "PointerEvent",
  "KeyboardEvent",
  "FocusEvent",
  "InputEvent",
  "CompositionEvent",
  "WheelEvent",
  "TouchEvent",
  "DragEvent",
  "ClipboardEvent",
  "AnimationEvent",
  "TransitionEvent",
  "Node",
  "Element",
  "Text",
  "CharacterData",
  "Comment",
  "DocumentFragment",
  "ShadowRoot",
  "HTMLCollection",
  "NodeList",
  "DOMParser",
  "XMLSerializer",
  "Range",
  "Selection",
  "CSSStyleDeclaration",
  "DOMRect",
  "Image",
  // elementos HTML (react-hook-form toca os de formulário)
  "HTMLElement",
  "HTMLInputElement",
  "HTMLSelectElement",
  "HTMLTextAreaElement",
  "HTMLButtonElement",
  "HTMLFormElement",
  "HTMLLabelElement",
  "HTMLAnchorElement",
  "HTMLDivElement",
  "HTMLSpanElement",
  "HTMLParagraphElement",
  "HTMLHeadingElement",
  "HTMLImageElement",
  "HTMLUListElement",
  "HTMLOListElement",
  "HTMLLIElement",
  "HTMLTableElement",
  "HTMLIFrameElement",
  "SVGElement",
  "SVGSVGElement",
];
for (const name of DOM_GLOBALS) {
  if (typeof win[name] === "function") sandbox[name] = win[name];
}

const bundleCode = readFileSync(bundleTmp, "utf8");

async function main() {
  const ctx = vm.createContext(sandbox);
  vm.runInContext(bundleCode, ctx, { filename: "app-bundle.cjs" });

  // Estabilidade: aguarda o #root ter conteúdo e ficar 480ms sem mudanças.
  const started = Date.now();
  let lastHtml = "";
  let stableFor = 0;
  while (Date.now() - started < 9000) {
    await sleep(120);
    const root = win.document.getElementById("root");
    const html = root ? root.innerHTML : "";
    if (html.length < 400) continue;
    if (html === lastHtml) {
      stableFor += 120;
      if (stableFor >= 480) break;
    } else {
      stableFor = 0;
      lastHtml = html;
    }
  }
  const doc = win.document;
  const rootHtml = doc.getElementById("root")?.innerHTML ?? "";
  if (rootHtml.length < 400) throw new Error("HTML nao estabilizou");

  const title = doc.title || "CyDef";
  const lang = doc.documentElement.getAttribute("lang") || "en";
  const extra = [
    ...doc.head.querySelectorAll('link[rel="canonical"], link[rel="alternate"]'),
  ]
    .map((l) => l.outerHTML)
    .join("");

  let out = template
    .replace(/<html[^>]*>/, `<html lang="${lang}">`)
    .replace(/<title>.*?<\/title>/, `<title>${title}</title>`)
    .replace(/<div id="root"><\/div>/, `<div id="root">${rootHtml}</div>`);
  if (extra) out = out.replace("</head>", `${extra}</head>`);

  // Flush antes do exit: com HTML grande (> pipe buffer do SO), o write é
  // assíncrono — sair na hora truncava o stdout no Linux/CI e o JSON do
  // orquestrador quebrava (rota caía para o template shell).
  process.stdout.write(JSON.stringify({ html: out }), () => {
    dom.window.close();
    process.exit(0);
  });
}

main().catch((err) => {
  try {
    process.stderr.write(String((err && err.stack) || err));
  } catch {
    /* stderr indisponível */
  }
  try {
    dom.window.close();
  } catch {
    /* já fechado */
  }
  process.exit(1);
});
