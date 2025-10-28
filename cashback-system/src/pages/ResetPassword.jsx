import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { Lock, Key, ArrowLeft, Check } from 'lucide-react';
import { getLogo, getBrandName } from '../config/branding';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    token: searchParams.get('token') || '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    // Se o token vier pela URL, preencher automaticamente
    const urlToken = searchParams.get('token');
    if (urlToken) {
      setFormData(prev => ({ ...prev, token: urlToken }));
    }
  }, [searchParams]);

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
      if (formData.newPassword !== formData.confirmPassword) {
        toast.error('As senhas não coincidem');
        setLoading(false);
        return;
      }

      if (formData.newPassword.length < 6) {
        toast.error('A senha deve ter no mínimo 6 caracteres');
        setLoading(false);
        return;
      }

      if (!formData.token || formData.token.length !== 6) {
        toast.error('Token inválido. Deve ter 6 dígitos');
        setLoading(false);
        return;
      }

      // Buscar token no banco
      const { data: tokenData, error: tokenError } = await supabase
        .from('password_recovery_tokens')
        .select('id, employee_id, expires_at, used')
        .eq('token', formData.token)
        .single();

      if (tokenError || !tokenData) {
        toast.error('Token não encontrado ou inválido');
        setLoading(false);
        return;
      }

      // Verificar se já foi usado
      if (tokenData.used) {
        toast.error('Este token já foi utilizado');
        setLoading(false);
        return;
      }

      // Verificar se expirou
      const now = new Date();
      const expiresAt = new Date(tokenData.expires_at);
      if (now > expiresAt) {
        toast.error('Token expirado. Solicite um novo código');
        setLoading(false);
        return;
      }

      // Atualizar senha do employee
      const { error: updateError } = await supabase
        .from('employees')
        .update({ password: formData.newPassword })
        .eq('id', tokenData.employee_id);

      if (updateError) throw updateError;

      // Marcar token como usado
      await supabase
        .from('password_recovery_tokens')
        .update({ used: true })
        .eq('id', tokenData.id);

      toast.success('Senha alterada com sucesso!');
      
      // Redirecionar para login após 2 segundos
      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (error) {
      console.error('Erro ao redefinir senha:', error);
      toast.error('Erro ao redefinir senha. Tente novamente.');
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
            Redefinir Senha
          </h1>
          <p className="text-gray-600">
            Digite o código recebido e sua nova senha
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Token */}
          <div>
            <label htmlFor="token" className="block text-sm font-medium text-gray-700 mb-2">
              Código de Recuperação *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Key className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="token"
                name="token"
                type="text"
                value={formData.token}
                onChange={handleChange}
                required
                maxLength={6}
                className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-center text-xl tracking-widest font-mono"
                placeholder="000000"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Código de 6 dígitos enviado para seu email
            </p>
          </div>

          {/* Nova Senha */}
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Nova Senha *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                value={formData.newPassword}
                onChange={handleChange}
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
              Confirmar Nova Senha *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                minLength={6}
                className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Repita a nova senha"
              />
            </div>
          </div>

          {/* Info de Segurança */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-green-800">
                <p className="font-medium mb-1">Dicas de segurança:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Use pelo menos 6 caracteres</li>
                  <li>Combine letras e números</li>
                  <li>Evite senhas óbvias (123456, senha123)</li>
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
                  Alterando senha...
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  Alterar Senha
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

          {/* Link para solicitar novo código */}
          <div className="text-center">
            <button
              type="button"
              onClick={() => navigate('/forgot-password')}
              className="text-sm text-primary-600 hover:text-primary-800 font-medium"
            >
              Não recebeu o código? Solicitar novamente
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
