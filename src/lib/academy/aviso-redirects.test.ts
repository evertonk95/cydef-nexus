import { describe, expect, it } from "vitest";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { AVISOS } from "./consent";
import { destinoDaUrlEstavel, paginasDeRedirecionamento } from "./avisoRedirects";

/**
 * URL estável do Aviso de Privacidade (HEL-M01/SEC-003).
 *
 * A URL gravada em `aviso_privacidade.url_estavel` é a prova de consentimento
 * e não muda. O site publica cada versão sob o prefixo de idioma, então o build
 * precisa entregar um arquivo físico em `/academy/privacidade/<versao>/` que
 * leve para a versão publicada. Este teste falha se a urlEstavel de qualquer
 * aviso não existir na saída do build.
 */

const RAIZ = process.cwd();
const avisos = Object.entries(AVISOS).map(([versao, aviso]) => ({
  versao,
  urlEstavel: aviso.urlEstavel,
}));
const paginas = paginasDeRedirecionamento(avisos);

describe("URL estável do aviso de privacidade", () => {
  it("tem uma página de redirecionamento por versão publicada", () => {
    expect(paginas).toHaveLength(Object.keys(AVISOS).length);
    for (const pagina of paginas) {
      expect(pagina.arquivo).toBe(
        `${pagina.urlEstavel.replace(/^\/+/, "")}/index.html`,
      );
    }
  });

  it("redireciona para a versão publicada, com canônica, noindex e fallback", () => {
    for (const pagina of paginas) {
      expect(pagina.destino).toBe(`/pt${pagina.urlEstavel}/`);
      expect(pagina.destino, pagina.versao).toBe(destinoDaUrlEstavel(pagina.urlEstavel));
      expect(pagina.html).toContain(
        `<meta http-equiv="refresh" content="0; url=${pagina.destino}">`,
      );
      expect(pagina.html).toContain(
        `location.replace(${JSON.stringify(pagina.destino)}`,
      );
      expect(pagina.html).toContain(
        `<link rel="canonical" href="https://www.cydef.com.br${pagina.destino}">`,
      );
      expect(pagina.html).toContain('content="noindex, nofollow"');
      expect(pagina.html).toContain(
        `<a class="botao" href="${pagina.destino}">`,
      );
    }
  });

  it("a urlEstavel de cada aviso existe na saída do build", () => {
    // Primeiro prova o gerador (roda em qualquer ordem de CI, sem depender do
    // build ter rodado antes dos testes)...
    const simulada = mkdtempSync(join(tmpdir(), "aviso-redirects-"));
    for (const pagina of paginas) {
      const arquivo = join(simulada, pagina.arquivo);
      mkdirSync(dirname(arquivo), { recursive: true });
      writeFileSync(arquivo, pagina.html, "utf8");
    }
    for (const pagina of paginas) {
      expect(
        existsSync(join(simulada, pagina.arquivo)),
        `gerador não criou ${pagina.urlEstavel}`,
      ).toBe(true);
    }

    // ... e depois confere o dist real, quando existir.
    const dist = join(RAIZ, "dist");
    if (!existsSync(dist)) return;

    for (const pagina of paginas) {
      const arquivo = join(dist, pagina.arquivo);
      expect(
        existsSync(arquivo),
        `build sem ${pagina.urlEstavel}: falta ${pagina.arquivo}`,
      ).toBe(true);
      expect(readFileSync(arquivo, "utf8")).toContain(pagina.destino);
    }
  });

  it("não entra no sitemap", () => {
    const caminhos = [join(RAIZ, "public", "sitemap.xml"), join(RAIZ, "dist", "sitemap.xml")];
    for (const caminho of caminhos) {
      if (!existsSync(caminho)) continue;
      const xml = readFileSync(caminho, "utf8");
      for (const pagina of paginas) {
        expect(xml, `${caminho} não pode listar ${pagina.urlEstavel}`).not.toContain(
          pagina.urlEstavel,
        );
      }
    }
  });
});
