import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://mtylboaluqswdkgljgsd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10eWxib2FsdXFzd2RrZ2xqZ3NkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0Nzc5OTAsImV4cCI6MjA3NzA1Mzk5MH0.heq_wso726i0TJSWTMzIWoD61GXnEWzkFw3Iy06YSqI'
);

async function testTrigger() {
  // Primeiro, zerar o saldo do cliente
  console.log('1️⃣ Zerando saldo do cliente de teste...');
  const { data: customer } = await supabase
    .from('customers')
    .select('*')
    .eq('phone', '61992082577')
    .single();

  await supabase
    .from('customers')
    .update({
      available_cashback: 0,
      total_cashback: 0,
      total_spent: 0
    })
    .eq('id', customer.id);

  console.log('✅ Cliente zerado\n');

  // Buscar merchant e employee
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

  // Criar uma transação de teste
  console.log('2️⃣ Criando transação de teste...');
  const testAmount = 50;
  const testCashback = 1; // 2% de 50

  const { data: tx, error: txError } = await supabase
    .from('transactions')
    .insert({
      merchant_id: merchant.id,
      customer_id: customer.id,
      employee_id: employee.id,
      transaction_type: 'cashback',
      amount: testAmount,
      cashback_amount: testCashback,
      cashback_percentage: 2,
      status: 'completed', // ← IMPORTANTE: completed
      qr_code_token: `TEST_${Date.now()}`,
      qr_scanned: true,
      qr_scanned_at: new Date().toISOString()
    })
    .select()
    .single();

  if (txError) {
    console.error('❌ Erro ao criar transação:', txError);
    return;
  }

  console.log('✅ Transação criada:', tx.id, '\n');

  // Aguardar um pouco para o trigger executar
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Verificar se o saldo foi atualizado
  console.log('3️⃣ Verificando saldo do cliente...');
  const { data: afterTx } = await supabase
    .from('customers')
    .select('*')
    .eq('id', customer.id)
    .single();

  console.log('Saldo após transação:');
  console.log(`  - available_cashback: R$ ${afterTx.available_cashback}`);
  console.log(`  - total_cashback: R$ ${afterTx.total_cashback}`);
  console.log(`  - total_spent: R$ ${afterTx.total_spent}`);
  
  if (afterTx.available_cashback > 0) {
    console.log('\n✅✅✅ TRIGGER FUNCIONANDO! ✅✅✅');
  } else {
    console.log('\n❌❌❌ TRIGGER NÃO ESTÁ FUNCIONANDO! ❌❌❌');
    console.log('O trigger precisa ser criado/recriado no banco de dados.');
  }
}

testTrigger();
