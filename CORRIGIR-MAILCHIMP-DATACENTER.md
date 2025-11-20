# 🔧 CORRIGIR ERRO DO MAILCHIMP - API Key e Datacenter

## 🚨 Problema Identificado:
```
Your API key may be invalid, or you've attempted to access the wrong datacenter.
```

Este erro acontece quando:
1. A API Key está incorreta
2. O datacenter (server prefix) está errado
3. A API Key foi revogada ou expirou

---

## ✅ SOLUÇÃO: Extrair Datacenter da API Key

### 📋 Formato da API Key do Mailchimp:

A API key do Mailchimp tem este formato:
```
abc123def456ghi789jkl012mno345pqr-us1
                                    ^^^
                                    Este é o datacenter!
```

**Exemplos reais:**
- `abc123...xyz-us1` → Datacenter: **us1**
- `abc123...xyz-us21` → Datacenter: **us21**
- `abc123...xyz-us14` → Datacenter: **us14**

---

## 🎯 PASSO A PASSO PARA CORRIGIR:

### 1️⃣ Encontrar sua API Key do Mailchimp

1. Acesse: https://admin.mailchimp.com/
2. Clique no seu perfil (canto superior direito)
3. Vá em: **Profile** → **Extras** → **API Keys**
4. Copie a API Key completa

**Exemplo:**
```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6-us21
```

---

### 2️⃣ Identificar o Datacenter

Olhe o final da API Key após o hífen `-`:

```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6-us21
                                   ^^^^
                                   Este é o datacenter: us21
```

---

### 3️⃣ Configurar no Sistema

No seu sistema de cashback, ao configurar o Mailchimp:

**Campos a preencher:**

| Campo | O que colocar | Exemplo |
|-------|---------------|---------|
| **API Key** | A API Key COMPLETA | `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6-us21` |
| **Audience ID** | ID da sua lista | `abc123def4` |
| **Server Prefix** | O datacenter (após o hífen) | `us21` |

---

### 4️⃣ Encontrar o Audience ID (List ID)

1. No Mailchimp, vá em: **Audience** → **All contacts**
2. Clique em **Settings** → **Audience name and defaults**
3. Procure por **Audience ID** (geralmente 10 caracteres)

**Exemplo:** `abc123def4`

---

## 🔍 EXEMPLO COMPLETO DE CONFIGURAÇÃO:

```javascript
API Key:       a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6-us21
Audience ID:   abc123def4
Server Prefix: us21
```

**URL gerada:**
```
https://us21.api.mailchimp.com/3.0/
```

---

## ⚠️ ERROS COMUNS:

### ❌ Erro 1: Datacenter errado
```
Configurou: us1
API Key tem: us21
Resultado: ERRO!
```

**Solução:** Sempre extraia o datacenter da própria API Key.

---

### ❌ Erro 2: API Key incompleta
```
Colocou apenas: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
Faltou: -us21
Resultado: ERRO!
```

**Solução:** Cole a API Key COMPLETA incluindo o `-us21`.

---

### ❌ Erro 3: Audience ID errado
```
Audience ID: "My Contacts" (nome)
Correto: abc123def4 (ID numérico)
```

**Solução:** Use o ID, não o nome da lista.

---

## 🧪 COMO TESTAR:

### Método 1: Teste Manual no Postman/Insomnia

```bash
GET https://us21.api.mailchimp.com/3.0/ping
Authorization: Bearer a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6-us21
```

**Resposta esperada:**
```json
{
  "health_status": "Everything's Chimpy!"
}
```

---

### Método 2: Teste via cURL

```bash
curl -X GET \
  "https://us21.api.mailchimp.com/3.0/ping" \
  -H "Authorization: Bearer a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6-us21"
```

---

## 📝 CHECKLIST RÁPIDO:

- [ ] API Key completa copiada (com hífen e datacenter)
- [ ] Datacenter extraído corretamente (ex: us21)
- [ ] Audience ID obtido (10 caracteres)
- [ ] Server Prefix configurado igual ao datacenter
- [ ] Teste de conexão realizado
- [ ] "Everything's Chimpy!" apareceu no teste

---

## 🆘 AINDA NÃO FUNCIONA?

### Possíveis causas:

1. **API Key revogada**: Crie uma nova API Key no Mailchimp
2. **Permissões**: Verifique se a API Key tem permissões de leitura/escrita
3. **Firewall**: Verifique se o servidor permite conexões ao Mailchimp
4. **Proxy**: Se estiver usando proxy, verifique se está configurado corretamente

---

## 💡 DICA PROFISSIONAL:

Para descobrir rapidamente seu datacenter, use este comando:

```bash
echo "Sua API Key: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6-us21"
echo "Datacenter: us21"  # <- Tudo após o hífen
```

Ou no JavaScript (console do navegador):
```javascript
const apiKey = "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6-us21";
const datacenter = apiKey.split('-')[1];
console.log("Datacenter:", datacenter); // us21
```

---

## 📚 Documentação Oficial:

- Mailchimp API: https://mailchimp.com/developer/marketing/api/
- Datacenter Info: https://mailchimp.com/developer/marketing/docs/fundamentals/
- API Keys: https://mailchimp.com/help/about-api-keys/

---

**Depois de corrigir, teste novamente a integração no sistema!** 🚀
