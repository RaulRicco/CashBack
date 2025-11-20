import { useState } from 'react';
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Gift, 
  Check, 
  X,
  ArrowRight,
  Star,
  Zap,
  Shield,
  Smartphone,
  BarChart3,
  Clock,
  Target,
  AlertCircle,
  MessageCircle,
  Mail,
  Bell
} from 'lucide-react';

export default function LandingPage() {
  const [formData, setFormData] = useState({
    name: '',
    business: '',
    phone: '',
    email: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aqui você pode integrar com um CRM ou enviar email
    console.log('Lead capturado:', formData);
    alert('Obrigado! Entraremos em contato em breve.');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* SEO Meta Tags */}
      <head>
        <title>Programa de Fidelidade e Cashback para Comércio Local | Aumente suas Vendas em 40%</title>
        <meta name="description" content="Sistema de fidelidade com cashback para comércio local. Traga seus clientes de volta 3x mais com tecnologia moderna. Dashboard CAC/LTV exclusivo. A partir de R$ 147/mês." />
        <meta name="keywords" content="programa de fidelidade, cashback para comércio local, fidelização de clientes, sistema de pontos, cashback automático, aumentar vendas, reter clientes" />
      </head>

      {/* HERO SECTION - Personagem + Problema */}
      <section className="relative bg-white text-gray-900 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          {/* Logo */}
          <div className="mb-8 inline-block">
            <img 
              src="/logo-localcashback.png" 
              alt="LocalCashback - Sistema de Fidelidade" 
              className="h-16 md:h-20 w-auto object-contain"
            />
          </div>
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column */}
            <div className="space-y-8">
              <div className="inline-block bg-primary-100 px-4 py-2 rounded-full text-sm font-semibold text-primary-700">
                ✨ Mais de 80% dos seus clientes nunca voltam. Mude isso hoje!
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-gray-900">
                Transforme Clientes Ocasionais em{' '}
                <span className="text-primary-600">Clientes Fiéis</span>
              </h1>

              <p className="text-xl md:text-2xl text-gray-700 leading-relaxed">
                Sistema completo de <strong>cashback e fidelidade</strong> que faz seus clientes 
                voltarem <strong>3x mais vezes</strong> ao seu comércio local.
              </p>

              {/* Problemas (Dores) */}
              <div className="space-y-3 bg-gray-50 p-6 rounded-xl border border-gray-200">
                <p className="flex items-center gap-3 text-lg text-gray-700">
                  <AlertCircle className="w-5 h-5 text-primary-600 flex-shrink-0" />
                  <span>Seus clientes compram uma vez e desaparecem?</span>
                </p>
                <p className="flex items-center gap-3 text-lg text-gray-700">
                  <AlertCircle className="w-5 h-5 text-primary-600 flex-shrink-0" />
                  <span>Gasta muito em marketing mas não vê resultado?</span>
                </p>
                <p className="flex items-center gap-3 text-lg text-gray-700">
                  <AlertCircle className="w-5 h-5 text-primary-600 flex-shrink-0" />
                  <span>Concorrentes roubam seus clientes com promoções?</span>
                </p>
              </div>

              {/* CTA Principal */}
              <div className="flex flex-col sm:flex-row gap-4">
                <a 
                  href="#planos" 
                  className="inline-flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 rounded-xl text-lg font-bold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all"
                >
                  Começar Agora
                  <ArrowRight className="w-5 h-5" />
                </a>
                <a 
                  href="#como-funciona" 
                  className="inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-primary-600 px-8 py-4 rounded-xl text-lg font-semibold border-2 border-primary-600 transition-all"
                >
                  Ver Como Funciona
                </a>
              </div>

              {/* Social Proof */}
              <div className="flex items-center gap-8 pt-4">
                <div className="flex -space-x-2">
                  {[1,2,3,4,5].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 border-2 border-white"></div>
                  ))}
                </div>
                <div className="text-sm">
                  <div className="flex items-center gap-1 mb-1">
                    {[1,2,3,4,5].map((i) => (
                      <Star key={i} className="w-4 h-4 fill-primary-500 text-primary-500" />
                    ))}
                  </div>
                  <p className="text-gray-600">Mais de 100 comércios locais confiam</p>
                </div>
              </div>
            </div>

            {/* Right Column - Form */}
            <div className="bg-white rounded-2xl shadow-2xl p-8 text-gray-900">
              <div className="text-center mb-6">
                <div className="inline-block bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-bold mb-4">
                  🎁 Teste GRÁTIS por 14 dias
                </div>
                <h2 className="text-2xl font-bold mb-2">
                  Receba uma Análise Gratuita
                </h2>
                <p className="text-gray-600">
                  Veja quanto você pode aumentar seu faturamento
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Seu Nome *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
                    placeholder="João Silva"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Seu Comércio *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.business}
                    onChange={(e) => setFormData({...formData, business: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
                    placeholder="Restaurante Sabor & Arte"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
                    placeholder="(11) 99999-9999"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    E-mail *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
                    placeholder="joao@email.com"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-primary-600 hover:bg-primary-700 text-white px-6 py-4 rounded-lg font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
                >
                  Quero Aumentar Minhas Vendas
                </button>

                <p className="text-xs text-gray-500 text-center">
                  🔒 Seus dados estão seguros. Não compartilhamos com terceiros.
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* STATS SECTION - Problema Quantificado */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              O Custo de <span className="text-red-600">NÃO</span> Ter um Programa de Fidelidade
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Dados reais do mercado brasileiro que todo dono de comércio precisa saber
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-lg text-center border-t-4 border-red-500">
              <div className="text-4xl font-bold text-red-600 mb-2">82%</div>
              <p className="text-gray-700 font-semibold">dos clientes nunca voltam</p>
              <p className="text-sm text-gray-500 mt-2">sem um programa de fidelidade</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg text-center border-t-4 border-orange-500">
              <div className="text-4xl font-bold text-orange-600 mb-2">5x</div>
              <p className="text-gray-700 font-semibold">mais caro conquistar novo cliente</p>
              <p className="text-sm text-gray-500 mt-2">do que reter um existente</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg text-center border-t-4 border-yellow-500">
              <div className="text-4xl font-bold text-yellow-600 mb-2">65%</div>
              <p className="text-gray-700 font-semibold">das vendas vêm de clientes fiéis</p>
              <p className="text-sm text-gray-500 mt-2">que voltam regularmente</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg text-center border-t-4 border-green-500">
              <div className="text-4xl font-bold text-green-600 mb-2">+40%</div>
              <p className="text-gray-700 font-semibold">aumento no faturamento</p>
              <p className="text-sm text-gray-500 mt-2">com programa de cashback ativo</p>
            </div>
          </div>
        </div>
      </section>

      {/* COMO FUNCIONA - Plano Simples */}
      <section id="como-funciona" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-block bg-primary-100 text-primary-800 px-4 py-2 rounded-full text-sm font-bold mb-4">
              SIMPLES E RÁPIDO
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Como Funciona em <span className="text-primary-600">3 Passos Simples</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Seu sistema de fidelidade funcionando em menos de 24 horas
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Passo 1 */}
            <div className="relative">
              <div className="bg-gradient-to-br from-primary-50 to-primary-100 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mb-6">
                  1
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Configure em 5 Minutos
                </h3>
                <p className="text-gray-700 mb-6">
                  Cadastre seu comércio, defina a porcentagem de cashback que vai oferecer (ex: 5%) 
                  e personalize as cores da sua marca.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-gray-700">
                    <Check className="w-5 h-5 text-green-600" />
                    <span>Sem instalação complicada</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-700">
                    <Check className="w-5 h-5 text-green-600" />
                    <span>Não precisa de programador</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-700">
                    <Check className="w-5 h-5 text-green-600" />
                    <span>Suporte em português</span>
                  </li>
                </ul>
              </div>
              {/* Arrow */}
              <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                <ArrowRight className="w-8 h-8 text-primary-400" />
              </div>
            </div>

            {/* Passo 2 */}
            <div className="relative">
              <div className="bg-gradient-to-br from-primary-50 to-primary-100 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mb-6">
                  2
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Seus Clientes Cadastram
                </h3>
                <p className="text-gray-700 mb-6">
                  Cliente entra no seu site ou escaneia QR Code, cadastra CPF/telefone e 
                  já começa a acumular cashback nas compras.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-gray-700">
                    <Check className="w-5 h-5 text-green-600" />
                    <span>Cadastro em 30 segundos</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-700">
                    <Check className="w-5 h-5 text-green-600" />
                    <span>Funciona no celular</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-700">
                    <Check className="w-5 h-5 text-green-600" />
                    <span>Sem app para baixar</span>
                  </li>
                </ul>
              </div>
              {/* Arrow */}
              <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                <ArrowRight className="w-8 h-8 text-primary-400" />
              </div>
            </div>

            {/* Passo 3 */}
            <div className="bg-gradient-to-br from-primary-50 to-primary-100 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mb-6">
                3
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Clientes Voltam Mais
              </h3>
              <p className="text-gray-700 mb-6">
                Sistema envia notificações automáticas, cliente resgata cashback e 
                volta para gastar mais no seu estabelecimento.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-gray-700">
                  <Check className="w-5 h-5 text-green-600" />
                  <span>Notificações automáticas</span>
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <Check className="w-5 h-5 text-green-600" />
                  <span>Resgate fácil via QR Code</span>
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <Check className="w-5 h-5 text-green-600" />
                  <span>Cliente volta 3x mais</span>
                </li>
              </ul>
            </div>
          </div>

          {/* CTA Secundário */}
          <div className="text-center mt-12">
            <a 
              href="#planos" 
              className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 rounded-xl text-lg font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
            >
              Começar Meu Teste Grátis
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>
        </div>
      </section>

      {/* INTEGRAÇÕES - Ferramentas de Marketing */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-block bg-primary-100 text-primary-800 px-4 py-2 rounded-full text-sm font-bold mb-4">
              INTEGRAÇÃO COMPLETA
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Integrações com as <span className="text-primary-600">Principais Ferramentas</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Conecte seu sistema de fidelidade com as melhores plataformas de marketing 
              e crie campanhas mais inteligentes
            </p>
          </div>

          {/* Primeira linha - 3 integrações principais */}
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            {/* Meta Ads */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-6">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Meta Ads
              </h3>
              <p className="text-gray-700 mb-4">
                Integre com Facebook e Instagram Ads. Crie públicos personalizados 
                com base nos seus clientes fiéis e aumente conversão.
              </p>
              <div className="flex items-center gap-2 text-sm text-blue-800 bg-blue-200 px-3 py-2 rounded-lg">
                <Target className="w-4 h-4" />
                <span>Públicos personalizados</span>
              </div>
            </div>

            {/* Google Ads */}
            <div className="bg-gradient-to-br from-red-50 to-orange-100 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl flex items-center justify-center mb-6">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Google Ads
              </h3>
              <p className="text-gray-700 mb-4">
                Remarketing inteligente para seus clientes. Anúncios segmentados 
                que trazem quem já comprou de volta para sua loja.
              </p>
              <div className="flex items-center gap-2 text-sm text-orange-800 bg-orange-200 px-3 py-2 rounded-lg">
                <Zap className="w-4 h-4" />
                <span>Remarketing automático</span>
              </div>
            </div>

            {/* Mailchimp */}
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-yellow-500 rounded-2xl flex items-center justify-center mb-6">
                <Mail className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Mailchimp
              </h3>
              <p className="text-gray-700 mb-4">
                Sincronize seus clientes automaticamente e crie campanhas de email 
                personalizadas baseadas no comportamento de compra.
              </p>
              <div className="flex items-center gap-2 text-sm text-yellow-800 bg-yellow-200 px-3 py-2 rounded-lg">
                <Mail className="w-4 h-4" />
                <span>Email marketing</span>
              </div>
            </div>
          </div>

          {/* Segunda linha - 2 integrações */}
          <div className="grid md:grid-cols-2 gap-8 mb-12 max-w-4xl mx-auto">
            {/* RD Station */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center mb-6">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                RD Station
              </h3>
              <p className="text-gray-700 mb-4">
                Integre com seu CRM e acompanhe toda jornada do cliente. 
                Automação de marketing que realmente converte.
              </p>
              <div className="flex items-center gap-2 text-sm text-green-800 bg-green-200 px-3 py-2 rounded-lg">
                <BarChart3 className="w-4 h-4" />
                <span>CRM integrado</span>
              </div>
            </div>

            {/* Push Notifications */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-purple-500 rounded-2xl flex items-center justify-center mb-6">
                <MessageCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Push Notifications
              </h3>
              <p className="text-gray-700 mb-4">
                Envie notificações push para seus clientes no momento certo. 
                Lembre-os do cashback disponível e traga de volta.
              </p>
              <div className="flex items-center gap-2 text-sm text-purple-800 bg-purple-200 px-3 py-2 rounded-lg">
                <MessageCircle className="w-4 h-4" />
                <span>Notificações push</span>
              </div>
            </div>
          </div>

          {/* Benefícios das Integrações */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-6 text-center">
              🚀 Com Nossas Integrações Você Pode:
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <Check className="w-6 h-6 text-yellow-300 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold mb-1">Campanhas Segmentadas</p>
                  <p className="text-primary-100 text-sm">Envie ofertas específicas para cada perfil de cliente</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-6 h-6 text-yellow-300 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold mb-1">Automação Total</p>
                  <p className="text-primary-100 text-sm">Configure uma vez e o sistema trabalha por você</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-6 h-6 text-yellow-300 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold mb-1">Recuperação de Clientes</p>
                  <p className="text-primary-100 text-sm">Notifique clientes inativos automaticamente</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-6 h-6 text-yellow-300 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold mb-1">Métricas em Tempo Real</p>
                  <p className="text-primary-100 text-sm">Acompanhe resultado de cada campanha</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DIFERENCIAIS - Por que somos o Guia certo */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Por Que Somos <span className="text-primary-600">Diferentes</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Não é só mais um sistema. É a solução completa para seu comércio crescer.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Diferencial 1 */}
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center mb-6">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Dashboard CAC/LTV Exclusivo
              </h3>
              <p className="text-gray-600 mb-4">
                <strong>ÚNICO NO MERCADO:</strong> Saiba exatamente quanto custa conquistar um cliente 
                e quanto cada um vale. Nenhum concorrente oferece isso!
              </p>
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm text-green-800">
                  ✨ <strong>Exclusivo:</strong> Veja seu ROI real em tempo real
                </p>
              </div>
            </div>

            {/* Diferencial 2 */}
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center mb-6">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Sistema Mais Rápido
              </h3>
              <p className="text-gray-600 mb-4">
                Plataforma moderna e veloz, desenvolvida com as melhores tecnologias do mercado. 
                Seu sistema não trava e funciona perfeitamente até em internet lenta.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  ⚡ <strong>Velocidade:</strong> Carrega 3x mais rápido que concorrentes
                </p>
              </div>
            </div>

            {/* Diferencial 3 */}
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center mb-6">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Domínio Próprio Automatizado
              </h3>
              <p className="text-gray-600 mb-4">
                Seu comércio com domínio personalizado (ex: seunegocio.com.br). 
                Concorrentes cobram extra ou fazem manual.
              </p>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                <p className="text-sm text-purple-800">
                  🎨 <strong>Branding:</strong> Sua marca, seu domínio
                </p>
              </div>
            </div>

            {/* Diferencial 4 */}
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center mb-6">
                <Smartphone className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Funciona no Celular
              </h3>
              <p className="text-gray-600 mb-4">
                Cliente não precisa baixar nada! Acessa direto pelo navegador do celular. 
                Funciona como app, mas sem ocupar espaço no celular.
              </p>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <p className="text-sm text-orange-800">
                  📱 <strong>Praticidade:</strong> Zero downloads, máxima conversão
                </p>
              </div>
            </div>

            {/* Diferencial 5 */}
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center mb-6">
                <MessageCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Suporte Personalizado
              </h3>
              <p className="text-gray-600 mb-4">
                Não é robô! Fale direto com quem desenvolve. Suporte real por WhatsApp 
                em português. Respostas rápidas e soluções ágeis.
              </p>
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm text-green-800">
                  💬 <strong>Humano:</strong> Suporte de verdade, não bot
                </p>
              </div>
            </div>

            {/* Diferencial 6 */}
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center mb-6">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Implementação em 24h
              </h3>
              <p className="text-gray-600 mb-4">
                Sistema funcionando em menos de 1 dia. Concorrentes demoram semanas. 
                Startup ágil, sem burocracia, foco em resultado.
              </p>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-800">
                  ⏱️ <strong>Rapidez:</strong> Comece a vender amanhã
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* COMPARAÇÃO - Nós vs Concorrentes */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Veja a <span className="text-primary-600">Diferença Real</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comparação honesta: nós vs líderes de mercado
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-2xl shadow-xl overflow-hidden">
              <thead>
                <tr>
                  <th className="px-6 py-4 text-left font-bold bg-gray-100 text-gray-900">Recurso</th>
                  <th className="px-6 py-4 text-center font-bold bg-gradient-to-br from-primary-600 to-primary-700 text-white">
                    <div className="text-yellow-300 text-2xl mb-1">⭐</div>
                    Nosso Sistema
                  </th>
                  <th className="px-6 py-4 text-center font-bold bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                    <div className="text-orange-100 text-lg mb-1">🔶</div>
                    Concorrente 01
                  </th>
                  <th className="px-6 py-4 text-center font-bold bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                    <div className="text-blue-100 text-lg mb-1">🔷</div>
                    Concorrente 02
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-semibold text-gray-900">Preço Mensal</td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-green-600 font-bold text-lg">R$ 147-497</span>
                  </td>
                  <td className="px-6 py-4 text-center text-gray-600">R$ 179-749</td>
                  <td className="px-6 py-4 text-center text-gray-600">R$ 396-3.168</td>
                </tr>

                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-semibold text-gray-900">Dashboard CAC/LTV</td>
                  <td className="px-6 py-4 text-center">
                    <Check className="w-6 h-6 text-green-600 mx-auto" />
                    <span className="text-xs text-green-600 font-bold">EXCLUSIVO</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <X className="w-6 h-6 text-red-500 mx-auto" />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <X className="w-6 h-6 text-red-500 mx-auto" />
                  </td>
                </tr>

                <tr className="hover:bg-gray-50 bg-green-50">
                  <td className="px-6 py-4 font-semibold text-gray-900">Domínio Próprio Automatizado</td>
                  <td className="px-6 py-4 text-center">
                    <Check className="w-6 h-6 text-green-600 mx-auto" />
                    <span className="text-xs text-green-600 font-bold">INCLUSO</span>
                  </td>
                  <td className="px-6 py-4 text-center text-orange-600 text-sm">Manual</td>
                  <td className="px-6 py-4 text-center text-orange-600 text-sm">Pago extra</td>
                </tr>

                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-semibold text-gray-900">Sistema de Cashback</td>
                  <td className="px-6 py-4 text-center">
                    <Check className="w-6 h-6 text-green-600 mx-auto" />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Check className="w-6 h-6 text-green-600 mx-auto" />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Check className="w-6 h-6 text-green-600 mx-auto" />
                  </td>
                </tr>

                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-semibold text-gray-900">Push Notifications</td>
                  <td className="px-6 py-4 text-center">
                    <Check className="w-6 h-6 text-green-600 mx-auto" />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Check className="w-6 h-6 text-green-600 mx-auto" />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Check className="w-6 h-6 text-green-600 mx-auto" />
                  </td>
                </tr>

                <tr className="hover:bg-gray-50 bg-blue-50">
                  <td className="px-6 py-4 font-semibold text-gray-900">Velocidade do Sistema</td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-blue-600 font-bold text-sm">Ultrarrápido</span>
                    <div className="text-xs text-blue-600">Tecnologia 2025</div>
                  </td>
                  <td className="px-6 py-4 text-center text-gray-600 text-sm">Rápido</td>
                  <td className="px-6 py-4 text-center text-gray-600 text-sm">Normal</td>
                </tr>

                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-semibold text-gray-900">Tempo de Implementação</td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-green-600 font-bold">24 horas</span>
                  </td>
                  <td className="px-6 py-4 text-center text-gray-600">3-7 dias</td>
                  <td className="px-6 py-4 text-center text-gray-600">5-14 dias</td>
                </tr>

                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-semibold text-gray-900">Suporte</td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-primary-600 font-bold text-sm">WhatsApp Direto</span>
                  </td>
                  <td className="px-6 py-4 text-center text-gray-600 text-sm">Ticket/Email</td>
                  <td className="px-6 py-4 text-center text-gray-600 text-sm">Comercial</td>
                </tr>

                <tr className="hover:bg-gray-50 bg-yellow-50">
                  <td className="px-6 py-4 font-semibold text-gray-900">Teste Grátis</td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-green-600 font-bold">14 dias</span>
                  </td>
                  <td className="px-6 py-4 text-center text-gray-600">Não</td>
                  <td className="px-6 py-4 text-center text-gray-600">Não</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-600 mb-6 text-lg">
              💡 <strong>Resumo:</strong> Melhor tecnologia + preço justo + recursos exclusivos
            </p>
            <a 
              href="#planos" 
              className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 rounded-xl text-lg font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
            >
              Ver Planos e Preços
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>
        </div>
      </section>

      {/* PLANOS E PREÇOS - Chamada para Ação */}
      <section id="planos" className="py-20 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-block bg-yellow-400 text-gray-900 px-4 py-2 rounded-full text-sm font-bold mb-4">
              🎁 PROMOÇÃO DE LANÇAMENTO
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Escolha o Plano Ideal para Seu Comércio
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Sem pegadinhas. Sem taxas escondidas. Cancele quando quiser.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Plano Starter */}
            <div className="bg-white text-gray-900 rounded-2xl shadow-2xl p-8 hover:scale-105 transition-transform">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2">Starter</h3>
                <p className="text-gray-600 mb-4">Para quem está começando</p>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-4xl font-bold text-primary-600">R$ 147</span>
                  <span className="text-gray-600">/mês</span>
                </div>
                <p className="text-sm text-gray-500 mt-2">ou R$ 1.470/ano (2 meses grátis)</p>
              </div>

              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Até 2.000 clientes</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Sistema de Cashback</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Portal do Cliente</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>QR Code Resgate</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Dashboard Básico</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>1 funcionário</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Suporte por email</span>
                </li>
              </ul>

              <button className="w-full bg-gray-900 hover:bg-gray-800 text-white py-3 rounded-lg font-bold transition-colors">
                Começar Teste Grátis
              </button>
            </div>

            {/* Plano Business - DESTAQUE */}
            <div className="bg-gradient-to-br from-primary-600 to-primary-700 text-white rounded-2xl shadow-2xl p-8 transform scale-105 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-gray-900 px-6 py-1 rounded-full text-sm font-bold">
                MAIS POPULAR ⭐
              </div>
              
              <div className="text-center mb-6 pt-4">
                <h3 className="text-2xl font-bold mb-2">Business</h3>
                <p className="text-primary-100 mb-4">Para crescer rápido</p>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-4xl font-bold">R$ 297</span>
                  <span className="text-primary-100">/mês</span>
                </div>
                <p className="text-sm text-primary-200 mt-2">ou R$ 2.970/ano (2 meses grátis)</p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 mb-4 text-sm">
                ✨ <strong>Tudo do Starter +</strong>
              </div>

              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-yellow-300 flex-shrink-0 mt-0.5" />
                  <span>Até 10.000 clientes</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-yellow-300 flex-shrink-0 mt-0.5" />
                  <span><strong>Dashboard CAC/LTV</strong> (exclusivo!)</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-yellow-300 flex-shrink-0 mt-0.5" />
                  <span>Integrações (Mailchimp, RD)</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-yellow-300 flex-shrink-0 mt-0.5" />
                  <span>Push Notifications</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-yellow-300 flex-shrink-0 mt-0.5" />
                  <span>Relatórios Avançados</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-yellow-300 flex-shrink-0 mt-0.5" />
                  <span>Até 5 funcionários</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-yellow-300 flex-shrink-0 mt-0.5" />
                  <span>Whitelabel (sua marca)</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-yellow-300 flex-shrink-0 mt-0.5" />
                  <span>Suporte WhatsApp prioritário</span>
                </li>
              </ul>

              <button className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 py-3 rounded-lg font-bold transition-colors">
                Começar Teste Grátis
              </button>
            </div>

            {/* Plano Premium */}
            <div className="bg-white text-gray-900 rounded-2xl shadow-2xl p-8 hover:scale-105 transition-transform">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2">Premium</h3>
                <p className="text-gray-600 mb-4">Para dominar o mercado</p>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-4xl font-bold text-primary-600">R$ 497</span>
                  <span className="text-gray-600">/mês</span>
                </div>
                <p className="text-sm text-gray-500 mt-2">ou R$ 4.970/ano (2 meses grátis)</p>
              </div>

              <div className="bg-primary-50 rounded-lg p-3 mb-4 text-sm text-primary-900">
                ✨ <strong>Tudo do Business +</strong>
              </div>

              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Clientes ILIMITADOS</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Domínio Próprio</strong> (exclusivo!)</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Múltiplas lojas/unidades</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Integração personalizada</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Funcionários ilimitados</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Gerente de conta dedicado</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Treinamento da equipe (2h)</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Suporte VIP (WhatsApp + Tel)</span>
                </li>
              </ul>

              <button className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 rounded-lg font-bold transition-colors">
                Começar Teste Grátis
              </button>
            </div>
          </div>

          {/* Garantia */}
          <div className="text-center mt-12">
            <div className="inline-flex items-center gap-3 bg-white text-gray-900 px-6 py-4 rounded-xl">
              <Shield className="w-8 h-8 text-green-600" />
              <div className="text-left">
                <p className="font-bold">Garantia de 14 Dias</p>
                <p className="text-sm text-gray-600">Não gostou? Devolvemos 100% do seu dinheiro</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DEPOIMENTOS - Prova Social */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              O Que Nossos Clientes Dizem
            </h2>
            <p className="text-xl text-gray-600">
              Resultados reais de comércios locais como o seu
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Depoimento 1 */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="flex items-center gap-1 mb-4">
                {[1,2,3,4,5].map((i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700 mb-4 italic">
                "Implementamos em 1 dia e na primeira semana já tivemos 40% mais clientes voltando. 
                O dashboard CAC/LTV me mostrou que cada cliente vale R$ 350 a mais do que eu pensava!"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full"></div>
                <div>
                  <p className="font-bold text-gray-900">Carlos Mendes</p>
                  <p className="text-sm text-gray-600">Restaurante Sabor & Arte - SP</p>
                </div>
              </div>
            </div>

            {/* Depoimento 2 */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="flex items-center gap-1 mb-4">
                {[1,2,3,4,5].map((i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700 mb-4 italic">
                "Testei outro sistema antes e era muito complicado. Aqui meus clientes cadastram 
                em 30 segundos e não precisam baixar nada. Suporte responde no WhatsApp na hora!"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full"></div>
                <div>
                  <p className="font-bold text-gray-900">Ana Paula Silva</p>
                  <p className="text-sm text-gray-600">Boutique Estilo Único - RJ</p>
                </div>
              </div>
            </div>

            {/* Depoimento 3 */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="flex items-center gap-1 mb-4">
                {[1,2,3,4,5].map((i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700 mb-4 italic">
                "Em 3 meses, 65% dos nossos clientes já estavam cadastrados. O cashback faz eles 
                voltarem sempre. Meu faturamento cresceu 38% só com clientes que já conhecia!"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full"></div>
                <div>
                  <p className="font-bold text-gray-900">Roberto Costa</p>
                  <p className="text-sm text-gray-600">Farmácia Saúde Total - MG</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Perguntas Frequentes
            </h2>
            <p className="text-xl text-gray-600">
              Tudo o que você precisa saber antes de começar
            </p>
          </div>

          <div className="space-y-6">
            <details className="bg-gray-50 p-6 rounded-xl group">
              <summary className="font-bold text-lg text-gray-900 cursor-pointer flex items-center justify-between">
                Como funciona o teste grátis de 14 dias?
                <span className="text-primary-600 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="text-gray-700 mt-4">
                Você cadastra seu comércio, configura o cashback e já pode usar todas as funcionalidades 
                por 14 dias. Não pedimos cartão de crédito. Se gostar, continua no plano escolhido. 
                Se não gostar, é só não fazer nada que cancela automaticamente.
              </p>
            </details>

            <details className="bg-gray-50 p-6 rounded-xl group">
              <summary className="font-bold text-lg text-gray-900 cursor-pointer flex items-center justify-between">
                Preciso de conhecimento técnico para usar?
                <span className="text-primary-600 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="text-gray-700 mt-4">
                NÃO! O sistema é feito para donos de comércio, não para programadores. Se você sabe usar 
                WhatsApp, vai saber usar nosso sistema. E se tiver dúvida, nosso suporte te ajuda.
              </p>
            </details>

            <details className="bg-gray-50 p-6 rounded-xl group">
              <summary className="font-bold text-lg text-gray-900 cursor-pointer flex items-center justify-between">
                Como meus clientes acessam?
                <span className="text-primary-600 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="text-gray-700 mt-4">
                Eles entram pelo celular no site do seu comércio ou escaneiam um QR Code. Não precisa 
                baixar app, não precisa instalar nada. Funciona direto no navegador.
              </p>
            </details>

            <details className="bg-gray-50 p-6 rounded-xl group">
              <summary className="font-bold text-lg text-gray-900 cursor-pointer flex items-center justify-between">
                Quanto custa o cashback que vou dar?
                <span className="text-primary-600 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="text-gray-700 mt-4">
                VOCÊ DECIDE! Pode ser 3%, 5%, 10% ou qualquer valor. A maioria dos nossos clientes usa 5% 
                e diz que o cliente volta 3x mais, então compensa muito. O sistema te mostra o ROI real.
              </p>
            </details>

            <details className="bg-gray-50 p-6 rounded-xl group">
              <summary className="font-bold text-lg text-gray-900 cursor-pointer flex items-center justify-between">
                Posso cancelar a qualquer momento?
                <span className="text-primary-600 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="text-gray-700 mt-4">
                SIM! Sem multa, sem burocracia. Cancela quando quiser e seus dados ficam salvos por 30 dias 
                caso mude de ideia. Mas garanto que não vai querer cancelar quando ver os resultados 😉
              </p>
            </details>

            <details className="bg-gray-50 p-6 rounded-xl group">
              <summary className="font-bold text-lg text-gray-900 cursor-pointer flex items-center justify-between">
                O que é esse Dashboard CAC/LTV exclusivo?
                <span className="text-primary-600 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="text-gray-700 mt-4">
                É o único no mercado! Mostra quanto você GASTA para conquistar cada cliente (CAC) e quanto 
                cada cliente VALE para você (LTV). Nenhum concorrente tem isso. Com esses dados, você 
                sabe exatamente quanto pode investir em marketing e ainda ter lucro.
              </p>
            </details>
          </div>
        </div>
      </section>

      {/* CTA FINAL - Sucesso vs Fracasso */}
      <section className="py-20 bg-gradient-to-br from-primary-600 to-primary-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Você Tem Duas Escolhas Hoje
          </h2>

          <div className="grid md:grid-cols-2 gap-8 my-12">
            {/* Fracasso */}
            <div className="bg-red-900/30 backdrop-blur-sm border-2 border-red-500 p-8 rounded-2xl">
              <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <X className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Continuar Como Está</h3>
              <ul className="text-left space-y-3 text-red-100">
                <li className="flex items-start gap-2">
                  <X className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>82% dos seus clientes nunca mais voltam</span>
                </li>
                <li className="flex items-start gap-2">
                  <X className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>Gasta fortunas em marketing sem resultado</span>
                </li>
                <li className="flex items-start gap-2">
                  <X className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>Concorrentes roubam seus clientes</span>
                </li>
                <li className="flex items-start gap-2">
                  <X className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>Faturamento estagnado ou caindo</span>
                </li>
              </ul>
            </div>

            {/* Sucesso */}
            <div className="bg-green-900/30 backdrop-blur-sm border-2 border-green-400 p-8 rounded-2xl">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Começar Agora</h3>
              <ul className="text-left space-y-3 text-green-100">
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>Clientes voltam 3x mais ao seu comércio</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>Aumenta faturamento em até 40%</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>Clientes fiéis que não vão para concorrência</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>Negócio crescendo todo mês</span>
                </li>
              </ul>
            </div>
          </div>

          <p className="text-2xl mb-8">
            O que você vai escolher?
          </p>

          <a 
            href="#planos" 
            className="inline-flex items-center gap-3 bg-yellow-400 hover:bg-yellow-500 text-gray-900 px-12 py-5 rounded-xl text-xl font-bold shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all"
          >
            Sim! Quero Fazer Meus Clientes Voltarem 3x Mais
            <ArrowRight className="w-6 h-6" />
          </a>

          <p className="text-sm text-gray-200 mt-6">
            ✅ 14 dias grátis • ✅ Sem cartão de crédito • ✅ Cancele quando quiser
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-white text-gray-600 py-12 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <img 
              src="/logo-localcashback.png" 
              alt="LocalCashback - Sistema de Fidelidade" 
              className="h-14 w-auto object-contain"
            />
          </div>
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="text-gray-900 font-bold mb-4">Produto</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-primary-600 transition-colors">Funcionalidades</a></li>
                <li><a href="#planos" className="hover:text-primary-600 transition-colors">Preços</a></li>
                <li><a href="#" className="hover:text-primary-600 transition-colors">Integrações</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-gray-900 font-bold mb-4">Suporte</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-primary-600 transition-colors">Central de Ajuda</a></li>
                <li><a href="#" className="hover:text-primary-600 transition-colors">WhatsApp</a></li>
                <li><a href="#" className="hover:text-primary-600 transition-colors">Tutoriais</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-gray-900 font-bold mb-4">Empresa</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-primary-600 transition-colors">Sobre Nós</a></li>
                <li><a href="#" className="hover:text-primary-600 transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-primary-600 transition-colors">Carreiras</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-gray-900 font-bold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-primary-600 transition-colors">Termos de Uso</a></li>
                <li><a href="#" className="hover:text-primary-600 transition-colors">Privacidade</a></li>
                <li><a href="#" className="hover:text-primary-600 transition-colors">LGPD</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 pt-8 text-center text-gray-600">
            <p>&copy; 2025 Local Cashback. Todos os direitos reservados.</p>
            <p className="text-sm mt-2">Feito com ❤️ para comércios locais brasileiros</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
