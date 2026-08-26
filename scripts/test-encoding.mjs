import { readFileSync } from "node:fs";

const md = readFileSync(
  "C:/Users/User/Documents/Squads100/squads/cydef-security-editorial/output/2026-08-24-183100-article02/article.md",
  "utf8"
);
const m = md.match(/title:\s*"([^"]+)"/);
console.log("TITLE lido pelo Node:", m ? m[1] : "N/A");
console.log("Tem BOM:", md.charCodeAt(0) === 0xfeff);

const t = readFileSync("src/lib/blog/posts-extra.generated.ts", "utf8");
console.log("Contém sequência literal backslash-u-0001:", t.includes("\\u0001"));
console.log("Contém caractere de controle real U+0001:", t.includes(String.fromCharCode(1)));
const i = t.indexOf("táticas");
console.log("Trecho ao redor:", JSON.stringify(t.slice(i - 30, i + 10)));
