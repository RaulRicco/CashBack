# 🚨 MAILCHIMP - API KEY INVÁLIDA (SOLUÇÃO)

**Data**: 03/01/2026 - 16:07 BRT  
**Status**: ❌ **API KEY INVÁLIDA**

---

## 🔍 **ERRO IDENTIFICADO**

### Mensagem do Mailchimp API:
```
HTTP 401 Unauthorized
Title: API Key Invalid
Detail: Your API key may be invalid, or you've attempted to access the wrong datacenter.
```

### O que isso significa:
A **API Key** do Mailchimp que está cadastrada no sistema **está inválida ou expirou**.

---

## ✅ **SOLUÇÃO**

### Passo 1: Obter Nova API Key do Mailchimp

1. **Acessar**: https://admin.mailchimp.com/
2. **Fazer login** na sua conta Mailchimp
3. **Navegar para**:
   - Clique no seu **nome** no canto superior direito
   - Selecione **Account & Billing**
   - Clique em **Extras** → **API keys**
   - OU acesse diretamente: https://us8.admin.mailchimp.com/account/api/

4. **Gerar Nova Chave**:
   - Clique em **Create A Key**
   - Dê um nome (ex: "LocalCashback 2026")
   - **Copie a chave** (ela será algo como: `abc123def456...xyz-us8`)

⚠️ **IMPORTANTE**: A chave termina com o **server prefix** (ex: `-us8`, `-us1`, etc.)

---

### Passo 2: Atualizar no Sistema LocalCashback

1. **Acessar**: https://cashback.raulricco.com.br/integrations
2. **Clicar em** "Mailchimp"
3. **Atualizar**:
   - **API Key**: Cole a nova chave (ex: `abc123...xyz-us8`)
   - **Server Prefix**: Extrair do final da chave (ex: `us8`)
   - **Audience ID**: Manter o mesmo (`9bf66d51f5`)

4. **Salvar** a configuração
5. **Testar** fazendo um novo cadastro

---

## 📊 **CREDENCIAIS ATUAIS (INVÁLIDAS)**

| Campo | Valor Atual | Status |
|-------|-------------|--------|
| **API Key** | `3b72e4c124...a44311-us8` | ❌ Inválida |
| **Server Prefix** | `us8` | ✅ Correto |
| **Audience ID** | `9bf66d51f5` | ✅ Correto |

---

## 🔍 **COMO IDENTIFICAMOS**

### Teste Direto da API:
```javascript
const response = await mailchimp.lists.addListMember(
  '9bf66d51f5', // Audience ID
  {
    email_address: 'teste@example.com',
    status: 'subscribed',
    merge_fields: { FNAME: 'Test', LNAME: 'User' }
  }
);
```

### Resposta do Mailchimp:
```json
{
  "type": "https://mailchimp.com/developer/marketing/docs/errors/",
  "title": "API Key Invalid",
  "status": 401,
  "detail": "Your API key may be invalid, or you've attempted to access the wrong datacenter."
}
```

---

## ❓ **POR QUE A API KEY ESTÁ INVÁLIDA?**

Possíveis motivos:

1. **Chave expirada**: Mailchimp pode ter revogado por inatividade
2. **Chave regenerada**: Alguém regenerou as chaves no painel Mailchimp
3. **Conta suspensa**: A conta Mailchimp pode ter sido suspensa
4. **Datacenter errado**: Improvável (server prefix está correto: `us8`)

---

## 🧪 **COMO TESTAR APÓS ATUALIZAR**

### Opção 1: Teste via Painel de Integrações
1. Acessar: https://cashback.raulricco.com.br/integrations
2. Clicar em "Testar Conexão" no card do Mailchimp
3. Deve retornar: ✅ "Conexão bem-sucedida!"

### Opção 2: Teste Real com Cadastro
1. Acessar: https://cashback.raulricco.com.br/signup/bardoraul
2. Fazer cadastro como cliente
3. Verificar em "Integrações" se aparece:
   - ✅ **OneSignal**: Sucesso
   - ✅ **Mailchimp**: Sucesso (sem mais erro 500!)

---

## 📝 **DOCUMENTAÇÃO MAILCHIMP API**

- **API Keys**: https://mailchimp.com/help/about-api-keys/
- **API Authentication**: https://mailchimp.com/developer/marketing/guides/quick-start/
- **Error Codes**: https://mailchimp.com/developer/marketing/docs/errors/

---

## 🔒 **SEGURANÇA**

⚠️ **NUNCA compartilhe sua API Key publicamente!**

- As API Keys dão **acesso total** à sua conta Mailchimp
- Mantenha-as **seguras** no sistema
- **Revogue chaves antigas** após criar novas

---

## 📞 **PRÓXIMOS PASSOS**

1. ✅ **Obter nova API Key** do Mailchimp
2. ✅ **Atualizar** no painel de integrações
3. ✅ **Testar** conexão
4. ✅ **Fazer cadastro de teste** para validar

---

## 🎯 **RESUMO**

| Item | Status |
|------|--------|
| **Problema Identificado** | ✅ API Key Inválida (401) |
| **Causa** | Chave expirada ou revogada |
| **Solução** | Gerar nova chave no Mailchimp |
| **Onde Atualizar** | Painel de Integrações |
| **Teste** | Fazer novo cadastro |

---

**Após obter a nova API Key, me avise para testarmos juntos!** 🚀

**Autor**: GenSpark AI Developer  
**Data**: 03/01/2026  
**Erro**: 401 Unauthorized - API Key Invalid
