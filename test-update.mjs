import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://mtylboaluqswdkgljgsd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10eWxib2FsdXFzd2RrZ2xqZ3NkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0Nzc5OTAsImV4cCI6MjA3NzA1Mzk5MH0.heq_wso726i0TJSWTMzIWoD61GXnEWzkFw3Iy06YSqI'
);

async function testUpdate() {
  // Buscar cliente
  console.log('Buscando cliente...');
  const { data: customer } = await supabase
    .from('customers')
    .select('*')
    .eq('phone', '61992082577')
    .single();

  console.log('Cliente antes:', {
    id: customer.id,
    phone: customer.phone,
    available_cashback: customer.available_cashback,
    total_cashback: customer.total_cashback,
    total_spent: customer.total_spent
  });

  // Tentar atualizar
  console.log('\nTentando atualizar saldo...');
  const { data: updated, error } = await supabase
    .from('customers')
    .update({
      available_cashback: 100,
      total_cashback: 100,
      total_spent: 500
    })
    .eq('id', customer.id)
    .select();

  if (error) {
    console.error('❌ ERRO na atualização:', error);
  } else {
    console.log('✅ Atualização bem-sucedida:', updated);
  }

  // Buscar novamente
  console.log('\nBuscando cliente novamente...');
  const { data: afterUpdate } = await supabase
    .from('customers')
    .select('*')
    .eq('phone', '61992082577')
    .single();

  console.log('Cliente depois:', {
    available_cashback: afterUpdate.available_cashback,
    total_cashback: afterUpdate.total_cashback,
    total_spent: afterUpdate.total_spent
  });
}

testUpdate();
