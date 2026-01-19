import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://mtylboaluqswdkgljgsd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10eWxib2FsdXFzd2RrZ2xqZ3NkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0Nzc5OTAsImV4cCI6MjA3NzA1Mzk5MH0.heq_wso726i0TJSWTMzIWoD61GXnEWzkFw3Iy06YSqI'
);

async function checkSchema() {
  // Get one customer to see all fields
  const { data } = await supabase
    .from('customers')
    .select('*')
    .limit(1)
    .single();

  console.log('📋 Campos disponíveis na tabela customers:');
  console.log(Object.keys(data));
  
  // Check if last_purchase_at exists
  if (data.hasOwnProperty('last_purchase_at')) {
    console.log('✅ last_purchase_at EXISTS');
  } else {
    console.log('❌ last_purchase_at MISSING');
  }
}

checkSchema();
