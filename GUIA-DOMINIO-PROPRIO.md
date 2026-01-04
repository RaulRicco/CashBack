# 🌐 Guia Completo: Como Configurar Domínio Próprio

## 📋 O Que Você Vai Conseguir

Ao invés de usar:
```
https://5179-iissidqg3y4yqs2mu7iw2-2b54fc91.sandbox.novita.ai
```

Você terá:
```
https://cashback.sualoja.com.br
```

---

## 🎯 Requisitos

- ✅ Ter um domínio próprio (ex: `sualoja.com.br`)
- ✅ Acesso ao painel de DNS do seu domínio
- ✅ Sistema de cashback funcionando
- ✅ 10-15 minutos para configurar

---

## 🚀 OPÇÃO 1: Usar Subdomínio (RECOMENDADO)

### Por que usar subdomínio?
- ✅ Não afeta seu site principal
- ✅ Fácil de configurar
- ✅ Você mantém `www.sualoja.com.br` para o site
- ✅ Usa `cashback.sualoja.com.br` para o sistema

---

## 📝 PASSO A PASSO COMPLETO

### ETAPA 1: Escolher o Subdomínio

Escolha um nome para seu subdomínio. Sugestões:
- `cashback.sualoja.com.br` (recomendado)
- `premio.sualoja.com.br`
- `fidelidade.sualoja.com.br`
- `desconto.sualoja.com.br`
- `club.sualoja.com.br`

**Vamos usar `cashback.sualoja.com.br` como exemplo.**

---

### ETAPA 2: Acessar o Painel de DNS

Você precisa acessar o painel onde gerencia seu domínio. 

#### Principais Provedores no Brasil:

**📌 Registro.br (domínios .br)**
1. Acesse: https://registro.br
2. Faça login com sua conta
3. Clique no domínio que quer configurar
4. Vá em **"DNS"** ou **"Gerenciar DNS"**

**📌 Hostgator**
1. Acesse: https://financeiro.hostgator.com.br
2. Faça login
3. Vá em **"Meus Produtos"** → Selecione o domínio
4. Clique em **"Gerenciar DNS"** ou **"Zona DNS"**

**📌 GoDaddy**
1. Acesse: https://br.godaddy.com
2. Faça login
3. Vá em **"Meus Produtos"** → **"Domínios"**
4. Clique em **"DNS"** ao lado do domínio

**📌 Locaweb**
1. Acesse: https://painel.locaweb.com.br
2. Faça login
3. Vá em **"Domínios"** → Selecione o domínio
4. Clique em **"Editar Zona DNS"**

**📌 UOL Host**
1. Acesse: https://painel.uolhost.com.br
2. Faça login
3. Vá em **"Domínios"** → Selecione o domínio
4. Clique em **"Gerenciar DNS"**

**📌 Cloudflare (se usa)**
1. Acesse: https://dash.cloudflare.com
2. Faça login
3. Selecione o domínio
4. Vá em **"DNS"** → **"Records"**

---

### ETAPA 3: Criar o Registro DNS

No painel de DNS, você vai **adicionar um novo registro CNAME**.

#### 📌 Configuração do Registro:

| Campo | Valor |
|-------|-------|
| **Tipo** | CNAME |
| **Nome / Host** | `cashback` |
| **Destino / Valor / Aponta para** | `5179-iissidqg3y4yqs2mu7iw2-2b54fc91.sandbox.novita.ai` |
| **TTL** | 3600 (ou deixe padrão) |

#### ⚠️ IMPORTANTE:
- No campo **Nome/Host**, digite apenas `cashback` (sem o domínio completo)
- Alguns provedores pedem `cashback.sualoja.com.br` completo
- O **Destino** deve ser exatamente: `5179-iissidqg3y4yqs2mu7iw2-2b54fc91.sandbox.novita.ai`
- **NÃO** adicione `http://` ou `https://` no destino
- **NÃO** adicione `/` no final

---

### ETAPA 4: Exemplos Visuais por Provedor

#### 🔹 Registro.br
```
Tipo: CNAME
Nome: cashback
Dados: 5179-iissidqg3y4yqs2mu7iw2-2b54fc91.sandbox.novita.ai
```

#### 🔹 Hostgator / Locaweb
```
Tipo de Registro: CNAME
Host: cashback
Aponta para: 5179-iissidqg3y4yqs2mu7iw2-2b54fc91.sandbox.novita.ai
TTL: 14400
```

#### 🔹 Cloudflare
```
Type: CNAME
Name: cashback
Target: 5179-iissidqg3y4yqs2mu7iw2-2b54fc91.sandbox.novita.ai
TTL: Auto
Proxy status: DNS only (🌧️ cinza) - IMPORTANTE!
```

