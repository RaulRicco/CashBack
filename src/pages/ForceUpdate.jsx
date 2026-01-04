import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function ForceUpdate() {
  const navigate = useNavigate();
  const logout = useAuthStore(state => state.logout);

  useEffect(() => {
    // Limpar tudo
    localStorage.clear();
    sessionStorage.clear();
    
    // Fazer logout
    logout();
    
    // Aguardar um pouco e redirecionar
    setTimeout(() => {
      alert('Cache limpo com sucesso! Faça login novamente.');
      navigate('/login');
    }, 1000);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Limpando Cache...</h2>
        <p className="text-gray-600">
          Aguarde enquanto limpamos os dados antigos.
        </p>
      </div>
    </div>
  );
}
