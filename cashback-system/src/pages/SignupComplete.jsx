import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Store, Phone, MapPin, User } from 'lucide-react';
import { getLogo, getBrandName } from '../config/branding';
import toast from 'react-hot-toast';

export default function SignupComplete() {
  const navigate = useNavigate();
  const location = useLocation();
  const { email = '', name = '' } = location.state || {};

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    ownerName: name,
    merchantName: '',
    merchantPhone: '',
    merchantAddress: '',
  });

  if (!email) {
    // If someone lands here without state, redirect to signup
    navigate('/signup');
    return null;
  }

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/signup/oauth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, ownerEmail: email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao finalizar cadastro');
      toast.success('Cadastro concluído! Escolha seu plano.');
      navigate('/plans');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <img
            src={getLogo('icon')}
            alt={getBrandName()}
            className="w-16 h-16 mx-auto mb-4 object-contain"
          />
          <h1 className="text-2xl font-bold text-gray-900">Complete seu Cadastro</h1>
          <p className="text-gray-500 mt-1">Só mais alguns dados do seu estabelecimento</p>
          <div className="mt-3 px-4 py-2 bg-green-50 border border-green-200 rounded-lg inline-flex items-center gap-2">
            <svg className="w-4 h-4 text-green-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-sm text-green-700 font-medium">{email}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nome do proprietário */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Seu nome completo *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                name="ownerName"
                value={formData.ownerName}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Seu nome completo"
              />
            </div>
          </div>

          {/* Nome do estabelecimento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome do Estabelecimento *
            </label>
            <div className="relative">
              <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                name="merchantName"
                value={formData.merchantName}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Ex: Padaria do João"
              />
            </div>
          </div>

          {/* Telefone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Telefone *
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                name="merchantPhone"
                value={formData.merchantPhone}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="(11) 99999-9999"
              />
            </div>
          </div>

          {/* Endereço */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Endereço *
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                name="merchantAddress"
                value={formData.merchantAddress}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Rua, número, bairro, cidade"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors mt-6"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Processando...
              </>
            ) : (
              'Continuar para Escolha de Plano →'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
