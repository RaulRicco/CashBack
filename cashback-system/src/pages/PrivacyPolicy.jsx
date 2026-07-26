import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { getLogo, getBrandName, BRAND_CONFIG } from '../config/branding';

const LAST_UPDATED = '26 de julho de 2026';

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
            Voltar
          </button>
          <div className="flex items-center gap-2">
            <img src={getLogo('icon')} alt={getBrandName()} className="h-8" />
            <span className="font-semibold text-gray-900">{getBrandName()}</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 md:p-12 space-y-8 text-gray-700">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Política de Privacidade</h1>
            <p className="text-sm text-gray-500">Última atualização: {LAST_UPDATED}</p>
          </div>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900">1. Quem somos</h2>
            <p>
              O {getBrandName()} é operado por <strong>Ricco Negócios Digitais</strong>, inscrita no
              CNPJ sob o nº <strong>13.706.717/0001-03</strong> ("nós", "nosso"), responsável pelo
              tratamento dos dados pessoais coletados através da plataforma {getBrandName()}
              {' '}(o "Serviço"), incluindo o site, aplicativo web e integrações associadas, como o
              envio de mensagens via WhatsApp Business API.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900">2. Quais dados coletamos</h2>
            <p>Coletamos os seguintes dados, conforme o seu uso do Serviço:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li><strong>Lojistas e funcionários:</strong> nome, e-mail, telefone e dados da empresa cadastrada.</li>
              <li><strong>Clientes finais do programa de cashback:</strong> nome, telefone (incluindo WhatsApp), e-mail (quando informado), data de nascimento (quando informada) e histórico de transações de cashback.</li>
              <li><strong>Dados de uso:</strong> registros de acesso, interações com a plataforma e eventos de navegação.</li>
              <li><strong>Comunicações via WhatsApp:</strong> quando um lojista conecta sua conta do WhatsApp Business, utilizamos o número de telefone do cliente para enviar mensagens transacionais (ex.: boas-vindas, confirmação de cashback, confirmação de resgate) e, quando autorizado pelo lojista, campanhas promocionais. Registramos o status de entrega dessas mensagens (enviada, entregue, lida ou falhou).</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900">3. Como usamos seus dados</h2>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Operar o programa de cashback (registro de compras, cálculo e resgate de saldo).</li>
              <li>Enviar comunicações transacionais relacionadas à sua conta ou às suas transações, incluindo por e-mail, notificações push e WhatsApp.</li>
              <li>Enviar comunicações promocionais de um lojista específico, quando este configurar campanhas de marketing via WhatsApp — sempre relacionadas ao programa de cashback daquele lojista.</li>
              <li>Melhorar e manter a segurança da plataforma.</li>
              <li>Cumprir obrigações legais e regulatórias.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900">4. Integração com WhatsApp Business API (Meta)</h2>
            <p>
              Utilizamos a API oficial do WhatsApp Business, fornecida pela Meta Platforms, Inc.,
              para permitir que lojistas cadastrados no {getBrandName()} enviem mensagens aos seus
              próprios clientes. Cada lojista conecta sua própria conta comercial do WhatsApp
              (WhatsApp Business Account) através do processo de cadastro incorporado da Meta
              (Embedded Signup), e é responsável pelo conteúdo das mensagens enviadas aos seus
              clientes, incluindo campanhas promocionais.
            </p>
            <p>
              Os números de telefone e o conteúdo das mensagens trocadas são processados pela Meta
              conforme a{' '}
              <a
                href="https://www.whatsapp.com/legal/business-policy"
                target="_blank"
                rel="noreferrer"
                className="text-primary-600 underline"
              >
                Política de Uso Comercial do WhatsApp
              </a>
              . Armazenamos o histórico de mensagens enviadas e seu status de entrega para fins de
              suporte, auditoria e para que o lojista possa acompanhar suas campanhas.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900">5. Compartilhamento de dados</h2>
            <p>
              Não vendemos dados pessoais. Compartilhamos dados apenas com prestadores de serviço
              necessários à operação da plataforma, como provedores de banco de dados e
              infraestrutura (Supabase), processamento de pagamentos (Stripe), envio de
              notificações (OneSignal), envio de e-mails (Resend) e envio de mensagens via WhatsApp
              (Meta Platforms, Inc.), todos sob obrigações contratuais de confidencialidade e
              segurança.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900">6. Seus direitos</h2>
            <p>
              Nos termos da Lei Geral de Proteção de Dados (LGPD), você pode solicitar a qualquer
              momento a confirmação, o acesso, a correção ou a exclusão dos seus dados pessoais, bem
              como a revogação do consentimento para o recebimento de comunicações promocionais.
              Para solicitar o descadastro de mensagens de WhatsApp, basta responder "SAIR" na
              conversa com o lojista ou entrar em contato pelo canal abaixo.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900">7. Retenção e segurança</h2>
            <p>
              Mantemos os dados pelo tempo necessário para cumprir as finalidades descritas nesta
              política ou conforme exigido por lei, adotando medidas técnicas e administrativas
              razoáveis para proteger os dados contra acesso não autorizado, perda ou alteração.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900">8. Contato</h2>
            <p>
              Em caso de dúvidas sobre esta Política de Privacidade ou sobre o tratamento dos seus
              dados pessoais, entre em contato:{' '}
              <a href={`mailto:suporte@localcashback.com.br`} className="text-primary-600 underline">
                suporte@localcashback.com.br
              </a>
            </p>
            <p className="text-sm text-gray-500">
              Ricco Negócios Digitais — CNPJ 13.706.717/0001-03
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900">9. Alterações a esta política</h2>
            <p>
              Podemos atualizar esta Política de Privacidade periodicamente. A data da última
              atualização está sempre indicada no topo desta página.
            </p>
          </section>
        </div>

        {BRAND_CONFIG.features.showPoweredBy && (
          <p className="text-center text-sm text-gray-400 mt-8">
            Powered by {getBrandName()}
          </p>
        )}
      </main>
    </div>
  );
}
