/** Um bloco do texto: parágrafo (com as quebras de linha) ou lista de itens. */
export type Bloco = { tipo: "paragrafo"; linhas: string[] } | { tipo: "lista"; itens: string[] };

const MARCADOR = /^\s*[•\-*–]\s+/;

/**
 * Lê o texto como o instrutor digitou no painel: linha em branco separa
 * parágrafos, linha que começa com "•", "-", "*" ou "–" vira item de lista e
 * quebra de linha simples continua sendo quebra. Não interpreta HTML nem
 * Markdown: tudo vira texto.
 */
export function blocosDoTexto(texto: string): Bloco[] {
  const blocos: Bloco[] = [];
  let atual: Bloco | null = null;
  for (const bruta of texto.replace(/\r\n?/g, "\n").split("\n")) {
    const linha = bruta.trim();
    if (!linha) {
      atual = null;
      continue;
    }
    if (MARCADOR.test(linha)) {
      const item = linha.replace(MARCADOR, "");
      if (atual?.tipo === "lista") atual.itens.push(item);
      else blocos.push((atual = { tipo: "lista", itens: [item] }));
    } else if (atual?.tipo === "paragrafo") {
      atual.linhas.push(linha);
    } else {
      blocos.push((atual = { tipo: "paragrafo", linhas: [linha] }));
    }
  }
  return blocos;
}
