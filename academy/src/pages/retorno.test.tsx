import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen } from "@testing-library/react";
import type { SupabaseClient } from "@supabase/supabase-js";
import Retorno from "./Retorno";
import { renderizar } from "@/test/utilidades";
import { violacoesGraves } from "@/test/axe";
import { guardarRetornoInicial, lerRetorno } from "@/lib/retorno";

const TOKEN = "a1b2c3d4e5f6a7b8c9d0e1f2";

function sbComVerificacao(erro?: string) {
  const verifyOtp = vi.fn().mockResolvedValue(erro ? { data: {}, error: { message: erro } } : { data: { session: {} }, error: null });
  const sb = {
    rpc: () => Promise.resolve({ data: { nome: "Ana" }, error: null }),
    auth: { verifyOtp, signOut: () => Promise.resolve({ error: null }) },
  } as unknown as SupabaseClient;
  return { sb, verifyOtp };
}

function chegarPeloLink(busca: string, hash = "") {
  const replaceState = vi.fn();
  guardarRetornoInicial({ search: busca, hash, pathname: "/entrar/retorno" }, { replaceState });
  return replaceState;
}

afterEach(() => {
  guardarRetornoInicial({ search: "", hash: "", pathname: "/" });
});

describe("retorno do link de acesso", () => {
  it("lê o token da query, recusa formato estranho e mantém o formato antigo do fragmento", () => {
    expect(lerRetorno("", `?token_hash=${TOKEN}&type=email`)).toEqual({ tipo: "token", tokenHash: TOKEN, tipoOtp: "email" });
    expect(lerRetorno("", `?token_hash=${TOKEN}`)).toEqual({ tipo: "token", tokenHash: TOKEN, tipoOtp: "email" });
    expect(lerRetorno("", `?token_hash=${TOKEN}&type=signup`)).toEqual({ tipo: "erro", codigo: "link_malformado" });
    expect(lerRetorno("", "?token_hash=<script>&type=email")).toEqual({ tipo: "erro", codigo: "link_malformado" });
    expect(lerRetorno("#access_token=abc&type=magiclink", "")).toEqual({ tipo: "sessao" });
  });

  it("tira o token da barra de endereço assim que o lê", () => {
    const replaceState = chegarPeloLink(`?token_hash=${TOKEN}&type=email`);
    expect(replaceState).toHaveBeenCalledWith(null, "", "/entrar/retorno");
  });

  it("só troca o token por sessão quando o aluno clica em Entrar", async () => {
    chegarPeloLink(`?token_hash=${TOKEN}&type=email`);
    const { sb, verifyOtp } = sbComVerificacao();
    renderizar(<Retorno />, { rota: "/entrar/retorno", caminho: "/entrar/retorno", sb, sessao: null });
    expect(screen.getByRole("heading", { name: "Confirme a sua entrada" })).toBeInTheDocument();
    expect(verifyOtp).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Entrar na Academy" }));
    expect(verifyOtp).toHaveBeenCalledWith({ token_hash: TOKEN, type: "email" });
    expect(await screen.findByRole("heading", { name: "Entrando na Academy" })).toBeInTheDocument();
  });

  it("link vencido ou já usado cai no pedido de link novo", async () => {
    chegarPeloLink(`?token_hash=${TOKEN}&type=email`);
    const { sb } = sbComVerificacao("Email link is invalid or has expired");
    renderizar(<Retorno />, { rota: "/entrar/retorno", caminho: "/entrar/retorno", sb, sessao: null });
    fireEvent.click(screen.getByRole("button", { name: "Entrar na Academy" }));
    expect(await screen.findByRole("heading", { name: "Este link não vale mais" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Pedir novo link" })).toHaveAttribute("href", "/entrar");
  });

  it("link com token adulterado nem chega a chamar o Supabase", () => {
    chegarPeloLink("?token_hash=../../x&type=email");
    const { sb, verifyOtp } = sbComVerificacao();
    renderizar(<Retorno />, { rota: "/entrar/retorno", caminho: "/entrar/retorno", sb, sessao: null });
    expect(screen.getByRole("heading", { name: "Este link não vale mais" })).toBeInTheDocument();
    expect(verifyOtp).not.toHaveBeenCalled();
  });

  it("a tela de confirmação não tem violação grave de acessibilidade", async () => {
    chegarPeloLink(`?token_hash=${TOKEN}&type=email`);
    const { sb } = sbComVerificacao();
    const { container } = renderizar(<Retorno />, { rota: "/entrar/retorno", caminho: "/entrar/retorno", sb, sessao: null });
    expect(await violacoesGraves(container)).toEqual([]);
  });
});
