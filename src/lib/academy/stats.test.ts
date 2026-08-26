import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchAcademyStats, isAcademyStatsAvailable } from "./stats";

const ANON_KEY = "teste-anon-key";
const BASE_URL = "https://projeto.supabase.co";

function stubEnv(overrides: Record<string, string | undefined>) {
  const base: Record<string, string | undefined> = {
    VITE_SUPABASE_URL: BASE_URL,
    VITE_SUPABASE_ANON_KEY: ANON_KEY,
    VITE_ACADEMY_STATS_ENABLED: "true",
  };
  Object.assign(import.meta.env, base, overrides);
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("stats públicos da Academy (contagem agregada sem PII)", () => {
  it("consulta a RPC contagem_alunos e retorna matriculados/preinscritos", async () => {
    stubEnv({});
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ matriculados: 4, preinscritos: 7 }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const stats = await fetchAcademyStats();

    expect(stats).toEqual({ matriculados: 4, preinscritos: 7 });
    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE_URL}/rest/v1/rpc/contagem_alunos`,
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          apikey: ANON_KEY,
          Authorization: `Bearer ${ANON_KEY}`,
          "Content-Type": "application/json",
        }),
        body: "{}",
      }),
    );
  });

  it("lança erro quando Supabase não está configurado", async () => {
    stubEnv({ VITE_SUPABASE_URL: "", VITE_SUPABASE_ANON_KEY: "" });
    await expect(fetchAcademyStats()).rejects.toThrow(/não configurado/);
  });

  it("lança erro em resposta HTTP não-ok", async () => {
    stubEnv({});
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 403 }),
    );
    await expect(fetchAcademyStats()).rejects.toThrow(/HTTP 403/);
  });

  it("isAcademyStatsAvailable exige flag + URL + chave", () => {
    stubEnv({});
    expect(isAcademyStatsAvailable()).toBe(true);
    stubEnv({ VITE_ACADEMY_STATS_ENABLED: "false" });
    expect(isAcademyStatsAvailable()).toBe(false);
    stubEnv({ VITE_ACADEMY_STATS_ENABLED: "true", VITE_SUPABASE_URL: "" });
    expect(isAcademyStatsAvailable()).toBe(false);
  });

  it("não expõe PII na resposta (apenas contagens)", async () => {
    stubEnv({});
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ matriculados: 4, preinscritos: 7 }),
      }),
    );
    const stats = await fetchAcademyStats();
    const json = JSON.stringify(stats);
    expect(json).not.toMatch(/@/);
    expect(json).not.toMatch(/nome/i);
    expect(json).not.toMatch(/email/i);
  });
});
