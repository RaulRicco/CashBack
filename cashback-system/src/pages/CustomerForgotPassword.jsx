import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { sendPasswordResetEmail, sendPasswordChangedEmail } from '../lib/resend';
import toast from 'react-hot-toast';
import { Phone, Store, ArrowLeft, Lock, KeyRound } from 'lucide-react';
import { BRAND_CONFIG } from '../config/branding';

export default function CustomerForgotPassword() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [merchant, setMerchant] = useState(null);
  const [step, setStep] = useState(1); // 1 = phone, 2 = code, 3 = new password
  const [verificationCode, setVerificationCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [customerId, setCustomerId] = useState(null);
  
  const [formData, setFormData] = useState({
    phone: '',
    code: '',
    newPassword: '',
    confirmPassword: '',
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

  const handleSendCode = async (e) => {
    e.preventDefault();
    
    if (!formData.phone.trim()) {
      toast.error('Por favor, informe seu telefone');
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

      // Buscar cliente por phone e merchant_id
      const { data: customer, error } = await supabase
        .from('customers')
        .select('id, name, email')
        .eq('phone', phoneClean)
        .eq('referred_by_merchant_id', merchant.id)
        .single();

      if (error || !customer) {
        toast.error('Cliente não encontrado neste estabelecimento');
        setSubmitting(false);
        return;
      }

      // Gerar código de 6 dígitos
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedCode(code);
      setCustomerId(customer.id);

      // Verificar se cliente tem email
      if (customer.email && customer.email.trim()) {
        // Enviar código por email usando Resend
        console.log('📧 Enviando código de recuperação por email para:', customer.email);
        
        const emailResult = await sendPasswordResetEmail({
          email: customer.email,
          verificationCode: code,
          userName: customer.name || 'Cliente',
          userType: 'customer'
        });

        if (emailResult.success) {
          toast.success(`Código enviado para seu email: ${customer.email.substring(0, 3)}...@${customer.email.split('@')[1]}`);
          console.log('✅ Email enviado com sucesso:', emailResult.id);
        } else {
          console.error('❌ Erro ao enviar email:', emailResult.error);
          toast.error('Erro ao enviar email. Tente novamente.');
          setSubmitting(false);
          return;
        }
      } else {
        // Sem email cadastrado - mostrar código no console (modo dev)
        console.log('⚠️ Cliente sem email cadastrado');
        console.log('🔐 Código de recuperação:', code);
        console.log('📱 Telefone:', phoneClean);
        
        toast.error('Cliente não possui email cadastrado. Entre em contato com o estabelecimento.');
        setSubmitting(false);
        return;
      }

      // Em desenvolvimento, mostrar o código também no console
      if (window.location.hostname === 'localhost' || import.meta.env.DEV) {
        console.log('⚠️ MODO DEV - Código:', code);
        toast.success(`⚠️ DEV - Código: ${code}`, { duration: 10000 });
      }

      setStep(2);
    } catch (error) {
      console.error('Erro ao enviar código:', error);
      toast.error('Erro ao enviar código. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();

    if (!formData.code.trim()) {
      toast.error('Por favor, informe o código');
      return;
    }

    if (formData.code !== generatedCode) {
      toast.error('Código inválido');
      return;
    }

    toast.success('Código verificado! Agora crie sua nova senha.');
    setStep(3);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!formData.newPassword || !formData.confirmPassword) {
      toast.error('Preencha todos os campos');
      return;
    }

    if (formData.newPassword.length < 6) {
      toast.error('A senha deve ter no mínimo 6 caracteres');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }

    setSubmitting(true);

    try {
      // Hash da nova senha
      const passwordHash = btoa(formData.newPassword);

      // Atualizar senha do cliente
      const { error } = await supabase
        .from('customers')
        .update({ password_hash: passwordHash })
        .eq('id', customerId);

      if (error) throw error;

      toast.success('Senha alterada com sucesso!');

      // Enviar email de confirmação se cliente tiver email
      const { data: customerData } = await supabase
        .from('customers')
        .select('email, name')
        .eq('id', customerId)
        .single();

      if (customerData?.email && customerData.email.trim()) {
        console.log('📧 Enviando email de confirmação...');
        
        const confirmEmailResult = await sendPasswordChangedEmail({
          email: customerData.email,
          userName: customerData.name || 'Cliente',
          userType: 'customer'
        });

        if (confirmEmailResult.success) {
          console.log('✅ Email de confirmação enviado');
        } else {
          console.error('❌ Erro ao enviar email de confirmação:', confirmEmailResult.error);
        }
      }
      
      // Redirecionar para login após 2 segundos
      setTimeout(() => {
        navigate(`/customer/login/${slug}`);
      }, 2000);
    } catch (error) {
      console.error('Erro ao redefinir senha:', error);
      toast.error('Erro ao redefinir senha. Tente novamente.');
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
              className="h-24 w-auto mx-auto mb-4"
            />
          ) : (
            <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Store className="w-12 h-12 text-white" />
            </div>
          )}
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Recuperar Senha
          </h1>
          <p className="text-gray-600">
            {merchant.name}
          </p>
        </div>

        {/* Step 1: Informar Telefone */}
        {step === 1 && (
          <form onSubmit={handleSendCode} className="space-y-6">
            <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded">
              <p className="text-sm text-blue-900">
                Informe seu telefone cadastrado. Enviaremos um código de verificação por <strong>email</strong> para você criar uma nova senha.
              </p>
              <p className="text-xs text-blue-700 mt-2">
                ⚠️ Certifique-se de que seu email está cadastrado no estabelecimento.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Telefone Cadastrado
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

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3 rounded-lg font-semibold hover:from-primary-700 hover:to-primary-800 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 shadow-lg shadow-primary-500/50"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Enviando...
                </>
              ) : (
                <>
                  <Phone className="w-5 h-5" />
                  Enviar Código
                </>
              )}
            </button>

            <Link
              to={`/customer/login/${slug}`}
              className="flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar para Login
            </Link>
          </form>
        )}

        {/* Step 2: Verificar Código */}
        {step === 2 && (
          <form onSubmit={handleVerifyCode} className="space-y-6">
            <div className="bg-green-50 border-l-4 border-green-600 p-4 rounded">
              <p className="text-sm text-green-900">
                📧 Código enviado para seu email cadastrado
              </p>
              <p className="text-xs text-green-700 mt-1">
                Verifique sua caixa de entrada e spam
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Código de Verificação
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-center text-2xl tracking-widest font-mono"
                  placeholder="000000"
                  maxLength={6}
                  required
                />
              </div>
              <p className="mt-2 text-xs text-gray-500 text-center">
                Digite o código de 6 dígitos que você recebeu
              </p>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3 rounded-lg font-semibold hover:from-primary-700 hover:to-primary-800 transition-all transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg shadow-primary-500/50"
            >
              <KeyRound className="w-5 h-5" />
              Verificar Código
            </button>

            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              ← Voltar
            </button>
          </form>
        )}

        {/* Step 3: Nova Senha */}
        {step === 3 && (
          <form onSubmit={handleResetPassword} className="space-y-6">
            <div className="bg-green-50 border-l-4 border-green-600 p-4 rounded">
              <p className="text-sm text-green-900">
                ✓ Código verificado! Agora crie sua nova senha.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nova Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={formData.newPassword}
                  onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Mínimo 6 caracteres"
                  minLength={6}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirmar Nova Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Digite a senha novamente"
                  minLength={6}
                  required
                />
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
                  Salvando...
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5" />
                  Redefinir Senha
                </>
              )}
            </button>
          </form>
        )}

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
