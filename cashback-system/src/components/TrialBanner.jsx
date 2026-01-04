import { useState, useEffect } from 'react';
import { Clock, CreditCard, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

export default function TrialBanner({ merchantId }) {
  const [trialInfo, setTrialInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState(false);

  useEffect(() => {
    if (merchantId) {
      loadTrialInfo();
    }
  }, [merchantId]);

  async function loadTrialInfo() {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/api/merchants/${merchantId}/subscription-status`);
      const data = await response.json();
      
      setTrialInfo(data);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao carregar informações de trial:', error);
      setLoading(false);
    }
  }

  async function handleSubscribe() {
    setCheckingOut(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/api/stripe/create-checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ merchantId })
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Redirecionar para Stripe Checkout
        window.location.href = data.checkoutUrl;
      } else {
        toast.error('Erro ao criar checkout: ' + data.error);
        setCheckingOut(false);
      }
    } catch (error) {
      console.error('Erro ao criar checkout:', error);
      toast.error('Erro ao processar pagamento');
      setCheckingOut(false);
    }
  }

  if (loading) return null;
  if (!trialInfo) return null;

  // ✅ Assinatura ativa
  if (trialInfo.status === 'active') {
    return (
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-4 rounded-lg shadow-lg mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6" />
            <div>
              <p className="font-semibold">Assinatura Ativa</p>
              {trialInfo.nextBillingDate && (
                <p className="text-sm opacity-90">
                  Próxima cobrança: {new Date(trialInfo.nextBillingDate).toLocaleDateString('pt-BR')}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ⏰ Trial ativo
  if (trialInfo.status === 'trial' && trialInfo.trialDaysRemaining > 0) {
    const isUrgent = trialInfo.trialDaysRemaining <= 4;
    
    return (
      <div className={`${isUrgent ? 'bg-gradient-to-r from-orange-500 to-red-500 animate-pulse' : 'bg-gradient-to-r from-primary-500 to-primary-700'} text-white p-4 rounded-lg shadow-lg mb-6`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Clock className="w-6 h-6 flex-shrink-0" />
            <div>
              <p className="font-semibold text-lg">
                {isUrgent ? '⚠️ ' : ''}Trial: {trialInfo.trialDaysRemaining} dias restantes
              </p>
              <p className="text-sm opacity-90">
                Seu trial expira em {new Date(trialInfo.trialEndDate).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>
          <button
            onClick={handleSubscribe}
            disabled={checkingOut}
            className="bg-white text-primary-700 font-semibold px-6 py-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {checkingOut ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-700"></div>
                Processando...
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4" />
                Assinar Agora
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  // ❌ Trial expirado ou cancelado
  if (trialInfo.status === 'expired' || trialInfo.status === 'cancelled') {
    return (
      <div className="bg-gradient-to-r from-red-500 to-red-700 text-white p-4 rounded-lg shadow-lg mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="text-3xl">🔒</div>
            <div>
              <p className="font-semibold text-lg">Trial Expirado</p>
              <p className="text-sm opacity-90">
                Assine agora para continuar usando o Local CashBack
              </p>
            </div>
          </div>
          <button
            onClick={handleSubscribe}
            disabled={checkingOut}
            className="bg-white text-red-700 font-semibold px-6 py-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {checkingOut ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-700"></div>
                Processando...
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4" />
                Assinar Agora
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  return null;
}
