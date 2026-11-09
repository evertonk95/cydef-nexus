/** Constantes do site — módulo leve (sem imports de páginas/componentes). */
export const SITE_ORIGIN = "https://www.cydef.com.br";

/**
 * Limiar de alunos matriculados para o numero voltar a home (issue #141).
 * Decisao pendente do Everton: enquanto for 0, a home nao exibe a metrica.
 * A contagem real continua vindo da API da Academy, so nao entra na vitrine.
 */
export const STUDENTS_ENROLLED_METRIC_MIN = 0;
