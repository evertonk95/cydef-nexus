import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import i18n, { ensureLang } from "@/i18n";
import { OfertaPlataforma, OfertaTrilha } from "./Ofertas";

const base = { preco_centavos: 49700, preco_observacao: "", checkout_url: "https://pay.hotmart.com/P1234567Q" };

describe("texto das ofertas com um curso só", () => {
  beforeEach(async () => {
    await ensureLang("pt");
    await i18n.changeLanguage("pt");
  });

  it("plataforma no singular", () => {
    render(<OfertaPlataforma oferta={{ ...base, tipo: "plataforma", nome: "Academy", trilha: null, duracao_dias: 365, cursos: 1 }} />);
    expect(screen.getByText("O curso pago de hoje, e os que forem lançados no período, por 12 meses.")).toBeInTheDocument();
  });

  it("trilha no singular", () => {
    render(<OfertaTrilha oferta={{ ...base, tipo: "trilha", nome: "Trilha SOC", trilha: "soc", duracao_dias: null, cursos: 1 }} titulo="SOC" />);
    expect(screen.getByText(/Trilha completa, com o curso que ela tem hoje:/)).toBeInTheDocument();
  });
});
