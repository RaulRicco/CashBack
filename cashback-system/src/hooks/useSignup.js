import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

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
      if (formData.ownerPassword !== formData.ownerPasswordConfirm) {
        return { success: false, error: 'As senhas não coincidem' };
      }
      if (formData.ownerPassword.length < 6) {
        return { success: false, error: 'A senha deve ter no mínimo 6 caracteres' };
      }

      const { data: merchantData, error: merchantError } = await supabase
        .from('merchants')
        .insert({
          name: formData.merchantName,
          phone: formData.merchantPhone,
          cashback_percentage: 5,
        })
        .select()
        .single();
      if (merchantError) throw merchantError;

      // 2. Criar usuário proprietário no Supabase Auth
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: formData.ownerEmail,
        password: formData.ownerPassword,
        options: {
          data: { merchant_id: merchantData.id, name: formData.ownerName }
        }
      });
      if (signUpError) throw signUpError;

      // 3. Criar registro do employee (sem armazenar senha)
      const { data: employeeData, error: employeeError } = await supabase
        .from('employees')
        .insert({
          merchant_id: merchantData.id,
          name: formData.ownerName,
          email: formData.ownerEmail,
          role: 'owner',
          email_verified: false,
        })
        .select()
        .single();
      if (employeeError) throw employeeError;

      const { sendVerificationCode } = await import('../lib/emailVerification');
      const verificationResult = await sendVerificationCode({
        email: formData.ownerEmail,
        employeeId: employeeData.id,
        userName: formData.ownerName,
      });

      if (verificationResult.success) {
        return { success: true, message: 'Conta criada! Verifique seu email para ativar.', next: { type: 'verify-email' } };
      } else {
        return { success: true, message: 'Conta criada, mas houve erro ao enviar email de verificação.', next: { type: 'login' } };
      }
    } catch (error) {
      if (error?.code === '23505') {
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
