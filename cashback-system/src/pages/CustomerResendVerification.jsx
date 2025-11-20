import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { sendVerificationEmail } from '../lib/resend';
import toast from 'react-hot-toast';
import { Mail, ArrowLeft, Send, Store, CheckCircle } from 'lucide-react';
import { BRAND_CONFIG } from '../config/branding';

export default function CustomerResendVerification() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [merchant, setMerchant] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    loadData();
  }, [slug]);

  const loadData = async () => {
    try {
      // Carregar merchant
      const { data: merchantData, error: merchantError } = await supabase
        .from('merchants')
        .select('*')
        .eq('signup_link_slug', slug)
        .eq('active', true)
        .single();

      if (merchantError) throw merchantError;
      if (!merchantData) {
        toast.error('Link de acesso inválido');
        return;
      }

      setMerchant(merchantData);

      // Se tiver phone no query param, buscar cliente
      const phone = searchParams.get('phone');
      if (phone) {
        const { data: customerData } = await supabase
          .from('customers')
          .select('id, name, email, email_verified, phone')
          .eq('phone', phone.replace(/\D/g, ''))
          .eq('referred_by_merchant_id', merchantData.id)
          .single();

        if (customerData) {
          setCustomer(customerData);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar informações');
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!customer || !customer.email) {
      toast.error('Email não encontrado');
      return;
    }

    setSubmitting(true);

    try {
      // Gerar novo token de verificação
      const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24); // Expira em 24 horas

      // Deletar tokens antigos deste email
      await supabase
        .from('email_verifications')
        .delete()
        .eq('email', customer.email)
        .eq('user_type', 'customer');

      // Criar novo token
      const { error: tokenError } = await supabase
        .from('email_verifications')
        .insert({
          email: customer.email,
          token: token,
          user_type: 'customer',
          user_id: customer.id,
          expires_at: expiresAt.toISOString(),
          verified: false,
        });

      if (tokenError) {
        console.error('Erro ao criar token:', tokenError);
        throw new Error('Erro ao gerar token de verificação');
      }

      // Enviar email
      const verificationUrl = `${window.location.origin}/verify-email/${token}`;
      
      const emailResult = await sendVerificationEmail({
        email: customer.email,
        userName: customer.name,
        verificationUrl: verificationUrl,
        merchantName: merchant.name,
      });

      if (!emailResult.success) {
        throw new Error('Erro ao enviar email');
      }

      setEmailSent(true);
      toast.success('Email de verificação reenviado com sucesso!');

    } catch (error) {
      console.error('Erro ao reenviar verificação:', error);
      toast.error('Erro ao reenviar email. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!merchant || !customer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Store className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Dados não encontrados</h2>
          <p className="text-gray-600 mb-6">
            Não foi possível localizar seus dados. Por favor, entre em contato com o estabelecimento.
          </p>
          <button
            onClick={() => navigate(`/customer/login/${slug}`)}
            className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
          >
            Voltar para Login
          </button>
        </div>
      </div>
    );
  }

  if (emailSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          {/* Logo do Estabelecimento */}
          <div className="text-center mb-8">
            {merchant.logo_url ? (
              <img 
                src={merchant.logo_url} 
                alt={merchant.name}
                className="h-24 w-auto mx-auto mb-4"
              />
            ) : (
              <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Store className="w-12 h-12 text-white" />
              </div>
            )}
          </div>

          {/* Sucesso */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Email Reenviado!
            </h1>
            <p className="text-gray-600 mb-2">
              Enviamos um novo email de verificação para:
            </p>
            <p className="text-primary-600 font-semibold mb-4">
              {customer.email}
            </p>
            <p className="text-sm text-gray-500">
              Verifique sua caixa de entrada e spam. O link expira em 24 horas.
            </p>
          </div>

          {/* Botões */}
          <div className="space-y-3">
            <button
              onClick={() => navigate(`/customer/login/${slug}`)}
              className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
            >
              Voltar para Login
            </button>
            
            <button
              onClick={() => setEmailSent(false)}
              className="w-full border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Reenviar Novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        {/* Botão Voltar */}
        <button
          onClick={() => navigate(`/customer/login/${slug}`)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Voltar para login</span>
        </button>

        {/* Logo do Estabelecimento */}
        <div className="text-center mb-8">
          {merchant.logo_url ? (
            <img 
              src={merchant.logo_url} 
              alt={merchant.name}
              className="h-24 w-auto mx-auto mb-4"
            />
          ) : (
            <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Store className="w-12 h-12 text-white" />
            </div>
          )}
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Verificar Email
          </h1>
          <p className="text-gray-600">
            {merchant.name}
          </p>
        </div>

        {/* Informações */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex gap-3">
            <Mail className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-blue-900 mb-2">
                <strong>Olá, {customer.name}!</strong>
              </p>
              <p className="text-sm text-blue-800">
                Você precisa verificar seu email <strong>{customer.email}</strong> antes de fazer login.
              </p>
            </div>
          </div>
        </div>

        {/* Botão Reenviar */}
        <button
          onClick={handleResendVerification}
          disabled={submitting}
          className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3 rounded-lg font-semibold hover:from-primary-700 hover:to-primary-800 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 shadow-lg shadow-primary-500/50 mb-4"
        >
          {submitting ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Enviando...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Reenviar Email de Verificação
            </>
          )}
        </button>

        {/* Dicas */}
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm font-medium text-gray-900 mb-2">
            💡 Dicas:
          </p>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Verifique a pasta de spam</li>
            <li>• O link de verificação expira em 24 horas</li>
            <li>• Se não receber, clique em "Reenviar"</li>
          </ul>
        </div>

        {/* Powered by */}
        <div className="mt-6 pt-6 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-500">
            Powered by <span className="font-semibold">{BRAND_CONFIG.name}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
