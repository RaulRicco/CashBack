import { useState, useCallback } from 'react';
import { requestPasswordReset } from '../lib/passwordReset';

export function useForgotPassword() {
  const [email, setEmail] = useState('');
  const [userType, setUserType] = useState('merchant');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const selectMerchant = useCallback(() => setUserType('merchant'), []);
  const selectCustomer = useCallback(() => setUserType('customer'), []);

  const submit = useCallback(async () => {
    if (!email) {
      return { success: false, error: 'Por favor, digite seu email' };
    }
    setLoading(true);
    try {
      const result = await requestPasswordReset(email, userType);
      if (result.success) {
        setEmailSent(true);
        return { success: true, message: result.message };
      } else {
        return { success: false, error: result.error || 'Erro ao enviar email' };
      }
    } catch (error) {
      return { success: false, error: 'Erro ao processar solicitação' };
    } finally {
      setLoading(false);
    }
  }, [email, userType]);

  const handleSubmit = useCallback(async (e) => {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    return await submit();
  }, [submit]);

  const resetView = useCallback(() => {
    setEmailSent(false);
    setEmail('');
  }, []);

  return {
    email,
    setEmail,
    userType,
    setUserType,
    selectMerchant,
    selectCustomer,
    loading,
    emailSent,
    submit,
    handleSubmit,
    resetView,
  };
}
