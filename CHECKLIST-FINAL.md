# ✅ CHECKLIST FINAL - Antes de Colocar no Ar

## 📋 PRÉ-REQUISITOS

Antes de fazer o deploy, confirme que você tem:

- [ ] ✅ Conta no Supabase criada
- [ ] ✅ Projeto criado no Supabase
- [ ] ✅ Tabelas criadas (executou `supabase-schema-completo.sql`)
- [ ] ✅ Correções aplicadas (executou `fix-marketing-spend-quick.sql`)
- [ ] ✅ Row Level Security (RLS) ativado
- [ ] ✅ Credenciais do Supabase em mãos:
  - [ ] Project URL
  - [ ] anon/public key

---

## 🗄️ BANCO DE DADOS

### **Tabelas Necessárias:**

- [ ] `merchants` - Comerciantes
- [ ] `employees` - Funcionários
- [ ] `customers` - Clientes
- [ ] `transactions` - Transações de cashback
- [ ] `redemptions` - Resgates
- [ ] `marketing_spend` - Investimentos em marketing (com correção aplicada)

### **Verificar Estrutura:**

Execute no Supabase SQL Editor:

```sql
-- Verificar se todas as tabelas existem
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

**Deve retornar:** 6 tabelas listadas acima

### **Verificar Coluna Platform:**

```sql
-- Verificar estrutura da marketing_spend
SELECT column_name, data_type
FROM information_schema.columns 
WHERE table_name = 'marketing_spend'
ORDER BY ordinal_position;
```

**Deve incluir:** `platform`, `campaign_name`, `notes`

---

## 🚀 DEPLOY

### **Opção Escolhida:**

- [ ] Vercel (Recomendado - mais fácil)
- [ ] Netlify (Alternativa excelente)
- [ ] Cloudflare Pages (Bandwidth ilimitado)
- [ ] VPS (Controle total)

### **Configuração:**

- [ ] Repositório GitHub conectado
- [ ] Pasta raiz configurada: `cashback-system`
- [ ] Framework detectado: Vite
- [ ] Build command: `npm run build`
- [ ] Output directory: `dist`

### **Variáveis de Ambiente:**

- [ ] `VITE_SUPABASE_URL` configurada
- [ ] `VITE_SUPABASE_ANON_KEY` configurada

### **Deploy Executado:**

- [ ] Build completou com sucesso
- [ ] Deploy finalizado
- [ ] URL de produção obtida (ex: `https://seu-projeto.vercel.app`)

---

## 🔒 SEGURANÇA

### **CORS Configurado:**

- [ ] Acessou Supabase → Settings → API → CORS
- [ ] Adicionou URL de produção
- [ ] Salvou as configurações

### **RLS Policies:**

Execute para verificar:

```sql
-- Ver todas as políticas ativas
SELECT schemaname, tablename, policyname 
FROM pg_policies
ORDER BY tablename;
```

**Deve ter políticas para:**
- [ ] merchants
- [ ] employees
- [ ] customers
- [ ] transactions
- [ ] redemptions
- [ ] marketing_spend

---

## 🧪 TESTES PÓS-DEPLOY

### **Funcionalidades Básicas:**

Acesse sua URL de produção e teste:

- [ ] ✅ Página inicial carrega
- [ ] ✅ Página de login aparece corretamente
- [ ] ✅ Consegue fazer login com credenciais de merchant
- [ ] ✅ Dashboard carrega com dados
- [ ] ✅ Não há erros no console do navegador (F12 → Console)

### **Funcionalidades do Merchant:**

- [ ] ✅ Dashboard mostra métricas
- [ ] ✅ Pode acessar página de Cashback
- [ ] ✅ QR Code é gerado corretamente
- [ ] ✅ Pode escanear QR Code
- [ ] ✅ Transação de cashback funciona
- [ ] ✅ Página de Resgate funciona
- [ ] ✅ QR Code de resgate é gerado
- [ ] ✅ Validação de resgate funciona

### **Funcionalidades de Configuração:**

- [ ] ✅ Pode acessar Configurações
- [ ] ✅ Aba "Geral" carrega e salva
- [ ] ✅ Aba "Cashback" permite alterar porcentagem
- [ ] ✅ Aba "Link de Cadastro" mostra URL e QR Code
- [ ] ✅ Aba "Marketing" salva GTM ID e Meta Pixel ID

### **Link de Cadastro de Clientes:**

- [ ] ✅ Link de cadastro é gerado: `/signup/seu-slug`
- [ ] ✅ Acessa link em aba anônima (sem login)
- [ ] ✅ Formulário de cadastro aparece
- [ ] ✅ Consegue cadastrar cliente com nome e telefone
- [ ] ✅ Cliente aparece na lista de Clientes
- [ ] ✅ Campo de email funciona (opcional)

### **Relatórios:**

- [ ] ✅ Gráficos carregam
- [ ] ✅ Métricas são exibidas corretamente
- [ ] ✅ Filtro de data funciona
- [ ] ✅ Calculadora de CAC/LTV funciona
- [ ] ✅ Consegue adicionar investimento em tráfego

### **Integrações:**

- [ ] ✅ Página de Integrações abre
- [ ] ✅ Pode configurar Mailchimp (se tiver)
- [ ] ✅ Pode configurar RD Station (se tiver)
- [ ] ✅ Configurações são salvas

---

## 🌐 DOMÍNIO PRÓPRIO (Opcional)

Se você quer usar domínio customizado:

