import { useEffect, useMemo } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, CreditCard, ShieldCheck } from 'lucide-react';
import { getBrandName, getLogo } from '../config/branding';

const PRICING_TABLES = {
  launch: {
    planName: 'Lançamento',
    pricingTableId: 'prctbl_1TKQA9Aev6mInEFVj5MVuWLO',
    publishableKey: 'pk_live_51RmMzGAev6mInEFVArxPyBs49G4oSpwOdJDbzaMmPUUsyPRRlKDOF40bxzKYQ9zrpoP7sZo5HTujy4COt8c03wnE00n6XIFINI',
  },
  starter: {
    planName: 'Starter',
    pricingTableId: 'prctbl_1TKQFeAev6mInEFVrusJAS8p',
    publishableKey: 'pk_live_51RmMzGAev6mInEFVArxPyBs49G4oSpwOdJDbzaMmPUUsyPRRlKDOF40bxzKYQ9zrpoP7sZo5HTujy4COt8c03wnE00n6XIFINI',
  },
  business: {
    planName: 'Business',
    pricingTableId: 'prctbl_1TKQI8Aev6mInEFVqFRA25KG',
    publishableKey: 'pk_live_51RmMzGAev6mInEFVArxPyBs49G4oSpwOdJDbzaMmPUUsyPRRlKDOF40bxzKYQ9zrpoP7sZo5HTujy4COt8c03wnE00n6XIFINI',
  },
  premium: {
    planName: 'Premium',
    pricingTableId: 'prctbl_1TKQJQAev6mInEFV1VgFDeLQ',
    publishableKey: 'pk_live_51RmMzGAev6mInEFVArxPyBs49G4oSpwOdJDbzaMmPUUsyPRRlKDOF40bxzKYQ9zrpoP7sZo5HTujy4COt8c03wnE00n6XIFINI',
  },
};

export default function StripePlanCheckout() {
  const navigate = useNavigate();
  const { planId } = useParams();
  const [searchParams] = useSearchParams();
  const normalizedPlanId = String(planId || '').toLowerCase();
  const selectedPlan = PRICING_TABLES[normalizedPlanId];
  const customerEmail = searchParams.get('email') || '';

  useEffect(() => {
    if (!selectedPlan) {
      navigate('/plans', { replace: true });
      return;
    }

    const existingScript = document.querySelector('script[src="https://js.stripe.com/v3/pricing-table.js"]');
    if (existingScript) {
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://js.stripe.com/v3/pricing-table.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [navigate, selectedPlan]);

  const checkoutHint = useMemo(() => {
    if (!customerEmail) {
      return 'Use no checkout o mesmo email que você vai informar no cadastro.';
    }

    return `O checkout sera preenchido para ${customerEmail}. Use este mesmo email no cadastro.`;
  }, [customerEmail]);

  if (!selectedPlan) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.18),_transparent_35%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)]">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <img src={getLogo('icon')} alt={getBrandName()} className="w-12 h-12 object-contain" />
            <div>
              <p className="text-sm uppercase tracking-[0.18em] text-gray-500">Checkout Stripe</p>
              <h1 className="text-2xl font-bold text-gray-900">{selectedPlan.planName}</h1>
            </div>
          </div>

          <button
            onClick={() => navigate('/plans')}
            className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white/80 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm backdrop-blur hover:bg-white"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar aos planos
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] items-start">
          <div className="rounded-[28px] border border-white/80 bg-white/90 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur">
            <div className="flex items-center gap-3 text-emerald-700 mb-4">
              <CreditCard className="w-5 h-5" />
              <p className="font-semibold">Primeiro passo: concluir o checkout no Stripe</p>
            </div>

            <p className="text-sm text-gray-600 mb-6">
              O Stripe vai coletar os dados de pagamento, controlar os 14 dias de teste e iniciar a recorrencia automaticamente no 15º dia se a assinatura nao for cancelada.
            </p>

            <div className="rounded-3xl border border-gray-200 bg-white p-4 shadow-inner">
              <stripe-pricing-table
                pricing-table-id={selectedPlan.pricingTableId}
                publishable-key={selectedPlan.publishableKey}
                customer-email={customerEmail || undefined}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-[28px] bg-slate-900 p-6 text-white shadow-[0_24px_80px_rgba(15,23,42,0.18)]">
              <div className="flex items-center gap-3 mb-4 text-emerald-300">
                <ShieldCheck className="w-5 h-5" />
                <p className="font-semibold">Como o novo fluxo funciona</p>
              </div>

              <ol className="space-y-3 text-sm text-slate-200 list-decimal list-inside">
                <li>Você conclui o checkout do plano no Stripe.</li>
                <li>Depois volta para o cadastro do estabelecimento.</li>
                <li>Usa o mesmo email do checkout para criar a conta.</li>
                <li>O acesso só é liberado quando a assinatura Stripe é encontrada para esse email.</li>
              </ol>
            </div>

            <div className="rounded-[28px] border border-emerald-200 bg-emerald-50 p-6 text-emerald-900 shadow-sm">
              <p className="text-sm font-semibold mb-2">Importante</p>
              <p className="text-sm leading-6">{checkoutHint}</p>
            </div>

            <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm">
              <p className="text-sm text-gray-600 mb-4">
                Quando o checkout terminar, finalize o cadastro aqui.
              </p>
              <Link
                to="/signup"
                className="inline-flex w-full items-center justify-center rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                Continuar para o cadastro
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}