**⚠️ NO CLOUDFLARE: Deixe a nuvem CINZA (DNS only), NÃO laranja!**

---

### ETAPA 5: Salvar e Aguardar Propagação

1. **Salve** o registro DNS
2. **Aguarde** de 5 minutos até 24 horas para propagar
   - Normalmente leva de 15 minutos a 2 horas
   - Pode variar por provedor

---

### ETAPA 6: Testar o Domínio

Após criar o registro, teste se está funcionando:

#### Teste 1: Comando nslookup (Windows)
```cmd
nslookup cashback.sualoja.com.br
```

**Resultado esperado:**
```
Servidor:  dns.servidor.com
Address:  8.8.8.8

Nome:    5179-iissidqg3y4yqs2mu7iw2-2b54fc91.sandbox.novita.ai
```

#### Teste 2: Comando dig (Mac/Linux)
```bash
dig cashback.sualoja.com.br
```

**Resultado esperado:**
```
cashback.sualoja.com.br. 3600 IN CNAME 5179-iissidqg3y4yqs2mu7iw2-2b54fc91.sandbox.novita.ai.
```

#### Teste 3: Ferramentas Online
- https://dnschecker.org/
- Digite: `cashback.sualoja.com.br`
- Tipo: CNAME
- Clique em "Search"

---

### ETAPA 7: Configurar no Sistema de Cashback

Depois que o DNS propagar (15 min - 2 horas):

1. **Acesse o painel:** https://5179-iissidqg3y4yqs2mu7iw2-2b54fc91.sandbox.novita.ai
2. **Faça login:** `admin@cashback.com`
3. **Vá em:** Configurações → Aba "Link de Cadastro"
4. **No campo "Domínio Personalizado"**, digite:
   ```
   cashback.sualoja.com.br
   ```
5. **Clique em:** "Salvar Configurações"

---

### ETAPA 8: Testar a Aplicação

Agora acesse seu domínio personalizado:

```
https://cashback.sualoja.com.br
```

**Deve abrir a página de login do sistema! 🎉**

---

## 🎯 URLs que Funcionarão

Depois de configurado, todas essas URLs vão funcionar:

### Painel do Merchant (login)
```
https://cashback.sualoja.com.br
https://cashback.sualoja.com.br/login
https://cashback.sualoja.com.br/dashboard
```

### Cadastro de Cliente
```
https://cashback.sualoja.com.br/signup/sua-loja
```

### Dashboard do Cliente
```
https://cashback.sualoja.com.br/customer/dashboard/11999999999
```

### QR Codes
```
https://cashback.sualoja.com.br/customer/cashback/TOKEN123
https://cashback.sualoja.com.br/customer/redemption/TOKEN456
```

---

## ⚠️ PROBLEMAS COMUNS E SOLUÇÕES

### ❌ "Site não encontrado" ou "ERR_NAME_NOT_RESOLVED"

**Causa:** DNS ainda não propagou ou configurado errado

**Solução:**
1. Aguarde mais tempo (até 24h)
2. Verifique se o registro CNAME está correto
3. Use https://dnschecker.org/ para verificar

---

### ❌ "Este site não pode fornecer uma conexão segura"

**Causa:** Tentando acessar com HTTPS antes do SSL estar configurado

**Solução:**
1. Tente com `http://` (sem S)
2. Aguarde algumas horas para SSL automático
3. No Cloudflare: Use "Flexible" SSL mode

---

### ❌ "Blocked request" ou "Host not allowed"

**Causa:** Domínio não configurado no sistema

**Solução:**
1. Vá em Configurações → Link de Cadastro
2. Digite seu domínio no campo "Domínio Personalizado"
3. Salve

---

### ❌ No Cloudflare: "Too many redirects"

**Causa:** Proxy laranja ativo

**Solução:**
1. Vá no Cloudflare DNS
2. Clique na nuvem laranja ao lado do registro
3. Deixe CINZA (DNS only)
4. Salve

---

## 🔒 HTTPS / SSL (Certificado de Segurança)

### Opção 1: SSL Automático (Cloudflare - GRÁTIS)

Se seu domínio está no Cloudflare:

1. Vá em **"SSL/TLS"**
2. Escolha **"Flexible"** ou **"Full"**
3. Aguarde 15 minutos
4. Seu site terá HTTPS automaticamente! 🔒

### Opção 2: Let's Encrypt (Outros Provedores)