- [ ] Domínio adicionado na plataforma (Vercel/Netlify/Cloudflare)
- [ ] DNS configurado (CNAME para cname.vercel-dns.com ou similar)
- [ ] Aguardou propagação (~15 min)
- [ ] HTTPS ativado automaticamente
- [ ] Domínio próprio adicionado no CORS do Supabase

---

## 📱 PREPARAR PARA CLIENTES

### **Material de Divulgação:**

- [ ] Link de cadastro copiado
- [ ] QR Code de cadastro baixado
- [ ] Material explicativo preparado (opcional)

### **Exemplo de Link:**

```
https://seu-projeto.vercel.app/signup/seu-slug
```

### **Instruções para Clientes:**

1. "Acesse o link para se cadastrar"
2. "Preencha seu nome e telefone"
3. "Comece a acumular cashback!"

---

## 📊 MONITORAMENTO

### **Plataforma de Deploy:**

- [ ] Dashboard da Vercel/Netlify/Cloudflare monitorado
- [ ] Configurou alertas (opcional)
- [ ] Analytics ativado (opcional)

### **Supabase:**

- [ ] Dashboard do Supabase monitorado
- [ ] Verificar uso de recursos
- [ ] Configurar backups (recomendado)

---

## 🔄 CI/CD CONFIGURADO

- [ ] ✅ Push para GitHub dispara build automático
- [ ] ✅ Deploy acontece automaticamente
- [ ] ✅ Notificações de deploy configuradas (opcional)

**Testar:** Faça uma pequena alteração e push:

```bash
# Fazer uma alteração mínima
echo "# Teste" >> README.md

# Commit e push
git add README.md
git commit -m "test: CI/CD"
git push origin main

# Aguardar ~2 minutos
# Verificar se deploy automático aconteceu
```

---

## 📝 DOCUMENTAÇÃO

### **Para Você:**

- [ ] Salvou URL de produção
- [ ] Salvou credenciais Supabase em local seguro
- [ ] Anotou slug de cadastro de clientes
- [ ] Documentou configurações customizadas (se houver)

### **Para Equipe (se aplicável):**

- [ ] Instruções de acesso compartilhadas
- [ ] Credenciais distribuídas com segurança
- [ ] Processo de suporte definido

---

## 🎉 LANÇAMENTO

### **Antes de Anunciar:**

- [ ] ✅ Todos os testes passaram
- [ ] ✅ Sem erros no console
- [ ] ✅ Performance aceitável
- [ ] ✅ Mobile responsivo testado
- [ ] ✅ Diferentes navegadores testados (Chrome, Firefox, Safari)

### **Comunicação:**

- [ ] Comunicado preparado para clientes
- [ ] Links e QR Codes prontos
- [ ] Suporte preparado para dúvidas

---

## 🆘 PLANO B

### **Em Caso de Problemas:**

**Se algo der errado após o deploy:**

1. **Reverter deploy:**
   - Vercel/Netlify: Usar rollback no dashboard
   - Cloudflare: Reverter para deployment anterior

2. **Verificar logs:**
   - Dashboard da plataforma → Logs
   - Supabase → Logs

3. **Verificar variáveis de ambiente:**
   - Conferir se `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` estão corretas

4. **Verificar CORS:**
   - Confirmar URL no Supabase

5. **Limpar cache:**
   - Browser cache (Ctrl+Shift+Delete)
   - CDN cache (na plataforma)

---

## ✅ RESUMO FINAL

**Antes de considerar "PRONTO PARA PRODUÇÃO":**

```
🗄️  BANCO:        ✅ Estrutura completa e corrigida
🚀 DEPLOY:        ✅ Build sucesso, site no ar
🔒 SEGURANÇA:     ✅ RLS + CORS configurados
🧪 TESTES:        ✅ Todas funcionalidades testadas
🌐 DOMÍNIO:       ✅ Configurado (se aplicável)
📱 DIVULGAÇÃO:    ✅ Links e QR Codes prontos
📊 MONITORAMENTO: ✅ Dashboards configurados
🎉 LANÇAMENTO:    ✅ Pronto para anunciar!
```

---

## 🎯 MÉTRICAS DE SUCESSO

Após 1 semana no ar, verifique:

- [ ] Número de clientes cadastrados
- [ ] Transações de cashback realizadas
- [ ] Resgates efetuados
- [ ] Taxa de conversão do link de cadastro
- [ ] Feedback dos clientes
- [ ] Performance do sistema
- [ ] Erros reportados (se houver)

---

## 🔄 MANUTENÇÃO CONTÍNUA

**Mensalmente:**

- [ ] Verificar uso de recursos (Supabase + Plataforma)
- [ ] Revisar logs de erro
- [ ] Atualizar dependências (npm update)
- [ ] Backup do banco de dados
- [ ] Revisar métricas de negócio

**A cada atualização:**

- [ ] Testar em ambiente local primeiro
- [ ] Fazer commit descritivo
- [ ] Push para GitHub (deploy automático)
- [ ] Verificar build na plataforma
- [ ] Testar funcionalidades afetadas

---

## 🎊 PARABÉNS!

**Se você completou este checklist:**

✅ Seu sistema está **PRONTO PARA PRODUÇÃO**  
✅ Todos os testes foram realizados  
✅ Segurança está configurada  
✅ Você está pronto para **LANÇAR**!

---

**🚀 SUCESSO NO SEU LANÇAMENTO! 🚀**

---

**📅 Data:** 2025-10-26  
**✅ Sistema:** Cashback para Pequenos Negócios Locais  
**🔗 Repo:** https://github.com/RaulRicco/CashBack  
**📦 Status:** Production Ready
