const https = require('https');

const APP_ID = '8e891d9e-5631-4ff7-9955-1f49d3b44ee7';
const REST_API_KEY = 'os_v2_app_r2er3hswgfh7pgkvd5e5hnco47zbd6zplzferzedajv7gd5kb32qmipfgdfn3ciqizamc3rd4oryqbudkxpzrou3bjdsccvazyp4aoa';

const options = {
  hostname: 'onesignal.com',
  port: 443,
  path: `/api/v1/apps/${APP_ID}`,
  method: 'GET',
  headers: {
    'Authorization': `Basic ${REST_API_KEY}`,
    'Content-Type': 'application/json'
  }
};

console.log('🔍 Verificando status da conta OneSignal...\n');

const req = https.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    if (res.statusCode === 200) {
      const appData = JSON.parse(data);
      console.log('✅ CONEXÃO ONESIGNAL: ATIVA\n');
      console.log('📊 INFORMAÇÕES DA CONTA:');
      console.log(`   Nome do App: ${appData.name}`);
      console.log(`   App ID: ${appData.id}`);
      console.log(`   Total de Usuários Inscritos: ${appData.players || 0}`);
      console.log(`   Usuários Alcançáveis: ${appData.messageable_players || 0}`);
      console.log(`   Criado em: ${appData.created_at}`);
      console.log(`   Última atualização: ${appData.updated_at}`);
      console.log('\n✅ OneSignal está PRONTO para enviar notificações!');
    } else {
      console.error('❌ ERRO ao conectar com OneSignal');
      console.error(`Status: ${res.statusCode}`);
      console.error(`Resposta: ${data}`);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ ERRO de conexão:', error.message);
});

req.end();
