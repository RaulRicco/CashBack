import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { Lock, Key, CheckCircle, ArrowLeft } from 'lucide-react';
import { getLogo, getBrandName } from '../config/branding';

export default function CustomerResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [verifyingToken, setVerifyingToken] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [customerId, setCustomerId] = useState(null);
  const [phone, setPhone] = useState('');
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordChanged, setPasswordChanged] = useState(false);

  useEffect(() => {
    const phoneParam = searchParams.get('phone');
    const tokenParam = searchParams.get('token');

    if (!phoneParam || !tokenParam) {
      toast.error('Link inválido. Solicite um novo código de recuperação.');
      navigate('/customer/forgot-password');
      return;
    }

    setPhone(phoneParam);
    setToken(tokenParam);
    verifyToken(phoneParam, tokenParam);
  }, [searchParams]);

  const verifyToken = async (phoneNumber, tokenCode) => {
    try {
      // Buscar cliente pelo telefone
      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .select('id')
        .eq('phone', phoneNumber)
        .single();

      if (customerError || !customer) {
        toast.error('Cliente não encontrado');
        setVerifyingToken(false);
        return;
      }

      // Verificar se o token existe e é válido
      const { data: tokenData, error: tokenError } = await supabase
        .from('customer_password_recovery_tokens')
        .select('*')
        .eq('customer_id', customer.id)
        .eq('token', tokenCode)
        .eq('used', false)
        .single();

      if (tokenError || !tokenData) {
        toast.error('Código inválido ou já utilizado');
        setVerifyingToken(false);
        return;
      }

      // Verificar se o token expirou
      const expiresAt = new Date(tokenData.expires_at);
      const now = new Date();

      if (now > expiresAt) {
        toast.error('Código expirado. Solicite um novo código.');
        setVerifyingToken(false);
        return;
      }

      // Token válido
      setCustomerId(customer.id);
      setTokenValid(true);
      setVerifyingToken(false);

    } catch (error) {
      console.error('Erro ao verificar token:', error);
      toast.error('Erro ao verificar código. Tente novamente.');
      setVerifyingToken(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password.length < 6) {
      toast.error('A senha deve ter no mínimo 6 caracteres');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }

    setLoading(true);

    try {
      // Hash da senha (usando btoa para encode simples - em produção use bcrypt)
      const passwordHash = btoa(password);

      // Atualizar senha do cliente
      const { error: updateError } = await supabase
        .from('customers')
        .update({ password_hash: passwordHash })
        .eq('id', customerId);

      if (updateError) throw updateError;

      // Marcar token como usado
      const { error: tokenError } = await supabase
        .from('customer_password_recovery_tokens')
        .update({ used: true })
        .eq('customer_id', customerId)
        .eq('token', token);

      if (tokenError) console.error('Erro ao marcar token como usado:', tokenError);

      toast.success('Senha alterada com sucesso!');
      setPasswordChanged(true);

      // Redirecionar para o dashboard após 2 segundos
      setTimeout(() => {
        navigate(`/customer/dashboard/${phone}`);
      }, 2000);

    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      toast.error('Erro ao alterar senha. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (verifyingToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Verificando código...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Código Inválido
            </h1>
            <p className="text-gray-600 mb-6">
              O código de recuperação é inválido ou já foi utilizado.
            </p>
            <button
              onClick={() => navigate('/customer/forgot-password')}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
            >
              Solicitar Novo Código
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (passwordChanged) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Senha Alterada!
            </h1>
            <p className="text-gray-600">
              Sua senha foi alterada com sucesso. Redirecionando para seu perfil...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <img 
              src={getLogo('icon')}
              alt={getBrandName()} 
              className="object-contain w-20 h-20"
            />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Nova Senha
          </h1>
          <p className="text-gray-600">
            Digite sua nova senha abaixo
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nova Senha */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Nova Senha
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Mínimo 6 caracteres"
              />
            </div>
          </div>

          {/* Confirmar Senha */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Confirmar Nova Senha
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Key className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Digite a senha novamente"
              />
            </div>
          </div>

          {/* Info */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Key className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-green-800">
                <p className="font-medium mb-1">Requisitos da senha:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Mínimo de 6 caracteres</li>
                  <li>Use uma senha forte e única</li>
                  <li>Não compartilhe sua senha</li>
                </ul>
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
                  <CheckCircle className="w-5 h-5" />
                  Alterar Senha
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => navigate('/customer/forgot-password')}
              className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Solicitar Novo Código
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
