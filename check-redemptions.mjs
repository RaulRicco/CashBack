import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://mtylboaluqswdkgljgsd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10eWxib2FsdXFzd2RrZ2xqZ3NkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0Nzc5OTAsImV4cCI6MjA3NzA1Mzk5MH0.heq_wso726i0TJSWTMzIWoD61GXnEWzkFw3Iy06YSqI'
);

async function checkRedemptions() {
  const { data, error } = await supabase
    .from('redemptions')
    .select('*')
    .limit(1);

  if (error) {
    console.log('Erro ao buscar:', error.message);
    return;
  }

  if (data && data.length > 0) {
    console.log('📋 Campos disponíveis na tabela redemptions:');
    console.log(Object.keys(data[0]));
  } else {
    console.log('⚠️ Tabela redemptions está vazia');
    console.log('Não posso verificar a estrutura');
  }
}

checkRedemptions();
