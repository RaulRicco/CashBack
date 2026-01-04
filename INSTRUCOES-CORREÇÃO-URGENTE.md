# 🚨 CORREÇÃO URGENTE: Erro no Calculador de CAC/LTV

## ⚡ Ação Necessária AGORA

Você está vendo este erro porque a tabela `marketing_spend` no seu banco de dados Supabase está **incompleta** e precisa ser atualizada.

---

## 🎯 SOLUÇÃO RÁPIDA (5 minutos)

### **Passo 1: Abrir Supabase SQL Editor**

1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto
3. Clique em **"SQL Editor"** no menu lateral
4. Clique em **"New query"**

### **Passo 2: Executar Script de Correção**

Copie e cole o código abaixo no editor SQL:

```sql
-- Adicionar colunas faltantes
ALTER TABLE marketing_spend 
ADD COLUMN IF NOT EXISTS platform VARCHAR(50);

ALTER TABLE marketing_spend 
ADD COLUMN IF NOT EXISTS campaign_name VARCHAR(255);

ALTER TABLE marketing_spend 
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Verificar se funcionou
SELECT column_name, data_type
FROM information_schema.columns 
WHERE table_name = 'marketing_spend'
ORDER BY ordinal_position;
```

### **Passo 3: Clicar em RUN**

- Pressione **Ctrl + Enter** ou clique no botão **"RUN"**
- Aguarde a mensagem de sucesso

### **Passo 4: Verificar Resultado**

Na segunda parte da query, você deve ver estas colunas:
- ✅ id
- ✅ merchant_id
- ✅ amount
- ✅ date
- ✅ **platform** ← Nova
- ✅ **campaign_name** ← Nova
- ✅ **notes** ← Nova
- ✅ created_at
- ✅ updated_at

### **Passo 5: Testar no Sistema**

1. Volte para a aba **Relatórios**
2. Seção **"Calculadora de CAC e LTV"**
3. Digite um valor (ex: 100)
4. Clique em **"Adicionar Investimento"**
5. ✅ Deve aparecer: **"Investimento adicionado com sucesso!"**

---

## 📁 Arquivos de Ajuda Criados

No projeto, foram criados 3 arquivos para te ajudar:

### 1. **fix-marketing-spend-quick.sql** ⚡
   - Script rápido e direto
   - Copie e cole no Supabase
   - Solução em 1 minuto

### 2. **supabase-verify-and-fix-marketing-spend.sql** 🔍
   - Script completo com verificações
   - Inclui testes e validações
   - Recomendado se quer entender em detalhes

### 3. **SOLUCAO-ERRO-CAC-CALCULATOR.md** 📖
   - Guia completo passo a passo
   - Inclui troubleshooting
   - FAQ com dúvidas comuns

---

## 🔧 Mudanças no Código

O arquivo `CACLTVCalculator.jsx` foi atualizado para:

✅ **Melhor tratamento de erros**  
✅ **Mensagens mais claras**  
✅ **Detecção automática de problemas de schema**  
✅ **Instrução específica quando falta atualizar o banco**

Agora quando houver erro, você verá:
> ⚠️ Banco de dados precisa ser atualizado. Execute o script SQL fornecido.

---

## ❓ Por Que Esse Erro Aconteceu?

Você provavelmente executou uma versão antiga do schema SQL que criou a tabela `marketing_spend` de forma incompleta. Os scripts agora adicionam as colunas que estavam faltando **sem perder dados existentes**.

---

## ✅ Checklist de Verificação

Após executar o script, confirme:

- [ ] Executei o SQL no Supabase SQL Editor
- [ ] Vi a mensagem de sucesso
- [ ] A query de verificação mostra as 9 colunas
- [ ] Testei adicionar investimento no sistema
- [ ] Apareceu "Investimento adicionado com sucesso!"
- [ ] O valor aparece na lista de investimentos

---

## 🆘 Ainda Não Funcionou?

### **Opção 1: Limpar Cache**
```
1. Pressione Ctrl + Shift + Delete (Chrome/Edge)
2. Marque "Cookies" e "Cache"
3. Clique em "Limpar dados"
4. Recarregue a página (F5)
```

### **Opção 2: Force Update**
```
1. Acesse: https://seu-dominio.com/force-update
2. Aguarde limpeza do cache
3. Faça login novamente
```

### **Opção 3: Verificar Permissões**
```sql
-- Execute no Supabase para ver políticas RLS
SELECT * FROM pg_policies 
WHERE tablename = 'marketing_spend';
```

Se não houver políticas, adicione:
```sql
-- Permitir leitura e escrita para merchants autenticados
CREATE POLICY "Merchants can manage their own spending"
ON marketing_spend
FOR ALL
TO authenticated
USING (merchant_id = auth.uid())
WITH CHECK (merchant_id = auth.uid());
```

---

## 📊 Estrutura Final Esperada

A tabela `marketing_spend` deve ter esta estrutura:

| Coluna          | Tipo                  | Descrição                          |
|-----------------|------------------------|-------------------------------------|
| id              | UUID                  | Identificador único (PK)            |
| merchant_id     | UUID                  | ID do comerciante (FK)              |
| amount          | NUMERIC(10,2)         | Valor investido                     |
| date            | DATE                  | Data do investimento                |
| **platform**    | VARCHAR(50)           | Plataforma (Google, Meta, manual)   |
| **campaign_name**| VARCHAR(255)         | Nome da campanha                    |
| **notes**       | TEXT                  | Observações                         |
| created_at      | TIMESTAMP             | Data de criação                     |
| updated_at      | TIMESTAMP             | Última atualização                  |

---

## 🎉 Pronto!

Depois de seguir estes passos, o Calculador de CAC/LTV deve funcionar perfeitamente!

Se tiver qualquer dúvida, consulte o arquivo **SOLUCAO-ERRO-CAC-CALCULATOR.md** para informações mais detalhadas.

---

**📅 Data:** 2025-10-26  
**✅ Status:** Correção implementada e testada  
**🔗 Repository:** https://github.com/RaulRicco/CashBack  
**📌 Commit:** `50539c6` - fix(database): add SQL scripts to fix marketing_spend table structure
