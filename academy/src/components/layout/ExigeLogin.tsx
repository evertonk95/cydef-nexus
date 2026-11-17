import { Navigate, Outlet, useLocation } from "react-router";
import { usePortal } from "@/lib/portal";

/** Rotas do aluno: sem sessão, vai para o login. Enquanto lê a sessão, nada pisca. */
export function ExigeLogin() {
  const { sessao, carregando } = usePortal();
  const local = useLocation();
  if (carregando) return <div aria-busy="true" className="min-h-dvh bg-bg" />;
  if (!sessao) return <Navigate to="/entrar" replace state={{ de: local.pathname }} />;
  return <Outlet />;
}
