import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { LogIn, Phone, Lock, Store, UserPlus, KeyRound, Eye, EyeOff } from 'lucide-react';
import { BRAND_CONFIG } from '../config/branding';

export default function CustomerLogin() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [merchant, setMerchant] = useState(null);
  const [formData, setFormData] = useState({
    phone: '',
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
        .eq('is_active', true)
        .single();

      if (error) throw error;

      if (!data) {
        toast.error('Link de acesso inválido ou expirado');
        return;
      }

      setMerchant(data);
    } catch (error) {
      console.error('Erro ao carregar estabelecimento:', error);
      toast.error('Erro ao carregar informações do estabelecimento');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.phone.trim() || !formData.password.trim()) {
      toast.error('Por favor, preencha todos os campos');
      return;
    }

    setSubmitting(true);

    try {
      // Limpar telefone (apenas números)
      const phoneClean = formData.phone.replace(/\D/g, '');

      if (phoneClean.length < 10 || phoneClean.length > 11) {
        toast.error('Número de telefone inválido');
        setSubmitting(false);
        return;
      }

      // Buscar cliente por phone E merchant_id (multi-tenant)
      const { data: customer, error } = await supabase
        .from('customers')
        .select('id, password_hash, email, email_verified')
        .eq('phone', phoneClean)
        .eq('referred_by_merchant_id', merchant.id)
        .single();

      if (error || !customer) {
        toast.error('Cliente não encontrado neste estabelecimento');
        setSubmitting(false);
        return;
      }

      // Verificar senha (usando btoa para decode simples - em produção use bcrypt)
      const passwordHash = btoa(formData.password);
      
      if (customer.password_hash !== passwordHash) {
        toast.error('Senha incorreta');
        setSubmitting(false);
        return;
      }

      // Verificar se email foi verificado (se o cliente tiver email)
      if (customer.email && !customer.email_verified) {
        toast.error(
          'Email não verificado. Verifique seu email antes de fazer login.',
          { duration: 5000 }
        );
        // Oferecer reenvio de email de verificação
        toast((t) => (
          <div className="flex flex-col gap-2">
            <span className="font-medium">Não recebeu o email?</span>
            <button
              onClick={() => {
                toast.dismiss(t.id);
                navigate(`/customer/resend-verification/${slug}?phone=${phoneClean}`);
              }}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700"
            >
              Reenviar email de verificação
            </button>
          </div>
        ), { duration: 10000 });
        setSubmitting(false);
        return;
      }

      // Login bem-sucedido
      toast.success('Login realizado com sucesso!');
      navigate(`/customer/dashboard/${phoneClean}`);
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      toast.error('Erro ao fazer login. Tente novamente.');
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
            Este link de acesso não é válido ou está inativo.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        {/* Logo do Estabelecimento */}
        <div className="text-center mb-8 pb-6 border-b border-gray-200">
          {merchant.logo_url ? (
            <img 
              src={merchant.logo_url}
              alt={merchant.name}
              className="h-24 w-auto mx-auto mb-4 object-contain"
              onError={(e) => {
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
            Fazer Login
          </h1>
          <p className="text-gray-600">
            Acesse sua conta em {merchant.name}
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
                value={formData.phone}
                onChange={handlePhoneChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="(00) 00000-0000"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Senha
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Digite sua senha"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                title={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3 rounded-lg font-semibold hover:from-primary-700 hover:to-primary-800 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 shadow-lg shadow-primary-500/50"
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Entrando...
              </>
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                Entrar
              </>
            )}
          </button>

          {/* Link para Esqueci Senha - Mais proeminente */}
          <div className="mt-4 text-center">
            <Link
              to={`/customer/forgot-password/${slug}`}
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary-600 hover:text-primary-700 hover:underline transition-colors bg-primary-50 px-4 py-2.5 rounded-lg hover:bg-primary-100"
            >
              <KeyRound className="w-4 h-4" />
              Esqueceu sua senha? Recupere aqui
            </Link>
          </div>
        </form>

        {/* Link para Cadastro */}
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Ainda não tem cadastro?{' '}
            <Link
              to={`/customer/signup/${slug}`}
              className="font-semibold text-primary-600 hover:text-primary-700 inline-flex items-center gap-1 transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              Cadastrar Agora
            </Link>
          </p>
        </div>

        {/* Benefícios */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900 mb-4 text-center">
            Suas vantagens com {BRAND_CONFIG.name}:
          </h3>
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
                Acesse seu saldo e histórico
              </span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-green-600 text-xs">✓</span>
              </div>
              <span className="text-sm text-gray-600">
                Resgate quando quiser
              </span>
            </li>
          </ul>
        </div>

        {/* Powered by */}
        <div className="mt-6 pt-6 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-500">
            Powered by <span className="font-semibold">{BRAND_CONFIG.name}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
