import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { UserPlus, Phone, User, Store, Calendar, Lock, Eye, EyeOff, LogIn } from 'lucide-react';
import { trackEvent } from '../lib/tracking';
import { BRAND_CONFIG, getLogo, getBrandName } from '../config/branding';
import MerchantSEO from '../components/MerchantSEO';

export default function CustomerSignup() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [merchant, setMerchant] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    birthdate: '',
    password: '',
  });

  useEffect(() => {
    loadMerchant();
  }, [slug]);

  const loadMerchant = async () => {
    try {
      const { data, error } = await supabase
        .from('merchants')
        .select('*')
        .eq('signup_link_slug', slug)
        .eq('active', true)
        .single();

      if (error) throw error;

      if (!data) {
        toast.error('Link de cadastro inválido ou expirado');
        return;
      }

      setMerchant(data);
      
      // 🎯 Injetar manifest dinâmico quando merchant for carregado
      if (data.id) {
        const { injectDynamicManifest } = await import('../utils/dynamicManifest');
        injectDynamicManifest(data.id);
      }
      
      // Inicializar tracking específico do merchant se configurado
      if (data.gtm_id || data.meta_pixel_id) {
        const { initGTM, initMetaPixel } = await import('../lib/tracking');
        if (data.gtm_id) initGTM(data.gtm_id);
        if (data.meta_pixel_id) initMetaPixel(data.meta_pixel_id);
      }
    } catch (error) {
      console.error('Erro ao carregar estabelecimento:', error);
      toast.error('Erro ao carregar informações do estabelecimento');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.phone.trim()) {
      toast.error('Por favor, preencha nome e telefone');
      return;
    }

    // Validar senha
    if (!formData.password || formData.password.length < 6) {
      toast.error('A senha deve ter no mínimo 6 caracteres');
      return;
    }

    // Validar data de nascimento
    if (!formData.birthdate) {
      toast.error('Por favor, informe sua data de nascimento');
      return;
    }

    // Validar email se fornecido
    if (formData.email && !formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      toast.error('Email inválido');
      return;
    }

    // Validar formato do telefone (apenas números)
    const phoneClean = formData.phone.replace(/\D/g, '');
    if (phoneClean.length < 10 || phoneClean.length > 11) {
      toast.error('Número de telefone inválido');
      return;
    }

    setSubmitting(true);

    try {
      // 🔒 VERIFICAR LIMITE DE CLIENTES DO PLANO
      // Buscar dados de assinatura do merchant
      const { data: merchantData } = await supabase
        .from('merchants')
        .select('subscription_plan, customer_limit')
        .eq('id', merchant.id)
        .single();

      // Se existe limite, verificar se foi atingido
      if (merchantData?.customer_limit) {
        // Contar clientes únicos atuais (baseado em transações)
        const { data: transactions } = await supabase
          .from('transactions')
          .select('customer_id')
          .eq('merchant_id', merchant.id)
          .eq('status', 'completed');

        const uniqueCustomers = [...new Set(transactions?.map(t => t.customer_id) || [])];
        const currentCustomerCount = uniqueCustomers.length;

        // Verificar se atingiu o limite
        if (currentCustomerCount >= merchantData.customer_limit) {
          toast.error(
            `Limite de clientes atingido (${merchantData.customer_limit}). O estabelecimento precisa fazer upgrade do plano.`,
            { duration: 6000 }
          );
          setSubmitting(false);
          return;
        }
      }

      // Verificar se o cliente já existe NESTE estabelecimento específico
      const { data: existingCustomer } = await supabase
        .from('customers')
        .select('id, phone, name, password_hash')
        .eq('phone', phoneClean)
        .eq('referred_by_merchant_id', merchant.id)
        .single();

      if (existingCustomer) {
        // Cliente já existe NESTE estabelecimento, solicitar senha para login
        toast.error('Este telefone já está cadastrado neste estabelecimento. Por favor, faça login com sua senha.');
        setSubmitting(false);
        return;
      }

      // Hash da senha (usando btoa para encode simples - em produção use bcrypt)
      const passwordHash = btoa(formData.password);

      // Criar novo cliente
      const { data: newCustomer, error } = await supabase
        .from('customers')
        .insert([
          {
            phone: phoneClean,
            name: formData.name,
            email: formData.email || null,
            birthdate: formData.birthdate,
            password_hash: passwordHash,
            referred_by_merchant_id: merchant.id,
            cashback_balance: 0,
          }
        ])
        .select()
        .single();

      if (error) throw error;

      // Tracking de novo cadastro
      trackEvent('CustomerSignup', {
        customer_id: newCustomer.id,
        customer_phone: phoneClean,
        merchant_id: merchant.id,
        merchant_name: merchant.name,
        signup_source: 'merchant_link',
      });

      // Sincronizar com integrações de marketing
      try {
        const { syncCustomerToIntegrations } = await import('../lib/integrations');
        await syncCustomerToIntegrations(newCustomer, merchant.id, 'signup');
      } catch (syncError) {
        console.error('Erro ao sincronizar com integrações:', syncError);
        // Não bloquear o cadastro por erro de integração
      }

      // 🔔 Solicitar permissão de notificações push após cadastro
      // Aguardar um pouco para garantir que o OneSignal foi inicializado
      setTimeout(async () => {
        try {
          console.log('🔔 Solicitando permissão de notificações...');
          
          // Usar subscribe do hook diretamente (ele já tem o customerPhone)
          if (window.OneSignalDeferred) {
            window.OneSignalDeferred.push(async function(OneSignal) {
              try {
                // Definir External User ID (telefone)
                await OneSignal.login(phoneClean);
                console.log('✅ [OneSignal] External User ID definido:', phoneClean);
                
                // Solicitar permissão
                const permission = await OneSignal.Notifications.requestPermission();
                console.log('🔔 Permissão de notificações:', permission ? 'Concedida' : 'Negada');
              } catch (error) {
                console.error('❌ Erro ao configurar notificações:', error);
                // Não bloquear o cadastro
              }
            });
          }
        } catch (notifError) {
          console.error('❌ Erro ao solicitar permissão:', notifError);
          // Não bloquear o cadastro se usuário negar permissão
        }
      }, 2000); // Aguardar 2 segundos após o cadastro

      toast.success('Cadastro realizado com sucesso!');
      navigate(`/customer/dashboard/${phoneClean}`);
    } catch (error) {
      console.error('Erro ao cadastrar:', error);
      toast.error('Erro ao realizar cadastro. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatPhone = (value) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 10) {
      return cleaned.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
    }
    return cleaned.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
  };

  const handlePhoneChange = (e) => {
    const formatted = formatPhone(e.target.value);
    setFormData({ ...formData, phone: formatted });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!merchant) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Store className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Link Inválido</h2>
          <p className="text-gray-600">
            Este link de cadastro não é válido ou está inativo.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Meta tags dinâmicas para compartilhamento em redes sociais */}
      <MerchantSEO merchant={merchant} pageType="signup" />
      
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          {/* Logo do Estabelecimento no topo */}
        <div className="text-center mb-8 pb-6 border-b border-gray-200">
          {merchant.logo_url ? (
            <img 
              src={merchant.logo_url}
              alt={merchant.name}
              className="h-24 w-auto mx-auto mb-4 object-contain"
              onError={(e) => {
                console.error('Erro ao carregar logo:', merchant.logo_url);
                e.target.style.display = 'none';
                e.target.parentElement.innerHTML = `
                  <div class="w-24 h-24 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg class="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                `;
              }}
            />
          ) : (
            <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Store className="w-12 h-12 text-white" />
            </div>
          )}
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {BRAND_CONFIG.messages.customerSignup.title}
          </h1>
          <p className="text-gray-600">
            {BRAND_CONFIG.messages.customerSignup.subtitle.replace('{percentage}', merchant.cashback_percentage)} em {merchant.name}
          </p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome Completo
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Digite seu nome"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="seu@email.com"
              />
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Para receber ofertas exclusivas
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Telefone
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="tel"
                value={formData.phone}
                onChange={handlePhoneChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="(00) 00000-0000"
                required
              />
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Use este número para acessar seu cashback
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data de Nascimento
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="date"
                value={formData.birthdate}
                onChange={(e) => setFormData({ ...formData, birthdate: e.target.value })}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Crie uma Senha
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Mínimo 6 caracteres"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Use esta senha para acessar seu perfil
            </p>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3 rounded-lg font-semibold hover:from-primary-700 hover:to-primary-800 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 shadow-lg shadow-primary-500/50"
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Cadastrando...
              </>
            ) : (
              <>
                <UserPlus className="w-5 h-5" />
                Cadastrar e Começar
              </>
            )}
          </button>
          
          {/* Link para login de clientes existentes */}
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Já tem cadastro?{' '}
              <button
                type="button"
                onClick={() => {
                  // Preserva o contexto do merchant ao redirecionar para login
                  // Verifica se está em domínio personalizado
                  const currentHost = window.location.hostname;
                  const isCustomDomain = !currentHost.includes('localhost') && 
                                        !currentHost.includes('127.0.0.1') &&
                                        !currentHost.includes('localcashback');
                  
                  if (isCustomDomain) {
                    // Em domínio personalizado, redireciona para /customer/login mantendo o domínio
                    window.location.href = '/customer/login';
                  } else {
                    // No domínio principal, usa navigate para /customer/login com slug
                    navigate(`/customer/login/${slug}`);
                  }
                }}
                className="text-primary-600 hover:text-primary-700 font-semibold hover:underline"
              >
                Fazer Login
              </button>
            </p>
          </div>
        </form>

        {/* Benefícios */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Seus Benefícios:</h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-green-600 text-xs">✓</span>
              </div>
              <span className="text-sm text-gray-600">
                <strong>{merchant.cashback_percentage}% de cashback</strong> em todas as compras
              </span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-green-600 text-xs">✓</span>
              </div>
              <span className="text-sm text-gray-600">
                Acumule e resgate quando quiser
              </span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-green-600 text-xs">✓</span>
              </div>
              <span className="text-sm text-gray-600">
                Sem taxas ou mensalidades
              </span>
            </li>
          </ul>
        </div>

        {/* Powered by LocalCashback */}
        <div className="mt-6 pt-6 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-400 flex items-center justify-center gap-1">
            Powered by
            <span className="font-semibold text-gray-500">LocalCashback</span>
          </p>
        </div>
      </div>
    </div>
    </>
  );
}