1. Acesse o painel do seu provedor
2. Procure por "SSL" ou "Certificado"
3. Ative "Let's Encrypt" (geralmente grátis)
4. Aguarde a emissão (até 24h)

---

## 📧 Usar Domínio para Email Marketing

Com domínio próprio, seus links de cadastro ficam assim:

**Antes:**
```
5179-iissidqg3y4yqs2mu7iw2-2b54fc91.sandbox.novita.ai/signup/loja
```

**Depois:**
```
cashback.sualoja.com.br/signup/loja
```

**Muito mais profissional para:**
- Enviar no WhatsApp
- Compartilhar no Instagram
- Colocar em banners/cartazes
- QR Codes impressos
- Campanhas de email

---

## 🎨 Personalização Completa

Com domínio próprio, você pode:

1. ✅ **QR Codes personalizados**
   - Link curto e bonito
   - Fácil de digitar manualmente

2. ✅ **Branding profissional**
   - Usa seu domínio em todos os links
   - Clientes confiam mais

3. ✅ **SEO melhorado**
   - Seu domínio ganha relevância
   - Melhor posicionamento no Google

---

## 🆘 SUPORTE DOS PROVEDORES

Se tiver dificuldade para adicionar o registro DNS, entre em contato com o suporte do seu provedor:

| Provedor | Suporte |
|----------|---------|
| **Registro.br** | https://registro.br/ajuda/faq/ |
| **Hostgator** | Chat online no site ou (11) 4200-0000 |
| **Locaweb** | (11) 4000-1500 |
| **GoDaddy** | Chat online no site |
| **UOL Host** | (11) 2101-3000 |
| **Cloudflare** | https://community.cloudflare.com/ |

**O que pedir ao suporte:**
> "Olá, gostaria de adicionar um registro CNAME apontando `cashback.meudominio.com.br` para `5179-iissidqg3y4yqs2mu7iw2-2b54fc91.sandbox.novita.ai`. Podem me ajudar?"

---

## ✅ CHECKLIST COMPLETO

### Antes de Começar:
- [ ] Tenho um domínio registrado
- [ ] Tenho acesso ao painel de DNS
- [ ] Sistema de cashback está funcionando

### Configuração:
- [ ] Acessei o painel de DNS do provedor
- [ ] Criei registro CNAME com nome `cashback`
- [ ] Destino: `5179-iissidqg3y4yqs2mu7iw2-2b54fc91.sandbox.novita.ai`
- [ ] Salvei o registro
- [ ] Aguardei propagação (15min - 2h)

### Teste:
- [ ] Testei com nslookup/dig
- [ ] Testei em https://dnschecker.org/
- [ ] Domínio está resolvendo corretamente

### No Sistema:
- [ ] Configurei domínio em Configurações → Link de Cadastro
- [ ] Salvei as configurações
- [ ] Testei acessar pelo domínio próprio
- [ ] Tudo funcionando! 🎉

---

## 📊 EXEMPLO REAL COMPLETO

**Domínio:** minhaloja.com.br  
**Subdomínio escolhido:** cashback.minhaloja.com.br

### 1. No Painel DNS:
```
Tipo: CNAME
Nome: cashback
Destino: 5179-iissidqg3y4yqs2mu7iw2-2b54fc91.sandbox.novita.ai
TTL: 3600
```

### 2. No Sistema (após propagar):
- Campo "Domínio Personalizado": `cashback.minhaloja.com.br`
- Salvar

### 3. Testar:
- Acesse: `https://cashback.minhaloja.com.br`
- Deve abrir o sistema de cashback

### 4. Compartilhar:
- Link de cadastro: `cashback.minhaloja.com.br/signup/minhaloja`
- WhatsApp: "Cadastre-se em cashback.minhaloja.com.br"
- Instagram bio: "Ganhe cashback! cashback.minhaloja.com.br"

---

## 🎉 PRONTO!

Agora você tem um sistema de cashback com domínio próprio, profissional e fácil de compartilhar!

**Seu sistema está em:**
```
✅ https://cashback.sualoja.com.br
```

**Links para compartilhar:**
```
✅ cashback.sualoja.com.br/signup/sua-loja
```

**Muito mais profissional! 🚀**

---

## 💡 DICA EXTRA: Encurtar Ainda Mais

Se quiser um link SUPER curto, use serviços como:
- **bit.ly** - https://bitly.com
- **cutt.ly** - https://cutt.ly
- **tinyurl** - https://tinyurl.com

Exemplo:
```
cashback.sualoja.com.br/signup/loja
↓
bit.ly/cashback-loja
```

Perfeito para QR codes e impressos! 📱✨
