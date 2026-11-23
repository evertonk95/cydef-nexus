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
  "pt:whatsapp-android-3-falhas-exposicao-ip-exclusao-arquivos": () =>
    import("./posts.whatsapp-android-3-falhas-exposicao-ip-exclusao-arquivos").then(
      (m) => m.whatsappAndroid3FalhasPost,
    ),
  "pt:stingybasilisk-smb-pipes-nomeados-espionagem": () =>
    import("./posts.stingybasilisk-smb-pipes-nomeados-espionagem").then((m) => m.stingybasiliskSmbPipesPost),
  "pt:firefox-160-correcoes-seguranca": () =>
    import("./posts.firefox-160-correcoes-seguranca").then(
      (m) => m.firefox160CorrecoesSegurancaPost,
    ),
  "pt:chrome-158-correcoes-seguranca": () =>
    import("./posts.chrome-158-correcoes-seguranca").then(
      (m) => m.chrome158CorrecoesSegurancaPost,
    ),
  "pt:wordpress-7-1-5-correcoes-seguranca": () =>
    import("./posts.wordpress-7-1-5-correcoes-seguranca").then(
      (m) => m.wordpress715CorrecoesSegurancaPost,
    ),
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
  "pt:windows-active-directory-rce-cve-2026-119948": () =>
    import("./posts.windows-active-directory-rce").then(
      (m) => m.windowsActiveDirectoryRcePost,
    ),
  "pt:fortinet-fortimanager-fortianalyzer-rce-cve-2026-126170": () =>
    import("./posts.fortinet-rce").then((m) => m.fortinetRcePost),
  "pt:windows-bitlocker-bypass-cve-2026-97015": () =>
    import("./posts.windows-bitlocker-bypass").then(
      (m) => m.windowsBitlockerBypassPost,
    ),
  "pt:apache-http-server-mod-http2-rce-cve-2026-119618": () =>
    import("./posts.apache-http2-rce").then((m) => m.apacheHttp2RcePost),
  "pt:noisytcp-linux-kernel-tcp-dos-cve-2026-99288": () =>
    import("./posts.noisytcp-linux").then((m) => m.noisytcpLinuxPost),

  // --- EN ---
  "en:whatsapp-android-3-falhas-exposicao-ip-exclusao-arquivos": () =>
    import("./posts.whatsapp-android-3-falhas-exposicao-ip-exclusao-arquivos.en").then(
      (m) => m.whatsappAndroid3FalhasPostEn,
    ),
  "en:stingybasilisk-smb-pipes-nomeados-espionagem": () =>
    import("./posts.stingybasilisk-smb-pipes-nomeados-espionagem.en").then((m) => m.stingybasiliskSmbPipesPostEn),
  "en:firefox-160-correcoes-seguranca": () =>
    import("./posts.firefox-160-correcoes-seguranca.en").then(
      (m) => m.firefox160CorrecoesSegurancaPostEn,
    ),
  "en:chrome-158-correcoes-seguranca": () =>
    import("./posts.chrome-158-correcoes-seguranca.en").then(
      (m) => m.chrome158CorrecoesSegurancaPostEn,
    ),
  "en:wordpress-7-1-5-correcoes-seguranca": () =>
    import("./posts.wordpress-7-1-5-correcoes-seguranca.en").then(
      (m) => m.wordpress715CorrecoesSegurancaPostEn,
    ),
  "en:rathat-trojan-bancario-android-controle-ia": () =>
    import("./posts.rathat-android-trojan.en").then((m) => m.rathatAndroidTrojanPostEn),
  "en:windows-active-directory-rce-cve-2026-119948": () =>
    import("./posts.windows-active-directory-rce.en").then(
      (m) => m.windowsActiveDirectoryRcePostEn,
    ),
  "en:fortinet-fortimanager-fortianalyzer-rce-cve-2026-126170": () =>
    import("./posts.fortinet-rce.en").then((m) => m.fortinetRcePostEn),
  "en:windows-bitlocker-bypass-cve-2026-97015": () =>
    import("./posts.windows-bitlocker-bypass.en").then(
      (m) => m.windowsBitlockerBypassPostEn,
    ),
  "en:apache-http-server-mod-http2-rce-cve-2026-119618": () =>
    import("./posts.apache-http2-rce.en").then((m) => m.apacheHttp2RcePostEn),
  "en:noisytcp-linux-kernel-tcp-dos-cve-2026-99288": () =>
    import("./posts.noisytcp-linux.en").then((m) => m.noisytcpLinuxPostEn),
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
  "es:whatsapp-android-3-falhas-exposicao-ip-exclusao-arquivos": () =>
    import("./posts.whatsapp-android-3-falhas-exposicao-ip-exclusao-arquivos.es").then(
      (m) => m.whatsappAndroid3FalhasPostEs,
    ),
  "es:stingybasilisk-smb-pipes-nomeados-espionagem": () =>
    import("./posts.stingybasilisk-smb-pipes-nomeados-espionagem.es").then((m) => m.stingybasiliskSmbPipesPostEs),
  "es:firefox-160-correcoes-seguranca": () =>
    import("./posts.firefox-160-correcoes-seguranca.es").then(
      (m) => m.firefox160CorrecoesSegurancaPostEs,
    ),
  "es:chrome-158-correcoes-seguranca": () =>
    import("./posts.chrome-158-correcoes-seguranca.es").then(
      (m) => m.chrome158CorrecoesSegurancaPostEs,
    ),
  "es:wordpress-7-1-5-correcoes-seguranca": () =>
    import("./posts.wordpress-7-1-5-correcoes-seguranca.es").then(
      (m) => m.wordpress715CorrecoesSegurancaPostEs,
    ),
  "es:rathat-trojan-bancario-android-controle-ia": () =>
    import("./posts.rathat-android-trojan.es").then((m) => m.rathatAndroidTrojanPostEs),
  "es:windows-active-directory-rce-cve-2026-119948": () =>
    import("./posts.windows-active-directory-rce.es").then(
      (m) => m.windowsActiveDirectoryRcePostEs,
    ),
  "es:fortinet-fortimanager-fortianalyzer-rce-cve-2026-126170": () =>
    import("./posts.fortinet-rce.es").then((m) => m.fortinetRcePostEs),
  "es:windows-bitlocker-bypass-cve-2026-97015": () =>
    import("./posts.windows-bitlocker-bypass.es").then(
      (m) => m.windowsBitlockerBypassPostEs,
    ),
  "es:apache-http-server-mod-http2-rce-cve-2026-119618": () =>
    import("./posts.apache-http2-rce.es").then((m) => m.apacheHttp2RcePostEs),
  "es:noisytcp-linux-kernel-tcp-dos-cve-2026-99288": () =>
    import("./posts.noisytcp-linux.es").then((m) => m.noisytcpLinuxPostEs),
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
