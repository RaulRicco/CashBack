# 🧪 GUIA RÁPIDO: Testar Push Notifications AGORA

## 🎯 O que você pode testar AGORA (sem código adicional):

### ✅ **TESTE 1: Sincronização com OneSignal**

#### Passo 1: Configure OneSignal
1. Acesse: http://31.97.167.88:8080/
2. Login como merchant
3. Vá em: **Integrações** → **OneSignal**
4. Cole:
   - **App ID**: [seu app id]
   - **REST API Key**: [sua api key]
5. Marque ✅ as opções de sincronização
6. Clique em **"Salvar Configuração"**
7. Ative a integração (toggle ✅)

#### Passo 2: Sincronize Clientes
1. Na mesma página, clique em **"Sincronizar Todos os Clientes"** (botão no topo)
2. Aguarde a sincronização (aparece toast de sucesso)
3. Vá na aba **"Logs"** para ver o resultado

#### Passo 3: Verifique no OneSignal
1. Abra: https://dashboard.onesignal.com
2. Selecione seu App
3. Vá em: **Audience** → **All Users**
4. Você verá os clientes:
   ```
   External User ID: 11999887766 (telefone do cliente)
   Tags: cashback, cliente, novo_cliente, ativo
   Last Active: [data da sincronização]
   ```

#### ⚠️ Limitação:
- Clientes aparecerão no OneSignal ✅
- MAS não terão "Player ID" (device token)
- Portanto, não podem receber push ainda
- Você verá: "0 Subscribed" ou "Not Subscribed"

---

### ✅ **TESTE 2: Enviar Push Manual no OneSignal (Teste de API)**

Mesmo sem Player ID, você pode testar a API:

1. No OneSignal Dashboard:
   - Vá em **Messages** → **New Push**
   - Escolha **"Particular Segment"**
   - Crie filtro: `Tag "cashback" is "true"`
2. Escreva:
   - **Title**: 🎉 Oferta Especial!
   - **Message**: Ganhe 20% de cashback hoje!
3. Clique em **"Send Message"**
4. Resultado esperado:
   - ✅ Mensagem será enviada
   - ❌ Ninguém receberá (sem Player IDs)
   - ✅ Você verá as estatísticas: "Sent: X, Failed: X"

---

### ✅ **TESTE 3: Notificações Locais (JÁ FUNCIONA!)**

Este teste funciona 100% agora:

#### Como Cliente:

1. **Acesse o dashboard do cliente**:
   ```
   http://31.97.167.88:8080/customer/login
   ```

2. **Faça login** com telefone de um cliente cadastrado

3. **Ative notificações**:
   - Aparecerá um popup no canto inferior direito
   - Clique em **"Ativar"**
   - Browser pedirá permissão → **"Permitir"**

4. **Teste automático**:
   - Como merchant, registre um cashback para o cliente
   - Cliente recebe notificação instantânea! 🔔

#### Teste Manual (Console):

1. Abra o dashboard do cliente
2. Pressione **F12** (Console)
3. Cole e execute:
   ```javascript
   // Importar função
   const { sendLocalNotification } = await import('/src/lib/pushNotifications.js');
   
   // Enviar notificação
   sendLocalNotification({
     title: '🎉 Teste de Push',
     body: 'Você ganhou R$ 50,00 em cashback!',
     icon: '/icon-192.png'
   });
   ```

4. Você verá a notificação aparecer! ✅

---

## 📊 Tabela de Testes

| Teste | Funciona Agora? | Requer Código? | Resultado |
|-------|----------------|----------------|-----------|
| Sincronizar clientes no OneSignal | ✅ SIM | ❌ NÃO | Clientes aparecem no dashboard OneSignal |
| Ver tags e External User ID | ✅ SIM | ❌ NÃO | Tags visíveis no OneSignal |
| Enviar push do OneSignal | ⚠️ PARCIAL | ❌ NÃO | Envia mas ninguém recebe (sem Player ID) |
| Receber push OneSignal | ❌ NÃO | ✅ SIM | Precisa adicionar OneSignal Web SDK |
| Notificações locais browser | ✅ SIM | ❌ NÃO | Funciona perfeitamente! |

---

## 🎓 Como Enviar Push Real (Requer OneSignal Web SDK)

Para que clientes possam **receber push pelo OneSignal**:

### Opção A: Usando REST API (teste rápido)

Use Postman ou curl:

```bash
curl --request POST \
  --url https://onesignal.com/api/v1/notifications \
  --header 'Authorization: Basic [SUA_REST_API_KEY]' \
  --header 'Content-Type: application/json' \
  --data '{
    "app_id": "[SEU_APP_ID]",
    "include_external_user_ids": ["11999887766"],
    "headings": {"en": "🎉 Cashback Disponível!"},
    "contents": {"en": "Você tem R$ 25,00 para resgatar!"}
  }'
```

⚠️ **Resultado**: Enviará, mas cliente não receberá (sem Player ID)

### Opção B: Adicionar Web SDK (implementação completa)

Ver arquivo: `ONESIGNAL-WEB-INTEGRATION-TODO.md`

---

## 🤔 FAQ

### P: Por que os clientes aparecem no OneSignal mas não recebem push?

**R**: Falta o OneSignal Web SDK no frontend. Atualmente apenas sincronizamos os dados do cliente (nome, telefone, tags), mas não registramos o device/browser dele para receber notificações.

### P: As notificações locais são suficientes?

**R**: Para teste e MVP, sim! Mas têm limitações:
- ❌ Não funcionam com browser fechado
- ❌ Sem segmentação avançada
- ❌ Sem estatísticas
- ✅ Simples e funcionam agora

### P: Qual a diferença entre External User ID e Player ID?

**R**:
- **External User ID**: Identificador do cliente no nosso sistema (telefone)
- **Player ID**: ID do device/browser no OneSignal (precisa do SDK)

### P: Como vejo se a sincronização funcionou?

**R**: Vá em Integrações → Logs. Verá:
```
✅ Success | onesignal | signup | [nome do cliente]
```

---

## 🚀 Próximo Passo

Se quiser push notifications completas com OneSignal:

1. Leia: `ONESIGNAL-WEB-INTEGRATION-TODO.md`
2. Adicione OneSignal Web SDK
3. Implemente subscribe no frontend
4. Configure Service Worker

**OU**

Continue usando notificações locais (já funcionam!) para MVP.
