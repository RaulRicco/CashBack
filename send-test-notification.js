const https = require('https');

const APP_ID = '8e891d9e-5631-4ff7-9955-1f49d3b44ee7';
const REST_API_KEY = 'os_v2_app_r2er3hswgfh7pgkvd5e5hnco47zbd6zplzferzedajv7gd5kb32qmipfgdfn3ciqizamc3rd4oryqbudkxpzrou3bjdsccvazyp4aoa';

async function sendTestNotification(title, message, url) {
  const postData = JSON.stringify({
    app_id: APP_ID,
    included_segments: ['Subscribed Users'],
    headings: { en: title },
    contents: { en: message },
    url: url || 'http://31.97.167.88:5174/customer',
    chrome_web_icon: 'http://31.97.167.88:5174/logo.png'
  });

  const options = {
    hostname: 'onesignal.com',
    port: 443,
    path: '/api/v1/notifications',
    method: 'POST',
    headers: {
      'Authorization': `Basic ${REST_API_KEY}`,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  return new Promise((resolve, reject) => {
    console.log(`\n📤 Enviando: ${title}`);
    console.log(`   Mensagem: ${message}\n`);

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode === 200) {
          const result = JSON.parse(data);
          console.log(`✅ Enviada! ID: ${result.id} | Destinatários: ${result.recipients || 0}`);
          resolve(result);
        } else {
          console.error(`❌ ERRO: ${res.statusCode} - ${data}`);
          reject(new Error(data));
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Erro de conexão:', error.message);
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

async function runTests() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('🔔 ENVIANDO NOTIFICAÇÕES DE TESTE - LocalCashback');
  console.log('═══════════════════════════════════════════════════════');
  
  try {
    // Teste 1: Cadastro
    await sendTestNotification(
      '🎉 Bem-vindo ao LocalCashback!',
      'Sua conta foi criada com sucesso! Comece a acumular cashback agora.',
      'http://31.97.167.88:5174/customer'
    );
    
    await new Promise(resolve => setTimeout(resolve, 3000)); // 3s
    
    // Teste 2: Cashback
    await sendTestNotification(
      '💰 Você ganhou cashback!',
      'Parabéns! Você ganhou R$ 25,00 em cashback na sua última compra!',
      'http://31.97.167.88:5174/customer'
    );
    
    await new Promise(resolve => setTimeout(resolve, 3000)); // 3s
    
    // Teste 3: Resgate
    await sendTestNotification(
      '✅ Resgate aprovado!',
      'Seu resgate de R$ 50,00 foi aprovado e será creditado em breve!',
      'http://31.97.167.88:5174/customer'
    );
    
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('✅ TESTE CONCLUÍDO!');
    console.log('═══════════════════════════════════════════════════════');
    console.log('\n📱 Verifique seu navegador para ver as notificações!');
    console.log('   (Devem aparecer mesmo com o navegador minimizado)\n');
  } catch (error) {
    console.error('\n❌ ERRO:', error.message);
  }
}

runTests();
