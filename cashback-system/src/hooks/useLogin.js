import { useState, useCallback } from 'react';
import { useAuthStore } from '../store/authStore';

export function useLogin() {
  const login = useAuthStore(state => state.login);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const toggleShowPassword = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  const submit = useCallback(async () => {
    setLoading(true);
    try {
      const result = await login(email, password);
      return result;
    } finally {
      setLoading(false);
    }
  }, [email, password, login]);

  const handleSubmit = useCallback(async (e) => {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    return await submit();
  }, [submit]);

  return {
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    toggleShowPassword,
    loading,
    submit,
    handleSubmit,
  };
}
