import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function checkConfig() {
  // Config que está falhando
  const { data: failConfig, error: failError } = await supabase
    .from('integration_configs')
    .select('*')
    .eq('id', 'cece01ce-877b-4465-a6b6-ac13515ce040')
    .single();

  // Config que está funcionando
  const { data: successConfig, error: successError } = await supabase
    .from('integration_configs')
    .select('*')
    .eq('id', 'd593a945-49c5-4223-aa9f-f0e90f5f8e28')
    .single();

  console.log('\n❌ INTEGRAÇÃO COM ERRO:\n');
  if (failConfig) {
    console.log(`Provider: ${failConfig.provider}`);
    console.log(`Is Active: ${failConfig.is_active}`);
    console.log(`Merchant ID: ${failConfig.merchant_id}`);
    console.log(`Sync on Signup: ${failConfig.sync_on_signup}`);
    console.log(`Sync on Purchase: ${failConfig.sync_on_purchase}`);
  } else {
    console.log('❌ Não encontrado');
  }

  console.log('\n✅ INTEGRAÇÃO FUNCIONANDO:\n');
  if (successConfig) {
    console.log(`Provider: ${successConfig.provider}`);
    console.log(`Is Active: ${successConfig.is_active}`);
    console.log(`Merchant ID: ${successConfig.merchant_id}`);
    console.log(`Sync on Signup: ${successConfig.sync_on_signup}`);
    console.log(`Sync on Purchase: ${successConfig.sync_on_purchase}`);
  } else {
    console.log('❌ Não encontrado');
  }
}

checkConfig();
