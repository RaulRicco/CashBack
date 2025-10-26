import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { UserPlus, Phone, User, Store } from 'lucide-react';
import { trackEvent } from '../lib/tracking';

export default function CustomerSignup() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [merchant, setMerchant] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
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
        .eq('is_active', true)
        .single();

      if (error) throw error;

      if (!data) {
        toast.error('Link de cadastro inválido ou expirado');
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
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.phone.trim()) {
      toast.error('Por favor, preencha todos os campos');
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
      // Verificar se o cliente já existe
      const { data: existingCustomer } = await supabase
        .from('customers')
        .select('id, phone, name')
        .eq('phone', phoneClean)
        .single();

      if (existingCustomer) {
        // Cliente já existe, apenas redirecionar para dashboard
        toast.success(`Bem-vindo de volta, ${existingCustomer.name}!`);
        
        // Tracking de login
        trackEvent('CustomerLogin', {
          customer_phone: phoneClean,
          merchant_id: merchant.id,
          merchant_name: merchant.name,
        });
        
        navigate(`/customer/dashboard/${phoneClean}`);
        return;
      }

      // Criar novo cliente
      const { data: newCustomer, error } = await supabase
        .from('customers')
        .insert([
          {
            phone: phoneClean,
            name: formData.name,
            email: null,
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!merchant) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Store className="w-8 h-8 text-red-600" />
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        {/* Logo/Nome do Estabelecimento */}
        <div className="text-center mb-8">
          {merchant.logo_url ? (
            <img 
              src={merchant.logo_url} 
              alt={merchant.name}
              className="h-20 w-auto mx-auto mb-4"
            />
          ) : (
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Store className="w-10 h-10 text-white" />
            </div>
          )}
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Cadastre-se
          </h1>
          <p className="text-gray-600">
            Comece a ganhar <span className="font-semibold text-blue-600">{merchant.cashback_percentage}% de cashback</span> em {merchant.name}
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
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Digite seu nome"
                required
              />
            </div>
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
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="(00) 00000-0000"
                required
              />
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Use este número para acessar seu cashback
            </p>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
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
      </div>
    </div>
  );
}
