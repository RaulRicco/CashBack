# 🚀 INSTRUÇÕES PARA O SERVIDOR DE PRODUÇÃO

## ✅ STATUS ATUAL

- ✅ **Código atualizado**: `contentType: file.type` está presente
- ✅ **Servidor rodando**: Vite na porta 3000
- ⚠️ **Ação necessária**: Limpar storage e fazer novo upload

---

## 📋 PASSO 1: LIMPAR STORAGE (Execute no Supabase SQL Editor)

Acesse o Supabase Dashboard → SQL Editor e execute:

```sql
-- Deletar TODOS os arquivos corrompidos
DELETE FROM storage.objects WHERE bucket_id = 'merchant-assets';

-- Limpar logo_url do merchant
UPDATE merchants SET logo_url = NULL 
WHERE id = '10bce3c4-6637-4e56-8792-8d815d8763da';

-- Verificar limpeza (DEVE retornar 0)
SELECT COUNT(*) as total_objetos FROM storage.objects WHERE bucket_id = 'merchant-assets';
```

**✅ Resultado esperado**: `total_objetos = 0`

---

## 📋 PASSO 2: REINICIAR SERVIDOR (Aplicar código atualizado)

No terminal do servidor (como root ou user):

```bash
# Matar todos os processos Node/Vite antigos
pkill -f "vite"
pkill -f "node.*cashback"

# Aguardar 2 segundos
sleep 2

# Iniciar servidor limpo
cd /home/user/webapp/cashback-system
su - user -c "cd /home/user/webapp/cashback-system && npm run dev > /tmp/vite.log 2>&1 &"

# Verificar se iniciou
sleep 3
ps aux | grep vite | grep -v grep
```

**✅ Deve aparecer**: Processo `node .../vite` rodando

---

## 📋 PASSO 3: VERIFICAR SERVIDOR

```bash
# Ver logs do servidor
tail -f /tmp/vite.log

# Testar se está respondendo
curl -I http://localhost:5173
```

**✅ Deve aparecer**: `HTTP/1.1 200 OK`

---

## 📋 PASSO 4: LIMPAR CACHE DO NAVEGADOR

**⚠️ CRÍTICO**: O JavaScript fica em cache no navegador!

### Opção A - Aba Anônima (RECOMENDADO)
1. Feche TODAS as abas do dashboard
2. Abra aba anônima:
   - Chrome/Edge: `Ctrl+Shift+N`
   - Firefox: `Ctrl+Shift+P`
3. Acesse seu domínio em produção

### Opção B - Hard Reload
1. Abra DevTools: `F12`
2. Clique direito no botão refresh (🔄)
3. Selecione: **"Limpar cache e recarregar completo"**

---

## 📋 PASSO 5: FAZER NOVO UPLOAD

1. Acesse: https://seu-dominio.com/dashboard/white-label **em aba anônima**
2. Faça login como merchant
3. Seção "Logo da Marca"
4. Clique "Escolher logo"
5. Selecione imagem (JPG/PNG, até 2MB)
6. Aguarde: **"Logo carregada com sucesso!"**
7. Clique: **"Salvar Configurações"**

---

## 📋 PASSO 6: VERIFICAR RESULTADO

Execute no Supabase SQL Editor:

```sql
SELECT 
    name,
    metadata->>'mimetype' as mime_type,
    metadata->>'cacheControl' as cache_control,
    pg_size_pretty((metadata->>'size')::bigint) as file_size,
    created_at
FROM storage.objects 
WHERE bucket_id = 'merchant-assets'
ORDER BY created_at DESC
LIMIT 1;
```

### ✅ RESULTADO ESPERADO:
| Campo | Valor Correto |
|-------|---------------|
| `mime_type` | `image/jpeg` ou `image/png` (NÃO `application/json`) ✅ |
| `cache_control` | `3600` (NÃO `no-cache`) ✅ |
| `file_size` | Entre `50 KB` e `500 KB` ✅ |

### ❌ SE AINDA APARECER `application/json`:
Significa que você não limpou o cache do navegador. Use **ABA ANÔNIMA**.

---

## 🔧 COMANDOS ÚTEIS NO SERVIDOR

### Verificar código atualizado:
```bash
grep "contentType" /home/user/webapp/cashback-system/src/pages/WhiteLabelSettings.jsx
```
**Deve aparecer**: `contentType: file.type, // IMPORTANTE`

### Ver processos Node rodando:
```bash
ps aux | grep -E "(node|vite)" | grep -v grep
```

### Reiniciar servidor (método completo):
```bash
# Parar todos os processos
pkill -9 -f "node.*vite"
pkill -9 -f "node.*cashback"

# Iniciar limpo
cd /home/user/webapp/cashback-system
nohup npm run dev > /tmp/vite.log 2>&1 &

# Ver logs
tail -f /tmp/vite.log
```

### Ver logs em tempo real:
```bash
tail -f /tmp/vite.log
```

---

## 📊 RESUMO DO QUE MUDOU

| Item | Antes | Depois |
|------|-------|--------|
| **Código** | Sem `contentType` ❌ | Com `contentType: file.type` ✅ |
| **mime_type no storage** | `application/json` ❌ | `image/jpeg` ✅ |
| **cache_control** | `no-cache` ❌ | `3600` ✅ |
| **URL acessível** | Mostra JSON ❌ | Mostra imagem ✅ |

---

## 🎯 CHECKLIST FINAL

Antes de fazer o upload, confirme:

- [ ] ✅ Executei o SQL de limpeza no Supabase
- [ ] ✅ Storage está vazio (COUNT = 0)
- [ ] ✅ Reiniciei o servidor Node/Vite
- [ ] ✅ Abri em **ABA ANÔNIMA** (Ctrl+Shift+N)
- [ ] ✅ Fiz o upload do logo
- [ ] ✅ Salvei as configurações
- [ ] ✅ Verifiquei com a query SQL

Se todos os passos acima foram feitos, o `mime_type` DEVE ser `image/jpeg` e a imagem DEVE aparecer!

---

## 📞 AINDA COM PROBLEMA?

Se após seguir TODOS os passos ainda aparecer `application/json`, me envie:

1. Resultado de: `grep "contentType" /home/user/webapp/cashback-system/src/pages/WhiteLabelSettings.jsx`
2. Resultado da query de verificação
3. Confirmação: Você usou aba anônima? (Sim/Não)
4. Screenshot do Console do navegador (F12 → Console) durante o upload

---

**Data**: 2025-11-11  
**Servidor**: srv1087147  
**Caminho**: /home/user/webapp/cashback-system
