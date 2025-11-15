import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { Phone, ArrowLeft, Key } from 'lucide-react';
import { getLogo, getBrandName } from '../config/branding';

export default function CustomerForgotPassword() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState('');
  const [tokenSent, setTokenSent] = useState(false);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Limpar formatação do telefone
      const phoneClean = phone.replace(/\D/g, '');

      if (phoneClean.length < 10 || phoneClean.length > 11) {
        toast.error('Número de telefone inválido');
        setLoading(false);
        return;
      }

      // Buscar cliente pelo telefone
      const { data: customer, error: findError } = await supabase
        .from('customers')
        .select('id, name, phone')
        .eq('phone', phoneClean)
        .single();

      if (findError || !customer) {
        toast.error('Telefone não encontrado');
        setLoading(false);
        return;
      }

      // Gerar token único (6 dígitos numéricos)
      const token = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Calcular expiração (30 minutos a partir de agora)
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 30);

      // Criar registro de token no banco
      const { error: tokenError } = await supabase
        .from('customer_password_recovery_tokens')
        .insert({
          customer_id: customer.id,
          token: token,
          expires_at: expiresAt.toISOString(),
          used: false
        });

      if (tokenError) {
        console.error('Erro ao criar token:', tokenError);
        throw tokenError;
      }

      // Mostrar token na tela (em produção, enviar por SMS/WhatsApp)
      toast.success(
        `Código de recuperação: ${token}`,
        { duration: 15000 }
      );

      setTokenSent(true);

      // Redirecionar para página de reset após 3 segundos
      setTimeout(() => {
        navigate(`/customer/reset-password?phone=${phoneClean}&token=${token}`);
      }, 3000);

    } catch (error) {
      console.error('Erro ao gerar token:', error);
      toast.error('Erro ao processar solicitação. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

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
            Recuperar Senha
          </h1>
          <p className="text-gray-600">
            {tokenSent 
              ? 'Código gerado com sucesso! Redirecionando...'
              : 'Digite seu telefone para receber o código de recuperação'
            }
          </p>
        </div>

        {!tokenSent ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Telefone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Telefone cadastrado
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={phone}
                  onChange={handlePhoneChange}
                  required
                  className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="(00) 00000-0000"
                />
              </div>
            </div>

            {/* Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Key className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Como funciona:</p>
                  <ol className="list-decimal list-inside space-y-1 text-xs">
                    <li>Digite seu telefone cadastrado</li>
                    <li>Você receberá um código de 6 dígitos</li>
                    <li>Use o código para criar uma nova senha</li>
                    <li>O código expira em 30 minutos</li>
                  </ol>
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
                    Processando...
                  </>
                ) : (
                  <>
                    <Key className="w-5 h-5" />
                    Gerar Código de Recuperação
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
        ) : (
          <div className="text-center space-y-4">
            <div className="animate-pulse">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <Key className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <p className="text-gray-600">
              Redirecionando para redefinição de senha...
            </p>
          </div>
        )}

        {/* Nota de desenvolvimento */}
        {tokenSent && (
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-xs text-yellow-800">
              <strong>Nota:</strong> Em produção, o código será enviado via SMS ou WhatsApp.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
