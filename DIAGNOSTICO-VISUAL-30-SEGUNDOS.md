# 🔍 DIAGNÓSTICO VISUAL - 30 SEGUNDOS

## 🎯 OBJETIVO
Ver com seus próprios olhos onde está o problema!

---

## 📸 PASSO 1: VERIFICAR SE O ARQUIVO EXISTE (15 segundos)

### Ações:
1. Abra: https://supabase.com/dashboard
2. Selecione seu projeto (provavelmente "Cashback System" ou similar)
3. No menu lateral esquerdo, clique: **Storage**
4. Clique no bucket: **merchant-assets**
5. Clique na pasta: **logos**

### O que você vê?

#### ✅ CENÁRIO A: Vejo arquivos PNG/JPG dentro da pasta

```
📁 logos/
   ├── d1de704a-2b5b-4b5d-a675-a413c965f16c-1762951517388.png
   ├── d1de704a-2b5b-4b5d-a675-a413c965f16c-1762951941910.png
   └── outro-arquivo.png
```

**DIAGNÓSTICO:** ✅ Upload funciona! Arquivo está no Supabase.
**PROBLEMA:** Políticas de acesso público não configuradas.
**SOLUÇÃO:** Execute `SQL-EMERGENCIA-COPIE-COLE.sql`

---

#### ❌ CENÁRIO B: A pasta está vazia

```
📁 logos/
   (vazio)
```

**DIAGNÓSTICO:** ❌ Upload está falhando silenciosamente
**PROBLEMA:** Código JavaScript não está salvando o arquivo
**SOLUÇÃO:** 
1. Substitua o código em `WhiteLabelSettings.jsx` 
2. Use arquivo: `fix-handleLogoUpload.jsx`

---

#### ⚠️ CENÁRIO C: A pasta "logos" não existe

```
📁 merchant-assets/
   (vazio, sem pasta logos)
```

**DIAGNÓSTICO:** ⚠️ Sistema nunca tentou fazer upload
**PROBLEMA:** Possivelmente erro antes de chegar no upload
**SOLUÇÃO:** Verifique console do navegador (F12) ao tentar upload

---

## 🌐 PASSO 2: VERIFICAR ACESSO PÚBLICO (15 segundos)

### Se você viu arquivos no PASSO 1, faça este teste:

1. **NO SUPABASE DASHBOARD**, ainda na pasta `logos/`
2. Clique em um dos arquivos (ex: `...1762951941910.png`)
3. Procure e clique no botão: **"Get URL"** ou **"Copy URL"**
4. Cole a URL em uma **NOVA ABA DO NAVEGADOR**
5. Pressione Enter

### O que aconteceu?

#### ✅ CENÁRIO A: A imagem apareceu!

```
[🖼️ Imagem da logo aparece no navegador]
```

**DIAGNÓSTICO:** ✅ Arquivo existe e é acessível!
**PROBLEMA:** Cache do navegador ou código desatualizado
**SOLUÇÃO:**
1. Pressione Ctrl+Shift+R no sistema
2. Faça login novamente
3. Tente upload novamente

---

#### ❌ CENÁRIO B: Erro 403 - Forbidden

```json
{
  "statusCode": "403",
  "error": "Forbidden",
  "message": "Access to this resource is forbidden"
}
```

**DIAGNÓSTICO:** ❌ Arquivo existe mas sem acesso público
**PROBLEMA:** Políticas de Storage não configuradas
**SOLUÇÃO:** Execute `SQL-EMERGENCIA-COPIE-COLE.sql`

---

#### ❌ CENÁRIO C: Erro 404 - Not Found

```json
{
  "statusCode": "404",
  "error": "Not Found",
  "message": "The resource you requested could not be found"
}
```

**DIAGNÓSTICO:** ❌ Arquivo não existe ou foi deletado
**PROBLEMA:** Upload falhou ou arquivo foi removido
**SOLUÇÃO:** Tente fazer upload novamente

---

## 📊 TABELA DE DIAGNÓSTICO RÁPIDO

| O que você vê no Storage | O que aparece na URL | Problema | Arquivo a usar |
|---------------------------|---------------------|----------|----------------|
| ✅ Arquivos na pasta | ✅ Imagem aparece | Cache | Ctrl+Shift+R |
| ✅ Arquivos na pasta | ❌ Erro 403 | Sem política | SQL-EMERGENCIA-COPIE-COLE.sql |
| ✅ Arquivos na pasta | ❌ Erro 404 | Nome errado | TESTE-RAPIDO-AGORA.md |
| ❌ Pasta vazia | - | Upload falha | fix-handleLogoUpload.jsx |
| ❌ Sem pasta logos | - | Nunca tentou | GUIA-COMPLETO-FIX-LOGO.md |

---

## 🎬 EXEMPLO VISUAL

### Se tudo estiver certo, você verá:

```
📍 Supabase Dashboard → Storage → merchant-assets → logos
┌─────────────────────────────────────────────────────┐
│ 📁 logos                                            │
│                                                     │
│ 📄 d1de...1762951941910.png     (24 KB)   Há 3 min│
│ 📄 d1de...1762951517388.png     (31 KB)   Há 8 min│
│                                                     │
│ [+ Upload new file]                                 │
└─────────────────────────────────────────────────────┘

Ao clicar em um arquivo → Get URL:
https://zxiehkdtsoeauqouwxvi.supabase.co/storage/v1/object/public/merchant-assets/logos/d1de704a-2b5b-4b5d-a675-a413c965f16c-1762951941910.png

Ao abrir a URL no navegador:
┌─────────────────────────────────────────────────────┐
│ 🌐 https://zxiehkdtsoeauqouwxvi.supabase.co/...   │
│                                                     │
│                  [🖼️ LOGO APARECE]                 │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 📋 PRÓXIMOS PASSOS BASEADOS NO QUE VOCÊ VIU

### Se viu: ✅ Arquivos + ❌ Erro 403
```bash
1. Execute: SQL-EMERGENCIA-COPIE-COLE.sql
2. Aguarde 10 segundos
3. Teste URL novamente no navegador
4. Deve aparecer a imagem!
```

### Se viu: ❌ Pasta vazia
```bash
1. Vá no sistema, abra Console (F12)
2. Tente fazer upload
3. Procure erros em vermelho
4. Tire screenshot e me envie
5. Vou te dar o código corrigido
```

### Se viu: ✅ Arquivos + ✅ Imagem na URL
```bash
1. Pressione Ctrl+Shift+R no sistema
2. Faça login novamente
3. Vá em Configurações White Label
4. A logo deve aparecer agora!
```

---

## ⏰ TEMPO TOTAL: 30 SEGUNDOS

- PASSO 1: 15 segundos (ver Storage)
- PASSO 2: 15 segundos (testar URL)

---

## 🎯 DEPOIS DESTE DIAGNÓSTICO

Você vai saber EXATAMENTE:
- ✅ Se o arquivo está no Supabase ou não
- ✅ Se o arquivo é acessível publicamente
- ✅ Qual solução aplicar

**AGORA FAÇA OS 2 PASSOS E ME DIGA O QUE VIU!** 👀
