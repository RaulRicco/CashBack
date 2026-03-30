import { useState, useCallback } from 'react';
// Importação do supabase removida daqui se não for usada em outro lugar deste arquivo

export function useSignup() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [formData, setFormData] = useState({
    merchantName: '',
    merchantPhone: '',
    merchantAddress: '',
    ownerName: '',
    ownerEmail: '',
    ownerPassword: '',
    ownerPasswordConfirm: '',
  });

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const toggleShowPassword = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  const toggleShowPasswordConfirm = useCallback(() => {
    setShowPasswordConfirm(prev => !prev);
  }, []);

  const submit = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Validações iniciais
      if (formData.ownerPassword !== formData.ownerPasswordConfirm) {
        return { success: false, error: 'As senhas não coincidem' };
      }
      if (formData.ownerPassword.length < 6) {
        return { success: false, error: 'A senha deve ter no mínimo 6 caracteres' };
      }

      // 2. Chamada ÚNICA para sua API (ela fará o trabalho no Supabase)
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao processar cadastro no servidor');
      }

      // 3. Sucesso! O servidor já cuidou do Merchant, Auth e Email.
      // Redireciona para planos com dados do merchant recém-criado.
      return { 
        success: true, 
        message: 'Conta criada com sucesso! Escolha seu plano para continuar.', 
        next: {
          type: 'plans',
          merchant: {
            id: result.merchantId,
            email: formData.ownerEmail,
          },
        },
      };

    } catch (error) {
      // Captura erros de rede ou duplicidade de email
      if (error.message.includes('23505') || error.message.includes('cadastrado')) {
        return { success: false, error: 'Este email já está cadastrado' };
      }
      return { success: false, error: error.message || 'Erro ao criar conta. Tente novamente.' };
    } finally {
      setLoading(false);
    }
  }, [formData]);

  const handleSubmit = useCallback(async (e) => {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    return await submit();
  }, [submit]);

  return {
    loading,
    showPassword,
    showPasswordConfirm,
    toggleShowPassword,
    toggleShowPasswordConfirm,
    formData,
    handleChange,
    submit,
    handleSubmit,
  };
}
