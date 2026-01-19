import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { Phone, Calendar, ArrowLeft, Key, Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { getLogo, getBrandName } from '../config/branding';

export default function CustomerForgotPassword() {
  const { phone: phoneParam } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: telefone+nascimento, 2: nova senha
  const [phone, setPhone] = useState(phoneParam || '');
  const [birthdate, setBirthdate] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [customerId, setCustomerId] = useState(null);
  const [merchant, setMerchant] = useState(null);

  useEffect(() => {
    if (phoneParam) {
      loadMerchant(phoneParam);
    }
  }, [phoneParam]);

  const loadMerchant = async (customerPhone) => {
    try {
      const phoneClean = customerPhone.replace(/\D/g, '');
      const { data: customerList } = await supabase
        .from('customers')
        .select('referred_by_merchant_id')
        .eq('phone', phoneClean)
        .order('created_at', { ascending: false })  // Pegar o mais recente
        .limit(1);

      const customerData = customerList && customerList.length > 0 ? customerList[0] : null;

      if (customerData?.referred_by_merchant_id) {
        const { data: merchantData } = await supabase
          .from('merchants')
          .select('id, name, logo_url')
          .eq('id', customerData.referred_by_merchant_id)
          .single();
        
        if (merchantData) {
          setMerchant(merchantData);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar merchant:', error);
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

  const handleVerifyIdentity = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const phoneClean = phone.replace(/\D/g, '');

      if (phoneClean.length < 10 || phoneClean.length > 11) {
        toast.error('Número de telefone inválido');
        setLoading(false);
        return;
      }

      if (!birthdate) {
        toast.error('Data de nascimento é obrigatória');
        setLoading(false);
        return;
      }

      // Buscar cliente pelo telefone e data de nascimento (usando limit(1))
      const { data: customerList, error: findError } = await supabase
        .from('customers')
        .select('id, name, phone, birthdate')
        .eq('phone', phoneClean)
        .eq('birthdate', birthdate)
        .order('created_at', { ascending: false })  // Pegar o mais recente
        .limit(1);

      const customer = customerList && customerList.length > 0 ? customerList[0] : null;

      if (findError || !customer) {
        toast.error('Telefone ou data de nascimento incorretos');
        setLoading(false);
        return;
      }

      // Identidade verificada!
      setCustomerId(customer.id);
      setStep(2);
      toast.success(`Olá, ${customer.name}! Agora crie uma nova senha.`);
      
    } catch (error) {
      console.error('Erro ao verificar identidade:', error);
      toast.error('Erro ao verificar identidade. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validar senhas
      if (newPassword.length < 6) {
        toast.error('A senha deve ter no mínimo 6 caracteres');
        setLoading(false);
        return;
      }

      if (newPassword !== confirmPassword) {
        toast.error('As senhas não coincidem');
        setLoading(false);
        return;
      }

      // Atualizar senha no banco (usando btoa para encode simples)
      const passwordHash = btoa(newPassword);
      
      const { error: updateError } = await supabase
        .from('customers')
        .update({ password_hash: passwordHash })
        .eq('id', customerId);

      if (updateError) {
        console.error('Erro ao atualizar senha:', updateError);
        throw updateError;
      }

      toast.success('Senha alterada com sucesso!', { duration: 3000 });

      // Redirecionar para login após 2 segundos
      setTimeout(() => {
        const phoneClean = phone.replace(/\D/g, '');
        navigate(`/customer/dashboard/${phoneClean}`);
      }, 2000);

    } catch (error) {
      console.error('Erro ao redefinir senha:', error);
      toast.error('Erro ao redefinir senha. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        {/* Logo do Merchant (se disponível) */}
        {merchant?.logo_url && (
          <div className="text-center mb-6">
            <img 
              src={merchant.logo_url} 
              alt={merchant.name}
              className="h-20 w-auto mx-auto"
            />
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-8">
          {!merchant?.logo_url && (
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
              <Key className="w-8 h-8 text-primary-600" />
            </div>
          )}
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Recuperar Senha
          </h1>
          <p className="text-gray-600">
            {step === 1 
              ? 'Confirme seus dados para redefinir sua senha'
              : 'Crie uma nova senha para sua conta'
            }
          </p>
        </div>

        {/* Step 1: Verificar identidade */}
        {step === 1 && (
          <form onSubmit={handleVerifyIdentity} className="space-y-6">
            {/* Telefone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Telefone cadastrado
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={handlePhoneChange}
                  required
                  className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="(00) 00000-0000"
                  autoFocus={!phoneParam}
                />
              </div>
            </div>

            {/* Data de Nascimento */}
            <div>
              <label htmlFor="birthdate" className="block text-sm font-medium text-gray-700 mb-2">
                Data de Nascimento
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="birthdate"
                  type="date"
                  value={birthdate}
                  onChange={(e) => setBirthdate(e.target.value)}
                  required
                  max={new Date().toISOString().split('T')[0]}
                  className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                A mesma data informada no cadastro
              </p>
            </div>

            {/* Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Key className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Recuperação Segura</p>
                  <p className="text-xs">
                    Confirme seus dados para redefinir sua senha. Não enviamos códigos por email ou SMS.
                  </p>
                </div>
              </div>
            </div>

            {/* Botões */}
            <div className="flex flex-col gap-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Verificando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Verificar Identidade
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => navigate(-1)}
                className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Voltar
              </button>
            </div>
          </form>
        )}

        {/* Step 2: Nova senha */}
        {step === 2 && (
          <form onSubmit={handleResetPassword} className="space-y-6">
            {/* Nova Senha */}
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Nova Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Mínimo 6 caracteres"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  tabIndex={-1}
                >
                  {showNewPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirmar Senha */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirmar Nova Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Digite a senha novamente"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Info de segurança */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-green-800">
                  <p className="font-medium mb-1">✅ Identidade Verificada</p>
                  <p className="text-xs">
                    Crie uma senha forte com no mínimo 6 caracteres
                  </p>
                </div>
              </div>
            </div>

            {/* Botões */}
            <div className="flex flex-col gap-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Alterando...
                  </>
                ) : (
                  <>
                    <Key className="w-5 h-5" />
                    Alterar Senha
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Voltar
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
