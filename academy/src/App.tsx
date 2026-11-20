import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router";
import { MotionConfig } from "motion/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Config } from "@/lib/config";
import { ProvedorPortal } from "@/lib/contexto";
import { ProvedorAvisos } from "@/components/ui/Avisos";
import { ExigeLogin } from "@/components/layout/ExigeLogin";
import { Moldura } from "@/components/layout/Moldura";
import { NaoEncontrado } from "@/pages/Estados";

const Painel = lazy(() => import("@/pages/Painel"));
const MeusCursos = lazy(() => import("@/pages/MeusCursos"));
const Curso = lazy(() => import("@/pages/Curso"));
const Aula = lazy(() => import("@/pages/Aula"));
const QuestoesModulo = lazy(() => import("@/pages/QuestoesModulo"));
const Avaliacao = lazy(() => import("@/pages/Avaliacao"));
const Certificado = lazy(() => import("@/pages/Certificado"));
const AreaInstrutor = lazy(() => import("@/pages/instrutor/Area"));
const CursosInstrutor = lazy(() => import("@/pages/instrutor/Cursos"));
const CursoInstrutor = lazy(() => import("@/pages/instrutor/Curso"));
const AulaInstrutor = lazy(() => import("@/pages/instrutor/Aula"));
const QuestaoInstrutor = lazy(() => import("@/pages/instrutor/Questao"));
const BoletimInstrutor = lazy(() => import("@/pages/instrutor/Boletim"));
const EquipeInstrutor = lazy(() => import("@/pages/instrutor/Equipe"));
const PerfilInstrutor = lazy(() => import("@/pages/instrutor/Perfil"));
const Entrar = lazy(() => import("@/pages/Entrar"));
const Retorno = lazy(() => import("@/pages/Retorno"));

export function App({ config, sb, queryClient }: { config: Config; sb: SupabaseClient; queryClient: QueryClient }) {
  return (
    <MotionConfig reducedMotion="user">
      <QueryClientProvider client={queryClient}>
        <ProvedorPortal config={config} sb={sb}>
          <ProvedorAvisos>
            <BrowserRouter>
              <Suspense fallback={<div aria-busy="true" className="min-h-dvh bg-bg" />}>
                <Routes>
                  <Route path="/entrar" element={<Entrar />} />
                  <Route path="/entrar/retorno" element={<Retorno />} />
                  <Route element={<ExigeLogin />}>
                    <Route element={<Moldura />}>
                      <Route index element={<Painel />} />
                      <Route path="cursos" element={<MeusCursos />} />
                      <Route path="cursos/:slug" element={<Curso />} />
                      <Route path="cursos/:slug/aulas/:numero" element={<Aula />} />
                      <Route path="cursos/:slug/modulos/:ordem/questoes" element={<QuestoesModulo />} />
                      <Route path="cursos/:slug/avaliacao" element={<Avaliacao />} />
                      <Route path="cursos/:slug/certificado" element={<Certificado />} />
                      <Route path="instrutor" element={<AreaInstrutor />}>
                        <Route index element={<CursosInstrutor />} />
                        <Route path="cursos/:slug" element={<CursoInstrutor />} />
                        <Route path="cursos/:slug/aulas/:id" element={<AulaInstrutor />} />
                        <Route path="cursos/:slug/questoes/:id" element={<QuestaoInstrutor />} />
                        <Route path="boletim" element={<BoletimInstrutor />} />
                        <Route path="equipe" element={<EquipeInstrutor />} />
                        <Route path="perfil" element={<PerfilInstrutor />} />
                      </Route>
                      <Route path="*" element={<NaoEncontrado />} />
                    </Route>
                  </Route>
                </Routes>
              </Suspense>
            </BrowserRouter>
          </ProvedorAvisos>
        </ProvedorPortal>
      </QueryClientProvider>
    </MotionConfig>
  );
}
