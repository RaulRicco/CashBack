import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { fetchMerchantByEmail } from '../services/authService';

function hasValidSubscriptionAccess(merchant) {
  const status = String(merchant?.subscription_status || '').toLowerCase();
  const trialEndRaw = merchant?.trial_end_date || merchant?.trial_ends_at;

  if (status === 'active') return true;

  if (status === 'trial') {
    if (!trialEndRaw) return true;
    const trialEnd = new Date(trialEndRaw);
    return !Number.isNaN(trialEnd.getTime()) && trialEnd > new Date();
  }

  return false;
}

export default function OAuthCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState('Processando login com Google...');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Supabase auto-detects session from URL hash after OAuth redirect
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error || !session?.user) {
          setStatus('Erro ao autenticar. Redirecionando...');
          setTimeout(() => navigate('/signup'), 2000);
          return;
        }

        const user = session.user;
        const email = user.email;
        const name = user.user_metadata?.full_name || user.user_metadata?.name || '';

        // Check if merchant already exists for this Google account
        const { data: merchants } = await fetchMerchantByEmail(email);
        const merchant = merchants && merchants.length > 0 ? merchants[0] : null;

        if (merchant) {
          if (!hasValidSubscriptionAccess(merchant)) {
            navigate(`/plans?email=${encodeURIComponent(email)}`);
            return;
          }

          await useAuthStore.getState().checkAuth();
          navigate('/dashboard');
        } else {
          // New user - redirect to complete merchant registration
          navigate('/signup/complete', { state: { email, name } });
        }
      } catch (err) {
        console.error('OAuth callback error:', err);
        navigate('/signup');
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 flex items-center justify-center">
      <div className="bg-white rounded-2xl p-10 text-center shadow-2xl">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <p className="text-gray-700 font-medium text-lg">{status}</p>
        <p className="text-gray-400 text-sm mt-2">Aguarde, estamos verificando sua conta...</p>
      </div>
    </div>
  );
}
