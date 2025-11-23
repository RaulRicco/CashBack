const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://zxiehkdtsoeauqouwxvi.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4aWVoa2R0c29lYXVxb3V3eHZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5MTkyMTMsImV4cCI6MjA3ODQ5NTIxM30.6t5Aw0dUjNZrmuy_g_XUEW0acZoY5TCQs5ru_Jksms4';

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugCustomers() {
  console.log('🔍 Investigando clientes por merchant...\n');
  
  const raulBarId = 'd1de704a-2b5b-4b5d-a675-a413c965f16c';
  const boidouradoId = '26fc42c5-f5a5-4342-9fa1-12b959874efd';
  
  // Check customers for Raul Bar
  console.log('=' .repeat(80));
  console.log('👥 CLIENTES REGISTRADOS NO "RAUL BAR":');
  console.log('=' .repeat(80));
  
  const { data: raulCustomers, error: raulError } = await supabase
    .from('customers')
    .select('id, name, phone, email, referred_by_merchant_id')
    .eq('referred_by_merchant_id', raulBarId)
    .order('created_at', { ascending: false })
    .limit(10);
  
  if (raulError) {
    console.error('❌ Erro:', raulError);
  } else {
    console.log(`\n✅ Total: ${raulCustomers.length} clientes`);
    raulCustomers.forEach((c, i) => {
      console.log(`\n${i + 1}. ${c.name || '(sem nome)'}`);
      console.log(`   Phone: ${c.phone}`);
      console.log(`   Email: ${c.email || '(sem email)'}`);
      console.log(`   Merchant ID: ${c.referred_by_merchant_id}`);
    });
  }
  
  // Check customers for Boi Dourado
  console.log('\n\n' + '=' .repeat(80));
  console.log('👥 CLIENTES REGISTRADOS NO "CHURRASCARIA BOI DOURADO":');
  console.log('=' .repeat(80));
  
  const { data: bdCustomers, error: bdError } = await supabase
    .from('customers')
    .select('id, name, phone, email, referred_by_merchant_id')
    .eq('referred_by_merchant_id', boidouradoId)
    .order('created_at', { ascending: false })
    .limit(10);
  
  if (bdError) {
    console.error('❌ Erro:', bdError);
  } else {
    console.log(`\n✅ Total: ${bdCustomers.length} clientes`);
    bdCustomers.forEach((c, i) => {
      console.log(`\n${i + 1}. ${c.name || '(sem nome)'}`);
      console.log(`   Phone: ${c.phone}`);
      console.log(`   Email: ${c.email || '(sem email)'}`);
      console.log(`   Merchant ID: ${c.referred_by_merchant_id}`);
    });
  }
  
  // Check if there are customers with accounts in BOTH merchants
  console.log('\n\n' + '=' .repeat(80));
  console.log('🔄 CLIENTES COM CADASTRO EM MÚLTIPLOS ESTABELECIMENTOS:');
  console.log('=' .repeat(80));
  
  const { data: allCustomers, error: allError } = await supabase
    .from('customers')
    .select('phone, name, referred_by_merchant_id')
    .order('phone');
  
  if (allError) {
    console.error('❌ Erro:', allError);
  } else {
    // Group by phone number
    const phoneGroups = {};
    allCustomers.forEach(c => {
      if (!phoneGroups[c.phone]) {
        phoneGroups[c.phone] = [];
      }
      phoneGroups[c.phone].push(c);
    });
    
    // Find phones with multiple merchants
    const multiMerchantPhones = Object.entries(phoneGroups).filter(([phone, customers]) => {
      const uniqueMerchants = new Set(customers.map(c => c.referred_by_merchant_id));
      return uniqueMerchants.size > 1;
    });
    
    console.log(`\n✅ Total: ${multiMerchantPhones.length} telefones com cadastros múltiplos`);
    
    multiMerchantPhones.slice(0, 10).forEach(([phone, customers], i) => {
      console.log(`\n${i + 1}. Telefone: ${phone}`);
      customers.forEach(c => {
        const merchantName = c.referred_by_merchant_id === raulBarId ? 'Raul Bar' : 
                             c.referred_by_merchant_id === boidouradoId ? 'Boi Dourado' : 
                             'Outro';
        console.log(`   - ${c.name || '(sem nome)'} → ${merchantName}`);
      });
    });
  }
  
  console.log('\n' + '=' .repeat(80));
  console.log('✅ Investigação concluída!');
  console.log('=' .repeat(80) + '\n');
}

debugCustomers().catch(console.error);
