const https = require('https');

const APP_ID = '8e891d9e-5631-4ff7-9955-1f49d3b44ee7';
const REST_API_KEY = 'os_v2_app_r2er3hswgfh7pgkvd5e5hnco47zbd6zplzferzedajv7gd5kb32qmipfgdfn3ciqizamc3rd4oryqbudkxpzrou3bjdsccvazyp4aoa';

async function sendTestNotification(testType) {
  const notifications = {
    signup: {
      title: '🎉 Bem-vindo ao LocalCashback!',
      message: 'Sua conta foi criada com sucesso! Comece a acumular cashback agora.',
      url: 'https://localcashback.com.br/dashboard'
    },
    cashback: {
      title: '💰 Você ganhou cashback!',
      message: 'Parabéns! Você ganhou R$ 25,00 em cashback na sua última compra!',
      url: 'https://localcashback.com.br/dashboard'
    },
    redemption: {
      title: '✅ Resgate aprovado!',
      message: 'Seu resgate de R$ 50,00 foi aprovado e será creditado em breve!',
      url: 'https://localcashback.com.br/dashboard'
    }
  };

  const notif = notifications[testType];
  
  const postData = JSON.stringify({
    app_id: APP_ID,
    included_segments: ['Subscribed Users'], // Envia para TODOS os inscritos (teste)
    headings: { en: notif.title },
    contents: { en: notif.message },
    url: notif.url,
    chrome_web_icon: 'https://localcashback.com.br/logo.png'
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
    console.log(`\n📤 Enviando notificação de TESTE: ${testType.toUpperCase()}`);
    console.log(`   Título: ${notif.title}`);
    console.log(`   Mensagem: ${notif.message}\n`);

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode === 200) {
          const result = JSON.parse(data);
          console.log(`✅ Notificação enviada com sucesso!`);
          console.log(`   ID da Notificação: ${result.id}`);
          console.log(`   Destinatários: ${result.recipients || 0}`);
          resolve(result);
        } else {
          console.error(`❌ ERRO ao enviar notificação`);
          console.error(`   Status: ${res.statusCode}`);
          console.error(`   Resposta: ${data}`);
          reject(new Error(data));
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ ERRO de conexão:', error.message);
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

async function runTests() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('🧪 TESTE DE NOTIFICAÇÕES ONESIGNAL - LocalCashback');
  console.log('═══════════════════════════════════════════════════════');
  
  try {
    // Teste 1: Cadastro
    await sendTestNotification('signup');
    await new Promise(resolve => setTimeout(resolve, 2000)); // Aguarda 2s
    
    // Teste 2: Cashback
    await sendTestNotification('cashback');
    await new Promise(resolve => setTimeout(resolve, 2000)); // Aguarda 2s
    
    // Teste 3: Resgate
    await sendTestNotification('redemption');
    
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('✅ TODOS OS TESTES CONCLUÍDOS COM SUCESSO!');
    console.log('═══════════════════════════════════════════════════════');
    console.log('\n📱 Verifique seu navegador para ver as notificações!');
    console.log('   (As notificações devem aparecer mesmo com o navegador fechado)\n');
  } catch (error) {
    console.error('\n❌ ERRO durante os testes:', error.message);
  }
}

runTests();
