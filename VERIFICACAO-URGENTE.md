# ⚠️ VERIFICAÇÃO URGENTE - Por Que as Funcionalidades Não Aparecem?

## 🔍 Diagnóstico

Se você não está vendo as novas funcionalidades (Configurações no menu, etc), pode ser por um destes motivos:

### 1. ❌ SQL NÃO FOI EXECUTADO NO SUPABASE (Mais Provável)

**PROBLEMA:** O banco de dados não tem os novos campos necessários.

**SOLUÇÃO:**
1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em **SQL Editor** (menu lateral esquerdo)
4. Clique em **New Query** (botão superior direito)
5. Abra o arquivo `supabase-migration-updates.sql` do projeto
6. Copie **TODO** o conteúdo (Ctrl+A, Ctrl+C)
7. Cole no SQL Editor do Supabase (Ctrl+V)
8. Clique em **RUN** (botão verde) ou pressione Ctrl+Enter
9. Aguarde até aparecer "Success. No rows returned"

**⚠️ SEM ESTE PASSO, AS FUNCIONALIDADES NÃO VÃO FUNCIONAR!**

---

### 2. 🔄 Cache do Navegador

**PROBLEMA:** Navegador está usando versão antiga em cache.

**SOLUÇÃO:**
1. **Limpar Cache Completo:**
   - Chrome/Edge: Ctrl+Shift+Delete → Selecione "Cached images and files" → Clear
   - Firefox: Ctrl+Shift+Delete → Selecione "Cache" → Clear

2. **OU Forçar Reload:**
   - Pressione Ctrl+Shift+R (Windows/Linux)
   - Pressione Cmd+Shift+R (Mac)

3. **OU Use Aba Anônima:**
   - Ctrl+Shift+N (Chrome)
   - Ctrl+Shift+P (Firefox)

---

### 3. 🔐 Sessão Antiga no LocalStorage

**PROBLEMA:** Dados antigos do merchant não têm os novos campos.

**SOLUÇÃO:**
1. Faça **LOGOUT** da aplicação
2. Limpe o LocalStorage:
   - Pressione F12 (abrir DevTools)
   - Vá na aba "Application" ou "Armazenamento"
   - Clique em "Local Storage"
   - Clique com botão direito → "Clear"
3. Feche e abra o navegador
4. Faça LOGIN novamente

---

## ✅ Como Verificar se Está Funcionando

### Teste 1: Menu de Configurações
1. Faça login com `admin@cashback.com`
2. Olhe o menu lateral esquerdo
3. Deve haver um item **"Configurações"** com ícone de engrenagem

### Teste 2: SQL Foi Executado?
Execute este SQL no Supabase para verificar:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'merchants' 
AND column_name IN ('custom_domain', 'gtm_id', 'meta_pixel_id', 'signup_link_slug');
```

**Resultado esperado:** 4 linhas retornadas
**Se retornar 0 linhas:** Você NÃO executou o SQL de atualização!

### Teste 3: Acessar Diretamente
Digite na barra de endereços:
```
https://5179-iissidqg3y4yqs2mu7iw2-2b54fc91.sandbox.novita.ai/settings
```

**Se aparecer erro 404 ou página em branco:** Provavelmente não limpou o cache.

---

## 🆘 Checklist de Solução

Marque o que você já fez:

- [ ] Executei o SQL `supabase-migration-updates.sql` no Supabase
- [ ] Vi a mensagem "Success" após executar o SQL
- [ ] Limpei o cache do navegador (Ctrl+Shift+Delete)
- [ ] Fiz logout da aplicação
- [ ] Limpei o LocalStorage (F12 → Application → Local Storage → Clear)
- [ ] Fechei e abri o navegador novamente
- [ ] Fiz login novamente com `admin@cashback.com`

---

## 🎯 Nova URL da Aplicação (Cache Limpo)

# 👉 https://5179-iissidqg3y4yqs2mu7iw2-2b54fc91.sandbox.novita.ai

**IMPORTANTE:** Use esta nova URL (porta 5179) pois o servidor foi reiniciado com cache totalmente limpo.

---

## 📋 O Que Você Deve Ver Após Resolver

### No Menu Lateral:
- Dashboard
- Cashback
- Resgate
- Clientes
- Funcionários
- Relatórios
- Integrações
- **Configurações** ← NOVO

### Na Página de Configurações (4 abas):
1. **Geral** - Nome e telefone
2. **Cashback** - Percentual configurável
3. **Link de Cadastro** - Link compartilhável
4. **Marketing** - GTM e Meta Pixel

---

## 🐛 Ainda Não Funciona?

Execute este teste no Console do navegador (F12 → Console):

```javascript
// Cole isto e pressione Enter
fetch('/src/pages/Settings.jsx')
  .then(r => r.text())
  .then(t => console.log('Settings.jsx existe:', t.length > 1000))
  .catch(e => console.log('Erro:', e));
```

**Resultado esperado:** `Settings.jsx existe: true`

Se der erro ou false, há um problema com o servidor/build.

---

## 💡 Solução Definitiva (Se Nada Funcionar)

1. **Feche TODAS as abas do navegador**
2. **Abra uma nova aba anônima** (Ctrl+Shift+N)
3. **Acesse:** https://5179-iissidqg3y4yqs2mu7iw2-2b54fc91.sandbox.novita.ai
4. **Faça login** com admin@cashback.com
5. **Verifique o menu lateral** - deve ter "Configurações"

Se ainda não aparecer, me avise e vou investigar mais profundamente.

---

## 📞 Debug Adicional

Se quiser me ajudar a debugar, me envie:

1. **Screenshot do menu lateral** após fazer login
2. **Console do navegador** (F12 → Console → screenshot de qualquer erro em vermelho)
3. **Resultado do SQL de verificação** (query acima)

---

## ✅ Tudo Funcionou?

Se funcionou, você deve conseguir:
- ✅ Ver "Configurações" no menu
- ✅ Configurar o percentual de cashback
- ✅ Copiar o link de cadastro
- ✅ Configurar GTM e Meta Pixel

**Aproveite o sistema completo! 🚀**
