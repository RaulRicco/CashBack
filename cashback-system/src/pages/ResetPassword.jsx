import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, KeyRound } from 'lucide-react';
import { BRAND_CONFIG, getLogo, getBrandName } from '../config/branding';
import { resetPassword } from '../lib/passwordReset';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Pegar email e tipo da URL (se vier do link do ForgotPassword)
  const emailFromUrl = searchParams.get('email') || '';
  const userTypeFromUrl = searchParams.get('type') || 'merchant';

  const [email, setEmail] = useState(emailFromUrl);
  const [userType, setUserType] = useState(userTypeFromUrl);
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [passwordChanged, setPasswordChanged] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validações
    if (!email) {
      toast.error('Por favor, digite seu email');
      return;
    }

    if (!verificationCode || verificationCode.length !== 6) {
      toast.error('Digite o código de 6 dígitos');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }

    setLoading(true);

    try {
      const result = await resetPassword(email, verificationCode, userType, newPassword);
      
      if (result.success) {
        setPasswordChanged(true);
        toast.success(result.message);
        
        // Redirecionar para login após 3 segundos
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        toast.error(result.error || 'Erro ao redefinir senha');
      }
    } catch (error) {
      console.error('Erro ao redefinir senha:', error);
      toast.error('Erro ao processar solicitação');
    } finally {
      setLoading(false);
    }
  };

  // Senha alterada com sucesso
  if (passwordChanged) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center mb-4">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Senha Alterada!
            </h1>
            <p className="text-gray-600 mb-6">
              Sua senha foi alterada com sucesso. Você será redirecionado para a página de login em alguns segundos...
            </p>
            <button
              onClick={() => navigate('/login')}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
            >
              Ir para Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Formulário de redefinição de senha
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        
        {/* Logo e Título */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <img 
              src={getLogo('icon')}
              alt={getBrandName()} 
              className="object-contain w-20 h-20"
            />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Redefinir Senha
          </h1>
          <p className="text-gray-600 text-sm">
            Digite o código que você recebeu no email
          </p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Email (se não veio da URL) */}
          {!emailFromUrl && (
            <>
              {/* Tipo de Usuário */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Tipo de Conta
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setUserType('merchant')}
                    className={`py-3 px-4 rounded-lg border-2 font-medium transition-all ${
                      userType === 'merchant'
                        ? 'border-primary-600 bg-primary-50 text-primary-700'
                        : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    🏪 Estabelecimento
                  </button>
                  <button
                    type="button"
                    onClick={() => setUserType('customer')}
                    className={`py-3 px-4 rounded-lg border-2 font-medium transition-all ${
                      userType === 'customer'
                        ? 'border-primary-600 bg-primary-50 text-primary-700'
                        : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    👤 Cliente
                  </button>
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="seu@email.com"
                />
              </div>
            </>
          )}

          {/* Código de Verificação */}
          <div>
            <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
              Código de Verificação
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <KeyRound className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="code"
                type="text"
                value={verificationCode}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setVerificationCode(value);
                }}
                required
                maxLength={6}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-center text-2xl font-bold tracking-widest"
                placeholder="000000"
              />
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Digite o código de 6 dígitos que você recebeu no email
            </p>
          </div>

          {/* Nova Senha */}
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Nova Senha
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="newPassword"
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
                className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Mínimo 6 caracteres"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
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
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
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
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                )}
              </button>
            </div>
          </div>

          {/* Indicador de Força da Senha */}
          {newPassword.length > 0 && (
            <div className="space-y-2">
              <div className="flex gap-2">
                <div className={`h-2 flex-1 rounded ${newPassword.length >= 6 ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                <div className={`h-2 flex-1 rounded ${newPassword.length >= 8 ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                <div className={`h-2 flex-1 rounded ${newPassword.length >= 10 && /[A-Z]/.test(newPassword) ? 'bg-green-500' : 'bg-gray-200'}`}></div>
              </div>
              <p className="text-xs text-gray-600">
                {newPassword.length < 6 && 'Senha muito curta (mínimo 6 caracteres)'}
                {newPassword.length >= 6 && newPassword.length < 8 && 'Senha boa'}
                {newPassword.length >= 8 && 'Senha forte'}
              </p>
            </div>
          )}

          {/* Verificação de Senhas Iguais */}
          {confirmPassword.length > 0 && (
            <div className={`flex items-center gap-2 text-sm ${newPassword === confirmPassword ? 'text-green-600' : 'text-red-600'}`}>
              {newPassword === confirmPassword ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>As senhas coincidem</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4" />
                  <span>As senhas não coincidem</span>
                </>
              )}
            </div>
          )}

          {/* Botão Submit */}
          <button
            type="submit"
            disabled={loading || newPassword !== confirmPassword || newPassword.length < 6 || verificationCode.length !== 6}
            className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Alterando senha...
              </>
            ) : (
              <>
                <Lock className="w-5 h-5" />
                Alterar Senha
              </>
            )}
          </button>

          {/* Link voltar */}
          <div className="text-center">
            <button
              type="button"
              onClick={() => navigate('/forgot-password')}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium hover:underline"
            >
              Não recebeu o código? Solicitar novo
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
