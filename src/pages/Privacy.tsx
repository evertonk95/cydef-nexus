import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Shield } from "lucide-react";

const sections = [
  {
    title: "1. Quem somos",
    body: (
      <>
        <p>A <strong>CyDef</strong> é uma empresa de cibersegurança que oferece serviços de SOC, Blue Team, Hardening, Consultoria e educação por meio da CyDef Academy.</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Site:</strong> https://www.cydef.com.br</li>
          <li><strong>Contato para privacidade (DPO):</strong> dpo@cydef.com.br</li>
        </ul>
        <p>Esta Política explica como tratamos seus dados pessoais, em conformidade com a <strong>Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018)</strong>.</p>
      </>
    ),
  },
  {
    title: "2. Dados que coletamos",
    body: (
      <>
        <p><strong>2.1. Formulário de contato e solicitação de proposta</strong></p>
        <p>Nome, e-mail, país e mensagem (incluindo objetivos informados no formulário/quiz). Fornecido voluntariamente por você.</p>
        <p><strong>2.2. Área restrita / CyDef Academy (quando disponível)</strong></p>
        <p>Nome, e-mail e senha (armazenada de forma segura por provedor de autenticação). Dados de progresso em cursos e histórico de acesso.</p>
        <p><strong>2.3. Dados de navegação e análise</strong></p>
        <p>Endereço IP, tipo de navegador, páginas visitadas e tempo de permanência, coletados por ferramentas de análise (ex.: Google Analytics 4), quando aplicável.</p>
        <p><strong>2.4. Dados de pagamento (quando disponível)</strong></p>
        <p>Processados <strong>exclusivamente</strong> por provedores de pagamento (ex.: Stripe, Mercado Pago). Não armazenamos números de cartão ou dados completos de pagamento.</p>
      </>
    ),
  },
  {
    title: "3. Para que usamos seus dados",
    body: (
      <>
        <ul className="list-disc pl-5 space-y-1">
          <li>Responder a solicitações de contato e propostas — <em>Consentimento (art. 7º, I)</em></li>
          <li>Prestar serviços contratados e suporte — <em>Execução de contrato (art. 7º, V)</em></li>
          <li>Gerenciar acesso à Academy e histórico de aprendizado — <em>Execução de contrato (art. 7º, V)</em></li>
          <li>Segurança do site (proteção contra fraudes e ataques) — <em>Legítimo interesse (art. 7º, IX)</em></li>
          <li>Análise de audiência e melhoria do site — <em>Consentimento (quando exigido)</em></li>
        </ul>
        <p>Não utilizamos seus dados para finalidades incompatíveis com as descritas acima. Se uma nova finalidade surgir, você será informado previamente.</p>
      </>
    ),
  },
  {
    title: "4. Compartilhamento de dados",
    body: (
      <>
        <p>Compartilhamos seus dados apenas com:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Provedores de infraestrutura e hospedagem</strong> (ex.: GitHub Pages, Cloudflare) — necessários ao funcionamento do site;</li>
          <li><strong>Ferramentas de análise</strong> (ex.: Google Analytics) — para medir audiência, quando você consente;</li>
          <li><strong>Provedores de autenticação e pagamento</strong> — para viabilizar a Academy e transações;</li>
          <li><strong>Autoridades públicas</strong> — quando exigido por lei ou ordem judicial.</li>
        </ul>
        <p><strong>Nunca vendemos seus dados pessoais.</strong></p>
      </>
    ),
  },
  {
    title: "5. Cookies e tecnologias semelhantes",
    body: (
      <p>Utilizamos cookies essenciais (necessários ao funcionamento do site) e, com seu consentimento, cookies analíticos para entender o uso da página. Você pode gerenciar ou desativar cookies nas configurações do seu navegador. A desativação de cookies essenciais pode afetar o funcionamento do site.</p>
    ),
  },
  {
    title: "6. Retenção dos dados",
    body: (
      <>
        <ul className="list-disc pl-5 space-y-1">
          <li>Mensagens de contato: até <strong>[12] meses</strong> após o último contato;</li>
          <li>Dados de conta da Academy: enquanto a conta estiver ativa;</li>
          <li>Dados de navegação/análise: conforme período definido pela ferramenta utilizada (ex.: até 14 meses no GA4).</li>
        </ul>
        <p>Ao final do período, os dados são excluídos ou anonimizados.</p>
      </>
    ),
  },
  {
    title: "7. Seus direitos (LGPD)",
    body: (
      <>
        <p>Você pode, a qualquer momento, solicitar:</p>
        <ol className="list-decimal pl-5 space-y-1">
          <li>Confirmação da existência de tratamento;</li>
          <li>Acesso aos seus dados;</li>
          <li>Correção de dados incompletos, inexatos ou desatualizados;</li>
          <li>Anonimização, bloqueio ou eliminação de dados desnecessários ou excessivos;</li>
          <li>Portabilidade dos dados a outro fornecedor (mediante regulamentação);</li>
          <li>Revogação do consentimento;</li>
          <li>Informação sobre compartilhamento com terceiros.</li>
        </ol>
        <p>Para exercer seus direitos, envie e-mail para <strong>dpo@cydef.com.br</strong> com o assunto "LGPD — Solicitação de titular". Responderemos em até <strong>15 dias</strong>.</p>
      </>
    ),
  },
  {
    title: "8. Segurança",
    body: (
      <>
        <p>Adotamos medidas técnicas e organizacionais para proteger seus dados, incluindo:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>HTTPS em todo o site (criptografia em trânsito);</li>
          <li>Controles de acesso restritos;</li>
          <li>Monitoramento e hardening contínuos;</li>
          <li>Avaliação periódica de vulnerabilidades.</li>
        </ul>
        <p>Nenhum sistema é 100% seguro. Em caso de incidente que possa causar risco a você, notificaremos conforme exigido pela LGPD.</p>
      </>
    ),
  },
  {
    title: "9. Transferência internacional",
    body: (
      <p>Parte dos nossos serviços pode envolver provedores com servidores fora do Brasil (ex.: GitHub, Cloudflare, Google). Nesses casos, adotamos cláusulas contratuais e garantias adequadas ao nível de proteção exigido pela LGPD.</p>
    ),
  },
  {
    title: "10. Menores de idade",
    body: (
      <p>Nosso site não é direcionado a menores de 13 anos e não coletamos intencionalmente dados de crianças. Se identificarmos coleta acidental, os dados serão excluídos.</p>
    ),
  },
  {
    title: "11. Alterações desta Política",
    body: (
      <p>Esta Política pode ser atualizada a qualquer momento. A versão vigente estará sempre disponível nesta página, com a data de atualização no topo. Mudanças relevantes serão comunicadas por e-mail ou aviso no site.</p>
    ),
  },
  {
    title: "12. Encarregado de dados (DPO)",
    body: (
      <>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>E-mail:</strong> dpo@cydef.com.br</li>
          <li><strong>Prazo de resposta:</strong> até 15 dias</li>
        </ul>
      </>
    ),
  },
  {
    title: "13. Foro",
    body: (
      <p>Esta Política é regida pela legislação brasileira. Fica eleito o foro de Brasília/DF para dirimir dúvidas ou controvérsias, sem prejuízo de reclamações junto à <strong>ANPD</strong> (Autoridade Nacional de Proteção de Dados).</p>
    ),
  },
];

const Privacy = () => {
  return (
    <div className="bg-[#050505] text-white font-sans antialiased overflow-x-hidden flex flex-col min-h-screen">
      <Navigation />

      <main className="flex-1 w-full max-w-4xl mx-auto px-6 md:px-10 pt-32 pb-24">
        <div className="inline-flex items-center gap-2 text-orange-500 mb-4">
          <Shield className="w-4 h-4" />
          <span className="text-xs font-bold tracking-widest uppercase">LGPD</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-medium tracking-tighter mb-2">
          Política de <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-600">Privacidade</span>
        </h1>
        <p className="text-sm text-neutral-500 mb-12">Última atualização: 20 de agosto de 2026</p>

        <div className="flex flex-col gap-10">
          {sections.map((s) => (
            <section key={s.title}>
              <h2 className="text-xl font-semibold text-white mb-3">{s.title}</h2>
              <div className="text-neutral-300 leading-relaxed space-y-3 text-[15px]">{s.body}</div>
            </section>
          ))}
        </div>

        <div className="mt-16 pt-8 border-t border-white/10 text-sm text-neutral-500">
          <p>
            Dúvidas sobre esta Política? Fale com nosso encarregado: <span className="text-orange-400">dpo@cydef.com.br</span>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Privacy;
