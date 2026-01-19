import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, ArrowLeft, RefreshCw, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { verifyEmailCode, verifyEmailToken, resendVerificationCode } from '../lib/emailVerification';

export default function EmailVerification() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const token = searchParams.get('token') || '';
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    // Se vier via link com token, verificar automaticamente sem expor email
    if (token) {
      (async () => {
        const result = await verifyEmailToken({ token });
        if (result.success) {
          toast.success(result.message);
          setTimeout(() => navigate('/login'), 1500);
        } else {
          toast.error(result.error || 'Código inválido ou expirado');
        }
      })();
    }
  }, [token, navigate]);

  const handleVerify = async (verificationCode = code) => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast.error('Por favor, insira o código de 6 dígitos');
      return;
    }

    setIsLoading(true);
    try {
      const result = await verifyEmailCode({
        email,
        code: verificationCode,
      });

      if (result.success) {
        toast.success(result.message);
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        toast.error(result.error || 'Código inválido ou expirado');
      }
    } catch (error) {
      toast.error('Erro ao verificar código');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    try {
      const result = await resendVerificationCode({ email });

      if (result.success) {
        toast.success('Novo código enviado! Verifique seu email.');
        setCode(''); // Limpar campo
      } else {
        toast.error(result.error || 'Erro ao reenviar código');
      }
    } catch (error) {
      toast.error('Erro ao reenviar código');
    } finally {
      setIsResending(false);
    }
  };

  const handleCodeChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setCode(value);

    // Auto-submit quando digitar 6 dígitos
    if (value.length === 6) {
      handleVerify(value);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Card Principal */}
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-teal-500 to-blue-600 shadow-lg">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              Verifique seu Email
            </h1>
            <p className="text-gray-600">
              Enviamos um código de 6 dígitos para seu email.
            </p>
          </div>

          {/* Formulário */}
          <div className="space-y-4">
            {/* Input Email (somente leitura) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-gray-50"
                placeholder="seu@email.com"
              />
            </div>

            {/* Input Código */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Código de Verificação
              </label>
              <input
                type="text"
                value={code}
                onChange={handleCodeChange}
                maxLength={6}
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-center text-2xl font-mono tracking-widest"
                placeholder="000000"
                disabled={isLoading}
              />
              <p className="mt-2 text-sm text-gray-500 text-center">
                Digite o código de 6 dígitos
              </p>
            </div>

            {/* Botão Verificar */}
            <button
              onClick={() => handleVerify()}
              disabled={isLoading || code.length !== 6}
              className="w-full py-3 px-4 bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Verificando...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Verificar Email
                </>
              )}
            </button>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">
                Não recebeu o código?
              </span>
            </div>
          </div>

          {/* Botão Reenviar */}
          <button
            onClick={handleResend}
            disabled={isResending}
            className="w-full py-3 px-4 border-2 border-teal-600 text-teal-600 hover:bg-teal-50 font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isResending ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <RefreshCw className="w-5 h-5" />
                Reenviar Código
              </>
            )}
          </button>

          {/* Link Voltar */}
          <button
            onClick={() => navigate('/login')}
            className="w-full py-2 text-gray-600 hover:text-gray-900 font-medium flex items-center justify-center gap-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para Login
          </button>

        </div>

        {/* Informação Adicional */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            O código expira em <span className="font-semibold text-gray-900">24 horas</span>
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Verifique sua caixa de spam se não encontrar o email
          </p>
        </div>
      </div>
    </div>
  );
}
