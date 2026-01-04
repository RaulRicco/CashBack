import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://mtylboaluqswdkgljgsd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10eWxib2FsdXFzd2RrZ2xqZ3NkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0Nzc5OTAsImV4cCI6MjA3NzA1Mzk5MH0.heq_wso726i0TJSWTMzIWoD61GXnEWzkFw3Iy06YSqI'
);

async function testMinimal() {
  console.log('🧪 Testando trigger mínimo...\n');

  // First, update the function via SQL
  console.log('1️⃣ Atualizando função do trigger...');
  const { error: funcError } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE OR REPLACE FUNCTION update_customer_cashback()
      RETURNS TRIGGER AS $$
      BEGIN
        IF NEW.transaction_type = 'cashback' AND NEW.status = 'completed' THEN
          UPDATE customers
          SET 
            total_cashback = total_cashback + NEW.cashback_amount,
            available_cashback = available_cashback + NEW.cashback_amount,
            total_spent = total_spent + NEW.amount
          WHERE id = NEW.customer_id;
        END IF;
        
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `
  });

  if (funcError) {
    console.log('⚠️ Não foi possível atualizar via RPC (normal)');
    console.log('Execute manualmente o SQL no Supabase Dashboard\n');
  } else {
    console.log('✅ Função atualizada!\n');
  }

  // Get customer current balance
  const { data: customer } = await supabase
    .from('customers')
    .select('*')
    .eq('phone', '61992082577')
    .single();

  console.log('2️⃣ Saldo atual do cliente:');
  console.log('- Disponível:', customer.available_cashback);
  console.log('- Total:', customer.total_cashback);
  console.log('- Gasto:', customer.total_spent);

  // Get merchant and employee
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

  // Create test transaction
  console.log('\n3️⃣ Criando transação de teste...');
  const testAmount = 100;
  const testCashback = (testAmount * merchant.cashback_percentage) / 100;
  
  console.log('Valor da compra: R$', testAmount);
  console.log('Cashback esperado: R$', testCashback);

  const { data: tx, error: txError } = await supabase
    .from('transactions')
    .insert({
      merchant_id: merchant.id,
      customer_id: customer.id,
      employee_id: employee.id,
      transaction_type: 'cashback',
      amount: testAmount,
      cashback_amount: testCashback,
      cashback_percentage: merchant.cashback_percentage,
      qr_code_token: `TEST_MINIMAL_${Date.now()}`,
      status: 'completed',
      qr_scanned: true,
      qr_scanned_at: new Date().toISOString()
    })
    .select()
    .single();

  if (txError) {
    console.error('\n❌ ERRO ao criar transação:');
    console.error('Código:', txError.code);
    console.error('Mensagem:', txError.message);
    console.error('\n🔴 O trigger ainda tem problemas!');
    return;
  }

  console.log('✅ Transação criada:', tx.id);

  // Wait for trigger
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Check updated balance
  console.log('\n4️⃣ Verificando saldo após transação...');
  const { data: updated } = await supabase
    .from('customers')
    .select('available_cashback, total_cashback, total_spent')
    .eq('id', customer.id)
    .single();

  console.log('Novo saldo:');
  console.log('- Disponível:', updated.available_cashback);
  console.log('- Total:', updated.total_cashback);
  console.log('- Gasto:', updated.total_spent);

  // Check if it worked
  const expectedAvailable = customer.available_cashback + testCashback;
  const expectedTotal = customer.total_cashback + testCashback;
  const expectedSpent = customer.total_spent + testAmount;

  console.log('\nEsperado:');
  console.log('- Disponível:', expectedAvailable);
  console.log('- Total:', expectedTotal);
  console.log('- Gasto:', expectedSpent);

  if (updated.available_cashback === expectedAvailable) {
    console.log('\n✅✅✅ TRIGGER FUNCIONANDO PERFEITAMENTE! ✅✅✅');
  } else {
    console.log('\n❌ Trigger NÃO atualizou o saldo!');
    console.log('Execute o SQL manualmente no Supabase:');
    console.log('Arquivo: FIX-TRIGGER-MINIMO.sql');
  }
}

testMinimal();
