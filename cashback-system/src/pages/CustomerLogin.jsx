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
        .eq('is_active', true)
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
      
      // Se está em localhost ou domínio principal, não há merchant específico
      if (currentHost.includes('localhost') || 
          currentHost.includes('127.0.0.1') ||
          currentHost.includes('localcashback.com')) {
        toast.error('Acesse através do link do estabelecimento');
        setMerchantLoading(false);
        return;
      }

      // Buscar merchant pelo custom_domain
      const { data, error } = await supabase
        .from('merchants')
        .select('*')
        .eq('custom_domain', currentHost)
        .eq('is_active', true)
        .single();

      if (error || !data) {
        console.error('Merchant não encontrado para domínio:', currentHost);
        toast.error('Estabelecimento não encontrado para este domínio');
        setMerchantLoading(false);
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
      console.error('Erro ao detectar estabelecimento:', error);
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

    setLoading(true);

    try {
      // Verificar se o cliente existe
      const { data: existingCustomer, error } = await supabase
        .from('customers')
        .select('id, phone')
        .eq('phone', phoneClean)
        .single();

      if (error || !existingCustomer) {
        toast.error('Cliente não encontrado. Por favor, cadastre-se primeiro.');
        setLoading(false);
        
        // Redirecionar para página de cadastro se merchant foi identificado
        if (merchant && merchant.signup_link_slug) {
          setTimeout(() => {
            navigate(`/signup/${merchant.signup_link_slug}`);
          }, 2000);
        }
        return;
      }

      // Cliente existe, redirecionar para dashboard (página de senha)
      navigate(`/customer/dashboard/${phoneClean}`);
    } catch (error) {
      console.error('Erro ao verificar cliente:', error);
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
