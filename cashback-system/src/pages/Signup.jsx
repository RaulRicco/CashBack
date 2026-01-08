import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { Store, User, Mail, Lock, Phone, MapPin, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { BRAND_CONFIG, getLogo, getBrandName } from '../config/branding';

export default function Signup() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [formData, setFormData] = useState({
    // Dados do estabelecimento
    merchantName: '',
    merchantPhone: '',
    merchantAddress: '',
    
    // Dados do proprietário
    ownerName: '',
    ownerEmail: '',
    ownerPassword: '',
    ownerPasswordConfirm: '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validações
      if (formData.ownerPassword !== formData.ownerPasswordConfirm) {
        toast.error('As senhas não coincidem');
        setLoading(false);
        return;
      }

      if (formData.ownerPassword.length < 6) {
        toast.error('A senha deve ter no mínimo 6 caracteres');
        setLoading(false);
        return;
      }

      // 1. Criar o estabelecimento (merchant)
      // ✅ NOVO: Adicionar trial de 14 dias automaticamente
      const trialStartDate = new Date();
      const trialEndDate = new Date();
      trialEndDate.setDate(trialEndDate.getDate() + 14); // ✅ 14 dias de trial

      const { data: merchantData, error: merchantError } = await supabase
        .from('merchants')
        .insert({
          name: formData.merchantName,
          email: formData.ownerEmail, // ✅ Email obrigatório
          phone: formData.merchantPhone,
          cashback_percentage: 5, // Padrão 5%
          // ✅ Trial de 14 dias
          trial_start_date: trialStartDate.toISOString(),
          trial_end_date: trialEndDate.toISOString(),
          subscription_status: 'trial',
          subscription_plan: 'launch', // ✅ Plano launch (R$ 97)
          customer_limit: 5000, // ✅ Limite de 5 mil clientes
          employee_limit: 10, // ✅ Limite de 10 funcionários
        })
        .select()
        .single();

      if (merchantError) throw merchantError;

      // 2. Criar o usuário proprietário (employee com role owner)
      const { data: employeeData, error: employeeError } = await supabase
        .from('employees')
        .insert({
          merchant_id: merchantData.id,
          name: formData.ownerName,
          email: formData.ownerEmail,
          password: formData.ownerPassword, // Em produção, hash a senha!
          role: 'owner',
        })
        .select()
        .single();

      if (employeeError) throw employeeError;

      // 3. Enviar email de verificação
      const { sendVerificationCode } = await import('../lib/emailVerification');
      const verificationResult = await sendVerificationCode({
        email: formData.ownerEmail,
        employeeId: employeeData.id,
        userName: formData.ownerName,
      });

      if (verificationResult.success) {
        toast.success('🎉 Conta criada! Você tem 14 dias de teste grátis. Verifique seu email.');
        
        // Redirecionar para página de verificação
        setTimeout(() => {
          navigate(`/verify-email?email=${encodeURIComponent(formData.ownerEmail)}`);
        }, 2000);
      } else {
        // Se falhar o envio do email, ainda assim avisar o usuário
        toast.error('Conta criada, mas houve erro ao enviar email de verificação.');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }

    } catch (error) {
      console.error('Erro ao criar conta:', error);
      
      if (error.code === '23505') {
        toast.error('Este email já está cadastrado');
      } else {
        toast.error(error.message || 'Erro ao criar conta. Tente novamente.');
      }
    } finally {
      setLoading(false);
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
            Criar Conta - 14 Dias Grátis
          </h1>
          <p className="text-gray-600">
            Cadastre seu estabelecimento e ganhe 14 dias de teste gratuito!
          </p>
          <p className="text-sm text-primary-600 font-semibold mt-2">
            ✅ Sem cartão de crédito • ✅ Cancele quando quiser
          </p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-6">
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
                    onClick={() => setShowPassword(!showPassword)}
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
                    onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
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
