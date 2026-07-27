import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Wallet, Gift, History, TrendingUp, Loader, ArrowUpCircle, ArrowDownCircle, Filter, Lock, Store, Mail, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import NotificationPermission from '../components/NotificationPermission';
import OneSignalPrompt from '../components/OneSignalPrompt';
import MerchantSEO from '../components/MerchantSEO';
import { hexToRgba } from '../utils/colorUtils';

const DEFAULT_PRIMARY_COLOR = '#17A589';
const DEFAULT_SECONDARY_COLOR = '#FFA726';

export default function CustomerDashboard() {
  const { phone } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const merchantIdFromUrl = searchParams.get('merchant'); // Pega merchant da URL
  const [loading, setLoading] = useState(true);
  const [accessError, setAccessError] = useState(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [customer, setCustomer] = useState(null);
  const [merchant, setMerchant] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [redemptions, setRedemptions] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all', 'in', 'out'

  useEffect(() => {
    if (phone) {
      // Verificar se já está autenticado no sessionStorage
      const authKey = merchantIdFromUrl ? `customer_auth_${phone}_${merchantIdFromUrl}` : null;
      const isAuth = authKey ? sessionStorage.getItem(authKey) : null;
      
      if (isAuth === 'true') {
        setAuthenticated(true);
        loadCustomerData();
      } else {
        // Carregar merchant mesmo sem estar autenticado (para mostrar logo)
        loadMerchantOnly();
        setLoading(false);
      }
    }
  }, [phone, merchantIdFromUrl]);

  const loadMerchantOnly = async () => {
    try {
      console.log('🔍 Buscando cliente com telefone:', phone, 'e merchant_id:', merchantIdFromUrl);
      
      // Buscar cliente no contexto do merchant informado.
      let query = supabase
        .from('customers')
        .select('referred_by_merchant_id')
        .eq('phone', phone);
      
      if (merchantIdFromUrl) {
        query = query.eq('referred_by_merchant_id', merchantIdFromUrl);
      } else {
        // Sem merchant na URL: evita escolher estabelecimento errado quando existir mais de um cadastro.
        query = query.order('created_at', { ascending: false }).limit(2);
      }
      
      const { data: customerList, error: customerError } = await query;

      const customerData = customerList && customerList.length > 0 ? customerList[0] : null;

      console.log('📞 Resposta da busca do cliente:', { customerData, customerError, merchantFilter: merchantIdFromUrl });

      if (customerError) {
        console.error('❌ Erro ao buscar cliente:', customerError);
        console.error('❌ Erro status:', customerError.code);
        console.error('❌ Erro message:', customerError.message);
        console.error('❌ Erro details:', customerError.details);
        return;
      }

      if (!merchantIdFromUrl && customerList && customerList.length > 1) {
        setAccessError('Encontramos mais de um cadastro para este telefone. Abra pelo link do estabelecimento correto.');
        return;
      }

      if (customerData?.referred_by_merchant_id) {
        console.log('✅ Cliente encontrado, buscando merchant:', customerData.referred_by_merchant_id);
        
        const { data: merchantData } = await supabase
          .from('merchants')
          .select('id, name, cashback_program_name, primary_color, secondary_color, accent_color, logo_url, cashback_percentage')
          .eq('id', customerData.referred_by_merchant_id)
          .single();
        
        if (merchantData) {
          console.log('✅ Merchant encontrado:', merchantData.name);
          setMerchant(merchantData);
          applyMerchantColors(merchantData);
        }
      } else {
        console.warn('⚠️ Cliente sem merchant_id associado');
      }
    } catch (error) {
      console.error('💥 Erro fatal ao carregar merchant:', error);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!password) {
      toast.error('Por favor, digite sua senha');
      return;
    }

    setLoading(true);

    try {
      console.log('🔐 Tentando fazer login com telefone:', phone, 'e merchant_id:', merchantIdFromUrl);
      
      // Buscar cliente no contexto do merchant informado.
      let query = supabase
        .from('customers')
        .select('id, password_hash, referred_by_merchant_id')
        .eq('phone', phone);
      
      if (merchantIdFromUrl) {
        query = query.eq('referred_by_merchant_id', merchantIdFromUrl);
      } else {
        // Sem merchant na URL: evita escolher estabelecimento errado quando existir mais de um cadastro.
        query = query.order('created_at', { ascending: false }).limit(2);
      }
      
      const { data: customerList, error: customerError } = await query;

      const customerData = customerList && customerList.length > 0 ? customerList[0] : null;

      console.log('🔐 Resposta do login:', { customerData, customerError, merchantFilter: merchantIdFromUrl });

      if (customerError) {
        console.error('❌ Erro no login:', customerError);
        console.error('❌ Erro code:', customerError.code);
        console.error('❌ Erro message:', customerError.message);
        console.error('❌ Erro hint:', customerError.hint);
        console.error('❌ Erro details:', customerError.details);
        toast.error(`Erro ao buscar cliente: ${customerError.message || 'Cliente não encontrado'}`);
        setLoading(false);
        return;
      }

      if (!customerData) {
        toast.error('Cliente não encontrado');
        setLoading(false);
        return;
      }

      if (!merchantIdFromUrl && customerList && customerList.length > 1) {
        toast.error('Encontramos mais de um cadastro para este telefone. Use o link do estabelecimento.');
        setLoading(false);
        return;
      }

      console.log('✅ Cliente encontrado, verificando senha...');

      // Verificar senha (usando btoa para decode simples)
      const passwordHash = btoa(password);
      
      if (customerData.password_hash !== passwordHash) {
        toast.error('Senha incorreta');
        setLoading(false);
        return;
      }

      // Autenticado com sucesso
      const authKey = `customer_auth_${phone}_${customerData.referred_by_merchant_id}`;
      sessionStorage.setItem(authKey, 'true');
      setAuthenticated(true);
      toast.success('Login realizado com sucesso!');
      loadCustomerData();
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      toast.error('Erro ao fazer login. Tente novamente.');
      setLoading(false);
    }
  };

  const applyMerchantColors = (merchantData) => {
    if (merchantData.primary_color) {
      console.log('🎨 Aplicando cores do merchant:', merchantData.primary_color);
      const primaryColor = merchantData.primary_color;
      
      document.documentElement.style.setProperty('--color-primary', primaryColor);
      document.documentElement.style.setProperty('--color-primary-50', primaryColor + '10');
      document.documentElement.style.setProperty('--color-primary-100', primaryColor + '30');
      document.documentElement.style.setProperty('--color-primary-500', primaryColor);
      document.documentElement.style.setProperty('--color-primary-600', primaryColor);
      document.documentElement.style.setProperty('--color-primary-700', shadeColor(primaryColor, -20));
      document.documentElement.style.setProperty('--color-primary-800', shadeColor(primaryColor, -30));
      document.documentElement.style.setProperty('--color-primary-900', shadeColor(primaryColor, -40));
      
      console.log('✅ Cores aplicadas com sucesso!');
    } else {
      console.log('⚠️ Merchant sem cor personalizada, usando padrão');
    }
  };

  const shadeColor = (color, percent) => {
    const num = parseInt(color.replace("#",""), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return "#" + (0x1000000 + (R<255?R<1?0:R:255)*0x10000 + (G<255?G<1?0:G:255)*0x100 + (B<255?B<1?0:B:255)).toString(16).slice(1);
  };

  const loadCustomerData = async () => {
    try {
      setLoading(true);

      console.log('📂 Carregando dados do cliente com telefone:', phone, 'e merchant_id:', merchantIdFromUrl);

      // Buscar cliente no contexto do merchant informado.
      let query = supabase
        .from('customers')
        .select('*')
        .eq('phone', phone);
      
      if (merchantIdFromUrl) {
        query = query.eq('referred_by_merchant_id', merchantIdFromUrl);
      } else {
        // Sem merchant na URL: evita escolher estabelecimento errado quando existir mais de um cadastro.
        query = query.order('created_at', { ascending: false }).limit(2);
      }
      
      const { data: customerList, error: customerError } = await query;

      if (customerError) throw customerError;

      if (!merchantIdFromUrl && customerList && customerList.length > 1) {
        setAccessError('Encontramos mais de um cadastro para este telefone. Abra pelo link do estabelecimento correto.');
        setLoading(false);
        return;
      }

      const customerData = customerList && customerList.length > 0 ? customerList[0] : null;
      
      console.log('📂 Cliente carregado:', { found: !!customerData, merchant_id: customerData?.referred_by_merchant_id });
      
      if (!customerData) {
        throw new Error('Cliente não encontrado');
      }

      console.log('👤 Dados do cliente carregados:', {
        available_cashback: customerData.available_cashback,
        total_cashback: customerData.total_cashback,
        total_spent: customerData.total_spent
      });

      setCustomer(customerData);

      // Buscar transações (entradas de cashback)
      const { data: txData, error: txError } = await supabase
        .from('transactions')
        .select('*, merchant:merchants(name, cashback_program_name)')
        .eq('customer_id', customerData.id)
        .eq('transaction_type', 'cashback')
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(50);

      if (txError) {
        console.error('❌ Erro ao buscar transações:', txError);
      }
      
      console.log('📊 Transações (entradas) encontradas:', txData?.length || 0);
      console.log('📊 Detalhes das transações:', txData);
      setTransactions(txData || []);

      // Pegar o merchant principal (do primeiro transaction ou referred_by_merchant_id)
      let merchantId = customerData.referred_by_merchant_id;
      
      // Se não tiver referred_by, pegar do primeiro transaction
      if (!merchantId && txData && txData.length > 0) {
        merchantId = txData[0].merchant_id;
      }

      if (merchantId) {
        const { data: merchantData } = await supabase
          .from('merchants')
          .select('id, name, cashback_program_name, primary_color, secondary_color, accent_color, logo_url, cashback_percentage')
          .eq('id', merchantId)
          .single();
        
        if (merchantData) {
          setMerchant(merchantData);
          // Aplicar cores do merchant
          applyMerchantColors(merchantData);
        }
      }

      // Buscar resgates
      const { data: redemptionData, error: redemptionError } = await supabase
        .from('redemptions')
        .select('*, merchant:merchants(name)')
        .eq('customer_id', customerData.id)
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(10);

      if (redemptionError) {
        console.error('Erro ao buscar resgates:', redemptionError);
      }
      
      console.log('💰 Resgates (saídas) encontrados:', redemptionData?.length || 0, redemptionData);
      setRedemptions(redemptionData || []);

      setLoading(false);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setLoading(false);
    }
  };

  // Tela de login se não autenticado
  if (!authenticated && !loading) {
    if (accessError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Acesso bloqueado por segurança
            </h1>
            <p className="text-gray-600">
              {accessError}
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          {/* Logo do Merchant (se disponível) */}
          {merchant?.logo_url && (
            <div className="text-center mb-6">
              <img 
                src={merchant.logo_url} 
                alt={merchant.name}
                className="h-20 w-auto mx-auto"
              />
            </div>
          )}
          
          <div className="text-center mb-8">
            {!merchant?.logo_url && (
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-white" />
              </div>
            )}
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Acesso ao Perfil
            </h1>
            <p className="text-gray-600">
              {merchant?.name ? `Digite sua senha para acessar ${merchant.name}` : 'Digite sua senha para acessar'}
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Telefone
              </label>
              <input
                type="text"
                value={phone}
                disabled
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Digite sua senha"
                  required
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3 rounded-lg font-semibold hover:from-primary-700 hover:to-primary-800 transition-all transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg shadow-primary-500/50"
            >
              <Lock className="w-5 h-5" />
              Entrar
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => navigate(merchantIdFromUrl ? `/customer/forgot-password/${phone}?merchant=${merchantIdFromUrl}` : `/customer/forgot-password/${phone}`)}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium hover:underline"
            >
              Esqueceu sua senha?
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader className="w-12 h-12 text-primary-600 animate-spin" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Cliente não encontrado
          </h1>
          <p className="text-gray-600">
            Verifique o número de telefone
          </p>
        </div>
      </div>
    );
  }

  // Criar histórico unificado (entradas + saídas)
  const getUnifiedHistory = () => {
    const history = [];

    // Adicionar entradas (cashback recebido)
    console.log('🔄 Processando transações (entradas):', transactions.length);
    if (transactions.length > 0) {
      transactions.forEach(tx => {
        // Validar se tem os dados necessários
        if (!tx.cashback_amount || parseFloat(tx.cashback_amount) <= 0) {
          console.warn('⚠️ Transação sem cashback_amount:', tx);
          return; // Pula essa transação
        }

        const entry = {
          id: `tx-${tx.id}`,
          type: 'in',
          amount: parseFloat(tx.cashback_amount),
          purchaseAmount: parseFloat(tx.amount || 0),
          percentage: parseFloat(tx.cashback_percentage || 0),
          merchantName: tx.merchant?.name || merchant?.name || 'Estabelecimento',
          date: new Date(tx.created_at),
          description: 'Cashback recebido'
        };
        console.log('  ➕ Entrada adicionada:', entry);
        history.push(entry);
      });
    } else {
      console.warn('⚠️ Nenhuma transação encontrada para processar');
    }

    // Adicionar saídas (resgates)
    console.log('🔄 Processando resgates (saídas):', redemptions.length);
    if (redemptions.length > 0) {
      redemptions.forEach(redemption => {
        const entry = {
          id: `redemption-${redemption.id}`,
          type: 'out',
          amount: parseFloat(redemption.amount || 0),
          merchantName: redemption.merchant?.name || merchant?.name || 'Estabelecimento',
          date: new Date(redemption.created_at),
          description: 'Cashback resgatado'
        };
        console.log('  ➖ Saída adicionada:', entry);
        history.push(entry);
      });
    } else {
      console.log('ℹ️ Nenhum resgate encontrado');
    }

    console.log('📋 Total de itens no histórico:', history.length);

    // Ordenar por data (mais recente primeiro)
    history.sort((a, b) => b.date - a.date);

    // Filtrar por tipo
    if (filter === 'in') {
      const filtered = history.filter(item => item.type === 'in');
      console.log('🔍 Filtrado (entradas):', filtered.length);
      return filtered;
    } else if (filter === 'out') {
      const filtered = history.filter(item => item.type === 'out');
      console.log('🔍 Filtrado (saídas):', filtered.length);
      return filtered;
    }

    console.log('🔍 Mostrando todos:', history.length);
    return history;
  };

  const unifiedHistory = getUnifiedHistory();
  console.log('📊 Histórico final renderizado:', unifiedHistory.length, 'itens');

  return (
    <>
      {/* Meta tags dinâmicas para compartilhamento em redes sociais */}
      <MerchantSEO merchant={merchant} pageType="dashboard" />
      
      <div
        className="min-h-screen"
        style={{
          background: `linear-gradient(to bottom right, ${hexToRgba(merchant?.primary_color || DEFAULT_PRIMARY_COLOR, 0.08)}, #f9fafb, ${hexToRgba(merchant?.secondary_color || DEFAULT_SECONDARY_COLOR, 0.06)})`,
        }}
      >
        {/* Header */}
      <div 
        className="text-white"
        style={{
          background: merchant?.primary_color 
            ? `linear-gradient(to bottom right, ${merchant.primary_color}, ${shadeColor(merchant.primary_color, -20)}, ${shadeColor(merchant.primary_color, -40)})`
            : 'linear-gradient(to bottom right, #059669, #047857, #065f46)'
        }}
      >
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-6">
            {/* Logo do Estabelecimento */}
            {merchant?.logo_url ? (
              <img 
                src={merchant.logo_url} 
                alt={merchant.name}
                className="w-16 h-16 object-contain bg-white rounded-xl p-2"
              />
            ) : (
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <Wallet className="w-8 h-8" />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold">
                {merchant?.cashback_program_name || 'Meu Cashback'}
              </h1>
              <p className="text-white text-opacity-80">
                {merchant?.name || customer.phone}
              </p>
            </div>
          </div>

          {/* Saldo Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20 shadow-lg transition-transform hover:-translate-y-0.5">
              <div className="flex items-center gap-2 mb-2">
                <Gift className="w-5 h-5" />
                <span className="text-sm">Disponível</span>
              </div>
              <p className="text-3xl font-bold">
                R$ {(() => {
                  const value = parseFloat(customer.available_cashback || 0);
                  console.log('💰 Saldo Disponível:', value, 'raw:', customer.available_cashback);
                  return value.toFixed(2);
                })()}
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20 shadow-lg transition-transform hover:-translate-y-0.5">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5" />
                <span className="text-sm">Total Acumulado</span>
              </div>
              <p className="text-3xl font-bold">
                R$ {(() => {
                  const value = parseFloat(customer.total_cashback || 0);
                  console.log('📈 Total Acumulado:', value, 'raw:', customer.total_cashback);
                  return value.toFixed(2);
                })()}
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20 shadow-lg transition-transform hover:-translate-y-0.5">
              <div className="flex items-center gap-2 mb-2">
                <ArrowDownCircle className="w-5 h-5" />
                <span className="text-sm">Total Resgatado</span>
              </div>
              <p className="text-3xl font-bold">
                R$ {(() => {
                  console.log('📊 Redemptions disponíveis:', redemptions.length);
                  console.log('📊 Redemptions data:', redemptions);
                  
                  // Calcular total resgatado somando todos os redemptions
                  const totalRedeemed = redemptions.reduce((sum, redemption) => {
                    const amount = parseFloat(redemption.amount || 0);
                    console.log('  ➖ Resgate:', amount, 'ID:', redemption.id);
                    return sum + amount;
                  }, 0);
                  
                  console.log('💸 Total Resgatado calculado:', totalRedeemed);
                  return totalRedeemed.toFixed(2);
                })()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Histórico Unificado */}
        <div className="card-glass">
          {/* Header com Filtros */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2">
              <History className="w-6 h-6 text-primary-600" />
              <h2 className="text-xl font-bold text-gray-900">
                Histórico de Movimentações
              </h2>
            </div>

            {/* Filtros */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    filter === 'all'
                      ? 'bg-white text-primary-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Todas
                </button>
                <button
                  onClick={() => setFilter('in')}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    filter === 'in'
                      ? 'bg-white text-green-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Entradas
                </button>
                <button
                  onClick={() => setFilter('out')}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    filter === 'out'
                      ? 'bg-white text-orange-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Saídas
                </button>
              </div>
            </div>
          </div>

          {/* Histórico */}
          {unifiedHistory.length === 0 ? (
            <div className="text-center py-12">
              <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium mb-1">
                Nenhuma movimentação ainda
              </p>
              <p className="text-sm text-gray-400">
                {filter === 'in' && 'Nenhum cashback recebido'}
                {filter === 'out' && 'Nenhum resgate realizado'}
                {filter === 'all' && 'Faça sua primeira compra para começar!'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {unifiedHistory.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-center justify-between p-4 rounded-lg transition-all hover:shadow-md ${
                    item.type === 'in'
                      ? 'bg-green-50 border border-green-100 hover:bg-green-100'
                      : 'bg-orange-50 border border-orange-100 hover:bg-orange-100'
                  }`}
                >
                  {/* Lado esquerdo */}
                  <div className="flex items-center gap-4">
                    {/* Ícone */}
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        item.type === 'in'
                          ? 'bg-green-100 text-green-600'
                          : 'bg-orange-100 text-orange-600'
                      }`}
                    >
                      {item.type === 'in' ? (
                        <ArrowDownCircle className="w-6 h-6" />
                      ) : (
                        <ArrowUpCircle className="w-6 h-6" />
                      )}
                    </div>

                    {/* Informações */}
                    <div>
                      <p className="font-semibold text-gray-900">
                        {item.description}
                      </p>
                      <p className="text-sm text-gray-600">
                        {item.merchantName}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {format(item.date, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </p>
                      {item.type === 'in' && item.purchaseAmount && (
                        <p className="text-xs text-gray-500 mt-1">
                          Compra de R$ {item.purchaseAmount.toFixed(2)} • {item.percentage}% cashback
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Lado direito - Valor */}
                  <div className="text-right">
                    <p
                      className={`text-xl font-bold ${
                        item.type === 'in' ? 'text-green-600' : 'text-orange-600'
                      }`}
                    >
                      {item.type === 'in' ? '+' : '-'}R$ {item.amount.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {item.type === 'in' ? 'Recebido' : 'Resgatado'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Resumo do filtro */}
          {unifiedHistory.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  {filter === 'all' && `Total de ${unifiedHistory.length} movimentações`}
                  {filter === 'in' && `Total de ${unifiedHistory.length} entradas`}
                  {filter === 'out' && `Total de ${unifiedHistory.length} saídas`}
                </span>
                {filter !== 'all' && (
                  <button
                    onClick={() => setFilter('all')}
                    className="text-primary-600 hover:text-primary-800 font-medium"
                  >
                    Ver todas
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Dica */}
        <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
          <p className="text-sm text-primary-800 text-center">
            💡 <strong>Dica:</strong> Continue comprando para acumular mais cashback e resgatar quando quiser!
          </p>
        </div>
      </div>

      {/* Solicitação de Permissão de Notificação - OneSignal */}
      {merchant?.id && <OneSignalPrompt merchantId={merchant.id} customerPhone={phone} />}
      
      {/* Fallback: Notificações Locais (se OneSignal não configurado) */}
      {/* <NotificationPermission customerPhone={phone} /> */}
      </div>
    </>
  );
}
