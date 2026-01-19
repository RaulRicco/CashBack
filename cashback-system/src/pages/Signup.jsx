import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Store, User, Mail, Lock, Phone, MapPin, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { BRAND_CONFIG, getLogo, getBrandName } from '../config/branding';
import { useSignup } from '../hooks/useSignup';

export default function Signup() {
  const navigate = useNavigate();
  const { loading, showPassword, showPasswordConfirm, toggleShowPassword, toggleShowPasswordConfirm, formData, handleChange, handleSubmit } = useSignup();

  const onSubmit = async (e) => {
    const result = await handleSubmit(e);
    if (result.success) {
      toast.success(result.message);
      if (result.next?.type === 'verify-email') {
        setTimeout(() => {
          navigate('/verify-email');
        }, 2000);
      } else {
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } else {
      toast.error(result.error || 'Erro ao criar conta. Tente novamente.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-8">
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
            Criar Conta
          </h1>
          <p className="text-gray-600">
            Cadastre seu estabelecimento e comece a fidelizar clientes
          </p>
        </div>

        {/* Formulário */}
        <form onSubmit={onSubmit} className="space-y-6">
          {/* Seção: Dados do Estabelecimento */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
              <Store className="w-5 h-5 text-primary-600" />
              <h2 className="text-lg font-semibold text-gray-900">
                Dados do Estabelecimento
              </h2>
            </div>

            {/* Nome do estabelecimento */}
            <div>
              <label htmlFor="merchantName" className="block text-sm font-medium text-gray-700 mb-2">
                Nome do Estabelecimento *
              </label>
              <input
                id="merchantName"
                name="merchantName"
                type="text"
                value={formData.merchantName}
                onChange={handleChange}
                required
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Ex: Padaria do João"
              />
            </div>

            {/* Telefone */}
            <div>
              <label htmlFor="merchantPhone" className="block text-sm font-medium text-gray-700 mb-2">
                Telefone *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="merchantPhone"
                  name="merchantPhone"
                  type="tel"
                  value={formData.merchantPhone}
                  onChange={handleChange}
                  required
                  className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>

            {/* Endereço */}
            <div>
              <label htmlFor="merchantAddress" className="block text-sm font-medium text-gray-700 mb-2">
                Endereço *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="merchantAddress"
                  name="merchantAddress"
                  type="text"
                  value={formData.merchantAddress}
                  onChange={handleChange}
                  required
                  className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Rua, número, bairro, cidade"
                />
              </div>
            </div>
          </div>

          {/* Seção: Dados do Proprietário */}
          <div className="space-y-4 pt-4">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
              <User className="w-5 h-5 text-primary-600" />
              <h2 className="text-lg font-semibold text-gray-900">
                Seus Dados (Proprietário)
              </h2>
            </div>

            {/* Nome do proprietário */}
            <div>
              <label htmlFor="ownerName" className="block text-sm font-medium text-gray-700 mb-2">
                Seu Nome Completo *
              </label>
              <input
                id="ownerName"
                name="ownerName"
                type="text"
                value={formData.ownerName}
                onChange={handleChange}
                required
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Seu nome completo"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="ownerEmail" className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="ownerEmail"
                  name="ownerEmail"
                  type="email"
                  value={formData.ownerEmail}
                  onChange={handleChange}
                  required
                  className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            {/* Senha */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="ownerPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Senha *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="ownerPassword"
                    name="ownerPassword"
                    type={showPassword ? "text" : "password"}
                    value={formData.ownerPassword}
                    onChange={handleChange}
                    required
                    minLength={6}
                    className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Mínimo 6 caracteres"
                  />
                  <button
                    type="button"
                    onClick={toggleShowPassword}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="ownerPasswordConfirm" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmar Senha *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="ownerPasswordConfirm"
                    name="ownerPasswordConfirm"
                    type={showPasswordConfirm ? "text" : "password"}
                    value={formData.ownerPasswordConfirm}
                    onChange={handleChange}
                    required
                    minLength={6}
                    className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Repita a senha"
                  />
                  <button
                    type="button"
                    onClick={toggleShowPasswordConfirm}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showPasswordConfirm ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Botões */}
          <div className="flex flex-col gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Criando conta...
                </>
              ) : (
                <>
                  <Store className="w-5 h-5" />
                  Criar Conta Grátis
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => navigate('/login')}
              className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Voltar para Login
            </button>
          </div>
        </form>

        {/* Info adicional */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Ao criar uma conta, você concorda com nossos Termos de Uso e Política de Privacidade
          </p>
        </div>
      </div>
    </div>
  );
}
