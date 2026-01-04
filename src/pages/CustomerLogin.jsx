import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { Phone, Store } from 'lucide-react';
import { BRAND_CONFIG } from '../config/branding';
import MerchantSEO from '../components/MerchantSEO';

export default function CustomerLogin() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [merchantLoading, setMerchantLoading] = useState(true);
  const [merchant, setMerchant] = useState(null);
  const [phone, setPhone] = useState('');

  useEffect(() => {
    // Se tem slug na URL, carregar merchant por slug
    if (slug) {
      loadMerchantBySlug();
    } else {
      // Se não tem slug, detectar pelo domínio personalizado
      detectMerchantByDomain();
    }
  }, [slug]);

  const loadMerchantBySlug = async () => {
    try {
      const { data, error } = await supabase
        .from('merchants')
        .select('*')
        .eq('signup_link_slug', slug)
        .eq('active', true)
        .single();

      if (error) throw error;

      if (!data) {
        toast.error('Link inválido ou expirado');
        return;
      }

      setMerchant(data);
      
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
      setMerchantLoading(false);
    }
  };

  const detectMerchantByDomain = async () => {
    try {
      const currentHost = window.location.hostname;
      
      console.log('🌐 Detectando merchant por domínio:', currentHost);
      
      // Se está em localhost ou IP de desenvolvimento, carregar primeiro merchant ativo
      if (currentHost.includes('localhost') || 
          currentHost.includes('127.0.0.1') ||
          currentHost.match(/^\d+\.\d+\.\d+\.\d+$/) || // IP address
          currentHost.includes('localcashback.com')) {
        
        console.log('🔧 Ambiente DEV detectado - carregando primeiro merchant ativo');
        
        // Buscar primeiro merchant ativo para DEV
        const { data: devMerchant, error: devError } = await supabase
          .from('merchants')
          .select('*')
          .eq('active', true)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        
        if (devError || !devMerchant) {
          toast.error('Nenhum estabelecimento ativo encontrado. Configure um merchant primeiro.');
          setMerchantLoading(false);
          return;
        }
        
        console.log('✅ Merchant DEV carregado:', devMerchant.name);
        setMerchant(devMerchant);
        setMerchantLoading(false);
        return;
      }

      // Buscar merchant pelo custom_domain
      const { data, error } = await supabase
        .from('merchants')
        .select('*')
        .eq('custom_domain', currentHost)
        .eq('active', true)
        .single();

      console.log('📊 Resultado da busca por domínio:', {
        domain: currentHost,
        found: !!data,
        merchant: data,
        error: error
      });

      if (error || !data) {
        console.error('❌ Merchant não encontrado para domínio:', currentHost);
        toast.error('Estabelecimento não encontrado para este domínio');
        setMerchantLoading(false);
        return;
      }

      console.log('✅ Merchant detectado:', {
        id: data.id,
        name: data.name,
        custom_domain: data.custom_domain
      });

      setMerchant(data);
      
      // Inicializar tracking específico do merchant se configurado
      if (data.gtm_id || data.meta_pixel_id) {
        const { initGTM, initMetaPixel } = await import('../lib/tracking');
        if (data.gtm_id) initGTM(data.gtm_id);
        if (data.meta_pixel_id) initMetaPixel(data.meta_pixel_id);
      }
    } catch (error) {
      console.error('❌ Erro ao detectar estabelecimento:', error);
      toast.error('Erro ao carregar informações do estabelecimento');
    } finally {
      setMerchantLoading(false);
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
    setPhone(formatted);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!phone.trim()) {
      toast.error('Por favor, digite seu telefone');
      return;
    }

    // Validar formato do telefone (apenas números)
    const phoneClean = phone.replace(/\D/g, '');
    if (phoneClean.length < 10 || phoneClean.length > 11) {
      toast.error('Número de telefone inválido');
      return;
    }

    // Verificar se merchant foi identificado
    if (!merchant || !merchant.id) {
      toast.error('Estabelecimento não identificado. Por favor, acesse através do link correto.');
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      console.log('🔍 Buscando cliente:', {
        phone: phoneClean,
        merchant_id: merchant.id,
        merchant_name: merchant.name
      });

      // Verificar se o cliente existe NESTE estabelecimento específico
      const { data: existingCustomer, error } = await supabase
        .from('customers')
        .select('id, phone, name, referred_by_merchant_id')
        .eq('phone', phoneClean)
        .eq('referred_by_merchant_id', merchant.id)
        .single();

      console.log('📊 Resultado da busca:', {
        found: !!existingCustomer,
        customer: existingCustomer,
        error: error
      });

      if (error || !existingCustomer) {
        toast.error(`Você não tem cadastro em ${merchant.name}. Por favor, cadastre-se primeiro.`);
        setLoading(false);
        
        // Redirecionar para página de cadastro se merchant foi identificado
        if (merchant && merchant.signup_link_slug) {
          setTimeout(() => {
            navigate(`/signup/${merchant.signup_link_slug}`);
          }, 2000);
        }
        return;
      }

      console.log('✅ Cliente encontrado, redirecionando para dashboard');

      // Cliente existe neste estabelecimento, redirecionar para dashboard (página de senha)
      // Passar o merchant_id na URL para garantir contexto correto
      navigate(`/customer/dashboard/${phoneClean}?merchant=${merchant.id}`);
    } catch (error) {
      console.error('❌ Erro ao verificar cliente:', error);
      toast.error('Erro ao verificar cliente. Tente novamente.');
      setLoading(false);
    }
  };

  if (merchantLoading) {
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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Estabelecimento não encontrado</h2>
          <p className="text-gray-600">
            Por favor, acesse através do link fornecido pelo estabelecimento.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Meta tags dinâmicas para compartilhamento em redes sociais */}
      <MerchantSEO merchant={merchant} pageType="login" />
      
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          {/* Logo do Estabelecimento no topo */}
          <div className="text-center mb-8 pb-6 border-b border-gray-200">
            {merchant.logo_url ? (
              <img 
                src={merchant.logo_url} 
                alt={merchant.name}
                className="h-24 w-auto mx-auto mb-4"
              />
            ) : (
              <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Store className="w-12 h-12 text-white" />
              </div>
            )}
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Fazer Login
            </h1>
            <p className="text-gray-600">
              Digite seu telefone para acessar seu cashback em {merchant.name}
            </p>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Telefone
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  value={phone}
                  onChange={handlePhoneChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="(00) 00000-0000"
                  required
                  autoFocus
                />
              </div>
              <p className="mt-1 text-sm text-gray-500">
                O mesmo telefone usado no cadastro
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3 rounded-lg font-semibold hover:from-primary-700 hover:to-primary-800 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 shadow-lg shadow-primary-500/50"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Verificando...
                </>
              ) : (
                <>
                  <Phone className="w-5 h-5" />
                  Continuar
                </>
              )}
            </button>

            {/* Link para cadastro */}
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Ainda não tem cadastro?{' '}
                <button
                  type="button"
                  onClick={() => {
                    if (merchant.signup_link_slug) {
                      const currentHost = window.location.hostname;
                      const isCustomDomain = !currentHost.includes('localhost') && 
                                            !currentHost.includes('127.0.0.1') &&
                                            !currentHost.includes('localcashback');
                      
                      if (isCustomDomain) {
                        // Em domínio personalizado, redireciona para /signup mantendo o domínio
                        window.location.href = `/signup/${merchant.signup_link_slug}`;
                      } else {
                        // No domínio principal, usa navigate
                        navigate(`/signup/${merchant.signup_link_slug}`);
                      }
                    }
                  }}
                  className="text-primary-600 hover:text-primary-700 font-semibold hover:underline"
                >
                  Cadastre-se aqui
                </button>
              </p>
            </div>
          </form>

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
