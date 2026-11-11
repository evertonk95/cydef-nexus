import type { BlogPost } from "./posts";
import type { Lang } from "@/i18n";

type Loader = () => Promise<BlogPost>;

/**
 * Carrega SÓ o módulo do artigo pedido, em vez de `posts.content.ts`, que
 * agrega os três idiomas de todos os artigos (~814 KB brutos). Com este
 * registry o chunk da rota de artigo cai de ~260 KB (brotli) para ~5–25 KB.
 *
 * Artigos que ainda vivem dentro dos agregados (o guia "soc-do-zero" e os 7
 * "extras" do posts-extra.generated.ts, com as traduções inline em
 * posts.en.ts/posts.es.ts) seguem pelo fallback do agregado completo no fim da
 * função. Quando eles forem extraídos para arquivo próprio, basta adicionar a
 * entrada aqui e o fallback encolhe.
 */
const loaders: Record<string, Loader> = {
  // --- PT ---
  "pt:wp2shell-wordpress-admin-web-shell": () =>
    import("./posts.wp2shell-wordpress").then((m) => m.wp2shellWordpressPost),
  "pt:apache-http-server-2-4-69-vulnerabilidades": () =>
    import("./posts.apache-http-server-2-4-69").then(
      (m) => m.apacheHttpServer2469Post,
    ),
  "pt:atualizacao-chrome-correcoes-seguranca": () =>
    import("./posts.google-chrome-update-fixes").then(
      (m) => m.googleChromeUpdateFixesPost,
    ),
  "pt:phishing-blob-urls-microsoft-teams-navegador": () =>
    import("./posts.phishing-blob").then((m) => m.phishingBlobPost),
  "pt:claude-skills-seguranca-da-informacao": () =>
    import("./posts.claude-skills").then((m) => m.claudeSkillsPost),
  "pt:wazuh-em-movimento": () =>
    import("./posts.wazuh").then((m) => m.wazuhEmMovimentoPost),
  "pt:cisco-secure-email-gateway-cve-2026-76461-root": () =>
    import("./posts.cisco-seg-email-gateway").then((m) => m.ciscoSegEmailGatewayPost),
  "pt:cloudflare-containers-isolamento-entre-tenants": () =>
    import("./posts.cloudflare-containers-tenants").then(
      (m) => m.cloudflareContainersTenantsPost,
    ),
  "pt:click2shell-wordpress-instalacao-tema-execucao-remota": () =>
    import("./posts.click2shell-wordpress").then((m) => m.click2shellWordpressPost),
  // rathat: PT, EN e ES em arquivo próprio desde 09/11/2026 (paridade editorial).
  "pt:rathat-trojan-bancario-android-controle-ia": () =>
    import("./posts.rathat-android-trojan").then((m) => m.rathatAndroidTrojanPost),

  // --- EN ---
  "en:rathat-trojan-bancario-android-controle-ia": () =>
    import("./posts.rathat-android-trojan.en").then((m) => m.rathatAndroidTrojanPostEn),
  "en:wp2shell-wordpress-admin-web-shell": () =>
    import("./posts.wp2shell-wordpress.en").then((m) => m.wp2shellWordpressPostEn),
  "en:apache-http-server-2-4-69-vulnerabilidades": () =>
    import("./posts.apache-http-server-2-4-69.en").then(
      (m) => m.apacheHttpServer2469PostEn,
    ),
  "en:atualizacao-chrome-correcoes-seguranca": () =>
    import("./posts.google-chrome-update-fixes.en").then(
      (m) => m.googleChromeUpdateFixesPostEn,
    ),
  "en:phishing-blob-urls-microsoft-teams-navegador": () =>
    import("./posts.phishing-blob.en").then((m) => m.phishingBlobPostEn),
  "en:claude-skills-seguranca-da-informacao": () =>
    import("./posts.claude-skills.en").then((m) => m.claudeSkillsPostEn),
  "en:wazuh-em-movimento": () =>
    import("./posts.wazuh.en").then((m) => m.wazuhEmMovimentoPostEn),
  "en:cisco-secure-email-gateway-cve-2026-76461-root": () =>
    import("./posts.cisco-seg-email-gateway.en").then(
      (m) => m.ciscoSegEmailGatewayPostEn,
    ),
  "en:cloudflare-containers-isolamento-entre-tenants": () =>
    import("./posts.cloudflare-containers-tenants.en").then(
      (m) => m.cloudflareContainersTenantsPostEn,
    ),
  "en:click2shell-wordpress-instalacao-tema-execucao-remota": () =>
    import("./posts.click2shell-wordpress.en").then(
      (m) => m.click2shellWordpressPostEn,
    ),

  // --- ES ---
  "es:rathat-trojan-bancario-android-controle-ia": () =>
    import("./posts.rathat-android-trojan.es").then((m) => m.rathatAndroidTrojanPostEs),
  "es:wp2shell-wordpress-admin-web-shell": () =>
    import("./posts.wp2shell-wordpress.es").then((m) => m.wp2shellWordpressPostEs),
  "es:apache-http-server-2-4-69-vulnerabilidades": () =>
    import("./posts.apache-http-server-2-4-69.es").then(
      (m) => m.apacheHttpServer2469PostEs,
    ),
  "es:atualizacao-chrome-correcoes-seguranca": () =>
    import("./posts.google-chrome-update-fixes.es").then(
      (m) => m.googleChromeUpdateFixesPostEs,
    ),
  "es:phishing-blob-urls-microsoft-teams-navegador": () =>
    import("./posts.phishing-blob.es").then((m) => m.phishingBlobPostEs),
  "es:claude-skills-seguranca-da-informacao": () =>
    import("./posts.claude-skills.es").then((m) => m.claudeSkillsPostEs),
  "es:wazuh-em-movimento": () =>
    import("./posts.wazuh.es").then((m) => m.wazuhEmMovimentoPostEs),
  "es:cisco-secure-email-gateway-cve-2026-76461-root": () =>
    import("./posts.cisco-seg-email-gateway.es").then(
      (m) => m.ciscoSegEmailGatewayPostEs,
    ),
  "es:cloudflare-containers-isolamento-entre-tenants": () =>
    import("./posts.cloudflare-containers-tenants.es").then(
      (m) => m.cloudflareContainersTenantsPostEs,
    ),
  "es:click2shell-wordpress-instalacao-tema-execucao-remota": () =>
    import("./posts.click2shell-wordpress.es").then(
      (m) => m.click2shellWordpressPostEs,
    ),
};

/**
 * Resolve o artigo do slug no idioma pedido, preferindo o chunk por-artigo.
 * Fallback em ordem: idioma pedido -> PT -> agregado completo (artigos legados).
 */
export const loadPost = async (
  slug: string,
  lang: Lang,
): Promise<BlogPost | undefined> => {
  const loader = loaders[`${lang}:${slug}`] ?? loaders[`pt:${slug}`];
  if (loader) {
    try {
      return await loader();
    } catch {
      return undefined;
    }
  }
  const { getPostBySlug } = await import("./posts.content");
  return getPostBySlug(slug, lang);
};
