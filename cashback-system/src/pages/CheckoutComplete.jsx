import { Link } from 'react-router-dom';
import { CircleCheckBig, ArrowRight, ShieldCheck } from 'lucide-react';
import { getBrandName, getLogo } from '../config/branding';

export default function CheckoutComplete() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.16),_transparent_32%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl rounded-[32px] border border-white/80 bg-white/90 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.10)] backdrop-blur">
        <div className="text-center mb-8">
          <img src={getLogo('icon')} alt={getBrandName()} className="w-16 h-16 object-contain mx-auto mb-4" />
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700 mb-4">
            <CircleCheckBig className="w-4 h-4" />
            Checkout concluído
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Pagamento confirmado no Stripe</h1>
          <p className="text-gray-600 text-lg">
            Agora finalize o cadastro do estabelecimento usando exatamente o mesmo email informado no checkout.
          </p>
        </div>

        <div className="rounded-3xl bg-slate-900 p-6 text-white mb-6">
          <div className="flex items-center gap-2 mb-3 text-emerald-300">
            <ShieldCheck className="w-5 h-5" />
            <span className="font-semibold">Próximos passos</span>
          </div>
          <ol className="list-decimal list-inside space-y-2 text-sm text-slate-200">
            <li>Clique em continuar para abrir o cadastro.</li>
            <li>Preencha os dados do estabelecimento.</li>
            <li>Use o mesmo email do checkout Stripe.</li>
            <li>Depois do cadastro, o acesso será liberado de acordo com a assinatura e o trial controlados pelo Stripe.</li>
          </ol>
        </div>

        <Link
          to="/signup"
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-4 text-base font-semibold text-white transition hover:bg-emerald-700"
        >
          Continuar para o cadastro
          <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    </div>
  );
}