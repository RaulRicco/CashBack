import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mtylboaluqswdkgljgsd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10eWxib2FsdXFzd2RrZ2xqZ3NkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0Nzc5OTAsImV4cCI6MjA3NzA1Mzk5MH0.heq_wso726i0TJSWTMzIWoD61GXnEWzkFw3Iy06YSqI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testFlow() {
  console.log('🔍 Testando fluxo de cashback...\n');

  // 1. Buscar transações recentes
  console.log('1️⃣ Buscando últimas transações...');
  const { data: transactions, error: txError } = await supabase
    .from('transactions')
    .select('*, customer:customers(phone, available_cashback, total_cashback)')
    .eq('transaction_type', 'cashback')
    .order('created_at', { ascending: false })
    .limit(3);
  
  if (txError) {
    console.error('❌ Erro:', txError.message);
    return;
  }

  console.log(`✅ Encontradas ${transactions.length} transações\n`);
  
  transactions.forEach((tx, i) => {
    console.log(`Transação ${i + 1}:`);
    console.log(`  - ID: ${tx.id}`);
    console.log(`  - Cliente: ${tx.customer?.phone}`);
    console.log(`  - Valor compra: R$ ${tx.amount}`);
    console.log(`  - Cashback: R$ ${tx.cashback_amount}`);
    console.log(`  - Status: ${tx.status}`);
    console.log(`  - QR Scanned: ${tx.qr_scanned}`);
    console.log(`  - Saldo disponível cliente: R$ ${tx.customer?.available_cashback || 0}`);
    console.log(`  - Total cashback cliente: R$ ${tx.customer?.total_cashback || 0}`);
    console.log(`  - Criado em: ${tx.created_at}\n`);
  });

  // 2. Verificar se há clientes
  console.log('2️⃣ Verificando clientes...');
  const { data: customers, error: custError } = await supabase
    .from('customers')
    .select('*')
    .limit(3);
  
  if (custError) {
    console.error('❌ Erro:', custError.message);
    return;
  }

  console.log(`✅ Encontrados ${customers.length} clientes\n`);
  
  customers.forEach((c, i) => {
    console.log(`Cliente ${i + 1}:`);
    console.log(`  - Telefone: ${c.phone}`);
    console.log(`  - Nome: ${c.name || 'N/A'}`);
    console.log(`  - Disponível: R$ ${c.available_cashback || 0}`);
    console.log(`  - Total: R$ ${c.total_cashback || 0}`);
    console.log(`  - Gasto: R$ ${c.total_spent || 0}\n`);
  });

  // 3. Verificar merchants
  console.log('3️⃣ Verificando estabelecimentos...');
  const { data: merchants, error: merchError } = await supabase
    .from('merchants')
    .select('name, cashback_percentage, cashback_available_immediately, active')
    .limit(2);
  
  if (merchError) {
    console.error('❌ Erro:', merchError.message);
    return;
  }

  console.log(`✅ Encontrados ${merchants.length} estabelecimentos\n`);
  
  merchants.forEach((m, i) => {
    console.log(`Estabelecimento ${i + 1}:`);
    console.log(`  - Nome: ${m.name}`);
    console.log(`  - % Cashback: ${m.cashback_percentage}%`);
    console.log(`  - Disponível imediatamente: ${m.cashback_available_immediately ?? 'N/A'}`);
    console.log(`  - Ativo: ${m.active}\n`);
  });
}

testFlow().catch(console.error);
