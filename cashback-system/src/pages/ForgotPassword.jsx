import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Mail, ArrowLeft, Send } from 'lucide-react';
import { BRAND_CONFIG, getLogo, getBrandName } from '../config/branding';
import { useForgotPassword } from '../hooks/useForgotPassword';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { email, setEmail, userType, selectMerchant, selectCustomer, loading, emailSent, handleSubmit, resetView } = useForgotPassword();

  const onSubmit = async (e) => {
    const result = await handleSubmit(e);
    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        
        {/* Botão Voltar */}
        <button
          onClick={() => navigate('/login')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Voltar para login</span>
        </button>

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
            Recuperar Senha
          </h1>
          <p className="text-gray-600 text-sm">
            Digite seu email para receber o código de verificação
          </p>
        </div>

        {/* Mensagem de Sucesso */}
        {emailSent ? (
          <div className="space-y-6">
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Email Enviado!
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Enviamos um link de recuperação para:
              </p>
              <p className="text-primary-600 font-medium mb-4">
                {email}
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
                <p className="text-blue-900 text-xs leading-relaxed">
                  <strong>📧 Próximos passos:</strong>
                  <br />
                  1. Verifique sua caixa de entrada (e spam)
                  <br />
                  2. Clique no link de recuperação no email
                  <br />
                  3. Defina sua nova senha
                  <br /><br />
                  <strong>⏱️ O link expira em 1 hora</strong>
                </p>
              </div>
            </div>

            <button
              onClick={resetView}
              className="w-full flex items-center justify-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </button>
          </div>
        ) : (
          /* Formulário */
          <form onSubmit={onSubmit} className="space-y-6">
            
            {/* Tipo de Usuário */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Tipo de Conta
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={selectMerchant}
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
                  onClick={selectCustomer}
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
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            {/* Botão Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Enviar Código de Verificação
                </>
              )}
            </button>

            {/* Informação de Segurança */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800 text-xs leading-relaxed">
                <strong>🔒 Segurança:</strong> Por motivos de segurança, não informaremos se o email existe em nosso sistema. Se o email estiver cadastrado, você receberá um código de 6 dígitos para recuperação.
              </p>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
