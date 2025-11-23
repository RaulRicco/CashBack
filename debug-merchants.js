const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://zxiehkdtsoeauqouwxvi.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4aWVoa2R0c29lYXVxb3V3eHZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5MTkyMTMsImV4cCI6MjA3ODQ5NTIxM30.6t5Aw0dUjNZrmuy_g_XUEW0acZoY5TCQs5ru_Jksms4';

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugMerchants() {
  console.log('🔍 Investigando configuração de merchants...\n');
  
  // 1. Check all merchants with custom domains
  console.log('=' .repeat(80));
  console.log('📋 TODOS OS MERCHANTS COM CUSTOM_DOMAIN:');
  console.log('=' .repeat(80));
  
  const { data: allMerchants, error: allError } = await supabase
    .from('merchants')
    .select('id, name, custom_domain, signup_link_slug, active')
    .not('custom_domain', 'is', null)
    .order('name');
  
  if (allError) {
    console.error('❌ Erro:', allError);
  } else {
    allMerchants.forEach((m, i) => {
      console.log(`\n${i + 1}. ${m.name}`);
      console.log(`   ID: ${m.id}`);
      console.log(`   Domain: ${m.custom_domain}`);
      console.log(`   Slug: ${m.signup_link_slug}`);
      console.log(`   Active: ${m.active ? '✅' : '❌'}`);
    });
  }
  
  // 2. Check specific domain cashback.raulricco.com.br
  console.log('\n\n' + '=' .repeat(80));
  console.log('🎯 MERCHANT PARA cashback.raulricco.com.br:');
  console.log('=' .repeat(80));
  
  const { data: raulMerchant, error: raulError } = await supabase
    .from('merchants')
    .select('*')
    .eq('custom_domain', 'cashback.raulricco.com.br')
    .eq('active', true);
  
  if (raulError) {
    console.error('❌ Erro:', raulError);
  } else if (!raulMerchant || raulMerchant.length === 0) {
    console.log('⚠️  Nenhum merchant encontrado para este domínio!');
  } else {
    console.log(`\n✅ Encontrado ${raulMerchant.length} merchant(s):`);
    raulMerchant.forEach((m, i) => {
      console.log(`\n${i + 1}. ${m.name}`);
      console.log(`   ID: ${m.id}`);
      console.log(`   Domain: ${m.custom_domain}`);
      console.log(`   Slug: ${m.signup_link_slug}`);
      console.log(`   Active: ${m.active}`);
      console.log(`   Created: ${m.created_at}`);
    });
  }
  
  // 3. Check if "Raul Bar" exists and what's its config
  console.log('\n\n' + '=' .repeat(80));
  console.log('🔍 PROCURANDO "RAUL BAR":');
  console.log('=' .repeat(80));
  
  const { data: raulBar, error: barError } = await supabase
    .from('merchants')
    .select('*')
    .ilike('name', '%raul%bar%');
  
  if (barError) {
    console.error('❌ Erro:', barError);
  } else if (!raulBar || raulBar.length === 0) {
    console.log('⚠️  Nenhum merchant "Raul Bar" encontrado!');
  } else {
    console.log(`\n✅ Encontrado ${raulBar.length} merchant(s) com "raul" e "bar":`);
    raulBar.forEach((m, i) => {
      console.log(`\n${i + 1}. ${m.name}`);
      console.log(`   ID: ${m.id}`);
      console.log(`   Domain: ${m.custom_domain || '(sem domínio)'}`);
      console.log(`   Slug: ${m.signup_link_slug}`);
      console.log(`   Active: ${m.active}`);
    });
  }
  
  // 4. Check all merchants with names similar to "Raul"
  console.log('\n\n' + '=' .repeat(80));
  console.log('🔍 TODOS OS MERCHANTS COM "RAUL" NO NOME:');
  console.log('=' .repeat(80));
  
  const { data: raulMerchants, error: raulMError } = await supabase
    .from('merchants')
    .select('id, name, custom_domain, signup_link_slug, active')
    .ilike('name', '%raul%')
    .order('name');
  
  if (raulMError) {
    console.error('❌ Erro:', raulMError);
  } else {
    console.log(`\n✅ Encontrado ${raulMerchants.length} merchant(s):`);
    raulMerchants.forEach((m, i) => {
      console.log(`\n${i + 1}. ${m.name}`);
      console.log(`   ID: ${m.id}`);
      console.log(`   Domain: ${m.custom_domain || '(sem domínio)'}`);
      console.log(`   Slug: ${m.signup_link_slug}`);
      console.log(`   Active: ${m.active ? '✅' : '❌'}`);
    });
  }
  
  console.log('\n' + '=' .repeat(80));
  console.log('✅ Investigação concluída!');
  console.log('=' .repeat(80) + '\n');
}

debugMerchants().catch(console.error);
