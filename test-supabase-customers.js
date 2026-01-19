import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function testQuery() {
  console.log('🔍 Testando query customers...');
  
  const { data, error } = await supabase
    .from('customers')
    .select('id, phone, name, password_hash')
    .eq('phone', '6199229922')
    .eq('referred_by_merchant_id', 'd1de704a-2b5b-4b5d-a675-a413c965f16c')
    .single();
  
  if (error) {
    console.error('❌ Erro:', error);
  } else {
    console.log('✅ Resultado:', data);
  }
}

testQuery();
