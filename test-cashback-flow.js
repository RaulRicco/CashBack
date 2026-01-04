// Script de teste rápido do fluxo de cashback
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

console.log('🔍 Testando fluxo de cashback...');
console.log('Supabase URL:', supabaseUrl);

// Verificar se variáveis de ambiente estão configuradas
if (!supabaseUrl || supabaseUrl.includes('your-project')) {
  console.error('❌ ERRO: Variáveis de ambiente do Supabase não configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testCashbackFlow() {
  try {
    // 1. Verificar conexão com banco
    console.log('\n1️⃣ Testando conexão com banco...');
    const { data: merchants, error: merchantError } = await supabase
      .from('merchants')
      .select('*')
      .limit(1);
    
    if (merchantError) {
      console.error('❌ Erro ao conectar:', merchantError);
      return;
    }
    console.log('✅ Conexão OK');

    // 2. Buscar um cliente de teste
    console.log('\n2️⃣ Buscando clientes...');
    const { data: customers, error: customerError } = await supabase
      .from('customers')
      .select('*')
      .limit(5);
    
    if (customerError) {
      console.error('❌ Erro ao buscar clientes:', customerError);
      return;
    }
    console.log(`✅ Encontrados ${customers?.length || 0} clientes`);
    if (customers && customers.length > 0) {
      console.log('Cliente exemplo:', {
        phone: customers[0].phone,
        available_cashback: customers[0].available_cashback,
        total_cashback: customers[0].total_cashback
      });
    }

    // 3. Verificar transações recentes
    console.log('\n3️⃣ Verificando transações recentes...');
    const { data: transactions, error: txError } = await supabase
      .from('transactions')
      .select('*, customer:customers(phone), merchant:merchants(name)')
      .eq('transaction_type', 'cashback')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (txError) {
      console.error('❌ Erro ao buscar transações:', txError);
      return;
    }
    console.log(`✅ Encontradas ${transactions?.length || 0} transações`);
    if (transactions && transactions.length > 0) {
      transactions.forEach((tx, i) => {
        console.log(`\nTransação ${i + 1}:`, {
          phone: tx.customer?.phone,
          amount: tx.amount,
          cashback_amount: tx.cashback_amount,
          status: tx.status,
          qr_scanned: tx.qr_scanned,
          created_at: tx.created_at
        });
      });
    }

    // 4. Verificar estrutura da tabela customers
    console.log('\n4️⃣ Verificando estrutura da tabela customers...');
    const { data: customerFields } = await supabase
      .from('customers')
      .select('*')
      .limit(1);
    
    if (customerFields && customerFields.length > 0) {
      console.log('Campos disponíveis:', Object.keys(customerFields[0]));
    }

  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
}

testCashbackFlow();
