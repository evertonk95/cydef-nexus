/**
 * Páginas de redirecionamento da URL estável do Aviso de Privacidade.
 *
 * A URL estável (`/academy/privacidade/<versao>`, gravada em
 * `aviso_privacidade.url_estavel`) é a prova de consentimento: ela não muda,
 * nunca. Mas o site publica cada página sob o prefixo de idioma
 * (`/pt/academy/privacidade/<versao>/`), então a URL sem idioma respondia 404
 * e o link do portal do aluno caía em página inexistente.
 *
 * Aqui ficam as páginas que o build grava em `/academy/privacidade/<versao>/`:
 * redirecionamento imediato para a versão publicada, `noindex` (fora do
 * sitemap) e um link visível de fallback para quando o redirecionamento não
 * acontecer.
 *
 * Este módulo não importa nada de propósito: o script de build (`node`) e o
 * teste (`vitest`) usam as mesmas funções, cada um passando a sua lista de
 * avisos.
 */

/** Idioma em que o aviso é publicado: o texto do consentimento é o PT canônico. */
export const IDIOMA_AVISO = "pt";

/** Origem usada na canônica. */
export const ORIGEM_SITE = "https://www.cydef.com.br";

export type UrlEstavelDoAviso = {
  versao: string;
  urlEstavel: string;
};

export type PaginaDeRedirecionamento = UrlEstavelDoAviso & {
  /** Caminho de destino, com idioma e barra final. */
  destino: string;
  /** Arquivo relativo à raiz do build. */
  arquivo: string;
  html: string;
};

/** Destino publicado de uma URL estável: `/academy/...` vira `/pt/academy/.../`. */
export function destinoDaUrlEstavel(urlEstavel: string): string {
  const limpa = urlEstavel.startsWith("/") ? urlEstavel : `/${urlEstavel}`;
  return `/${IDIOMA_AVISO}${limpa.replace(/\/+$/, "")}/`;
}

/** Arquivo a gravar no build: `/academy/privacidade/v2026.3` vira `.../index.html`. */
export function arquivoDaUrlEstavel(urlEstavel: string): string {
  const limpa = urlEstavel.replace(/^\/+|\/+$/g, "");
  return `${limpa}/index.html`;
}

/** HTML do redirecionamento: meta refresh 0, location.replace, canônica, noindex e fallback. */
export function htmlDeRedirecionamento(entrada: UrlEstavelDoAviso): string {
  const destino = destinoDaUrlEstavel(entrada.urlEstavel);
  const canonica = `${ORIGEM_SITE}${destino}`;

  return `<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Aviso de Privacidade ${entrada.versao} | CyDef Academy</title>
    <meta name="robots" content="noindex, nofollow">
    <link rel="canonical" href="${canonica}">
    <meta http-equiv="refresh" content="0; url=${destino}">
    <script>
      location.replace(${JSON.stringify(destino)} + location.search + location.hash);
    </script>
    <style>
      :root { color-scheme: dark; }
      body {
        margin: 0;
        min-height: 100vh;
        display: grid;
        place-items: center;
        background: #050505;
        color: #e5e5e5;
        font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
        padding: 2rem;
      }
      main { max-width: 34rem; }
      .selo {
        margin: 0 0 0.5rem;
        font-size: 0.75rem;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        color: #f97316;
      }
      h1 { margin: 0 0 1rem; font-size: 1.5rem; line-height: 1.25; }
      p { margin: 0 0 1rem; line-height: 1.6; color: #a3a3a3; }
      a { color: #f97316; }
      .botao {
        display: inline-block;
        margin-top: 0.5rem;
        padding: 0.7rem 1.1rem;
        border: 1px solid #f97316;
        border-radius: 0.5rem;
        color: #f97316;
        text-decoration: none;
        font-weight: 600;
      }
      .botao:focus-visible { outline: 2px solid #f97316; outline-offset: 3px; }
    </style>
  </head>
  <body>
    <main>
      <p class="selo">CyDef Academy</p>
      <h1>Aviso de Privacidade ${entrada.versao}</h1>
      <p>
        Este é o endereço fixo do aviso da versão ${entrada.versao}. Se o redirecionamento não
        acontecer sozinho, use o link abaixo.
      </p>
      <p><a class="botao" href="${destino}">Abrir o aviso de privacidade ${entrada.versao}</a></p>
    </main>
  </body>
</html>
`;
}

/** Todas as páginas que o build precisa gerar, uma por versão publicada. */
export function paginasDeRedirecionamento(
  avisos: UrlEstavelDoAviso[],
): PaginaDeRedirecionamento[] {
  return avisos.map((entrada) => ({
    ...entrada,
    destino: destinoDaUrlEstavel(entrada.urlEstavel),
    arquivo: arquivoDaUrlEstavel(entrada.urlEstavel),
    html: htmlDeRedirecionamento(entrada),
  }));
}
