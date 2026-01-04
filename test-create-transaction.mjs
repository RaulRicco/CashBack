import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://mtylboaluqswdkgljgsd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10eWxib2FsdXFzd2RrZ2xqZ3NkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0Nzc5OTAsImV4cCI6MjA3NzA1Mzk5MH0.heq_wso726i0TJSWTMzIWoD61GXnEWzkFw3Iy06YSqI'
);

async function testCreate() {
  console.log('🧪 Testando criação de transação...\n');

  // Buscar dados necessários
  const { data: customer } = await supabase
    .from('customers')
    .select('*')
    .eq('phone', '61992082577')
    .single();

  const { data: merchant } = await supabase
    .from('merchants')
    .select('*')
    .limit(1)
    .single();

  const { data: employee } = await supabase
    .from('employees')
    .select('*')
    .eq('merchant_id', merchant.id)
    .limit(1)
    .single();

  console.log('Dados obtidos:');
  console.log('- Customer ID:', customer.id);
  console.log('- Merchant ID:', merchant.id);
  console.log('- Employee ID:', employee.id);
  console.log('- Cashback %:', merchant.cashback_percentage);

  // Tentar criar transação
  console.log('\nCriando transação de teste...');
  const testAmount = 200;
  const testCashback = (testAmount * merchant.cashback_percentage) / 100;

  const { data: tx, error } = await supabase
    .from('transactions')
    .insert({
      merchant_id: merchant.id,
      customer_id: customer.id,
      employee_id: employee.id,
      transaction_type: 'cashback',
      amount: testAmount,
      cashback_amount: testCashback,
      cashback_percentage: merchant.cashback_percentage,
      qr_code_token: `TEST_${Date.now()}`,
      status: 'completed',
      qr_scanned: true,
      qr_scanned_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) {
    console.error('❌ ERRO ao criar transação:');
    console.error('Código:', error.code);
    console.error('Mensagem:', error.message);
    console.error('Detalhes:', error.details);
    console.error('Hint:', error.hint);
    return;
  }

  console.log('✅ Transação criada com sucesso!');
  console.log('ID:', tx.id);
  console.log('Amount:', tx.amount);
  console.log('Cashback:', tx.cashback_amount);
  console.log('Status:', tx.status);

  // Aguardar trigger executar
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Verificar saldo do cliente
  console.log('\n📊 Verificando saldo do cliente...');
  const { data: updatedCustomer } = await supabase
    .from('customers')
    .select('available_cashback, total_cashback, total_spent')
    .eq('id', customer.id)
    .single();

  console.log('Saldo atualizado:');
  console.log('- Disponível: R$', updatedCustomer.available_cashback);
  console.log('- Total: R$', updatedCustomer.total_cashback);
  console.log('- Gasto: R$', updatedCustomer.total_spent);
}

testCreate();
