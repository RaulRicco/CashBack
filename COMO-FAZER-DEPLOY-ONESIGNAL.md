# 🔔 Como Fazer Deploy do OneSignal - PASSO A PASSO

## 📋 O Que Você Precisa Fazer

Você precisa executar **1 script** no seu servidor de produção.

---

## 🚀 INSTRUÇÕES COMPLETAS

### **Passo 1: Conectar no Servidor**

Abra seu terminal SSH e conecte no servidor:

```bash
ssh ubuntu@SEU_SERVIDOR
```

*(Substitua `SEU_SERVIDOR` pelo IP ou domínio do seu servidor)*

---

### **Passo 2: Baixar o Script de Deploy**

No servidor, execute:

```bash
cd /var/www/cashback/cashback-system
git pull origin main
```

Isso vai baixar o script `DEPLOY-ONESIGNAL-PRODUCAO.sh` que eu criei.

---

### **Passo 3: Dar Permissão de Execução**

```bash
chmod +x DEPLOY-ONESIGNAL-PRODUCAO.sh
```

---

### **Passo 4: Executar o Deploy**

```bash
./DEPLOY-ONESIGNAL-PRODUCAO.sh
```

O script vai:
- ✅ Baixar código atualizado do GitHub
- ✅ Adicionar variáveis de ambiente OneSignal
- ✅ Fazer build de produção
- ✅ Recarregar nginx
- ✅ Verificar se OneSignal está no bundle

**Tempo estimado: 2-3 minutos**

---

## 🧪 TESTAR DEPOIS DO DEPLOY

### **1. Limpar Cache do Navegador**

```
1. Abra Chrome/Edge
2. Pressione: Ctrl + Shift + Delete
3. Marque: "Imagens e arquivos em cache"
4. Período: "Todo o período"
5. Clique: "Limpar dados"
6. FECHE o navegador completamente
7. Abra novamente
```

### **2. Testar Notificações**

```
1. Acesse: https://localcashback.com.br

2. Popup do OneSignal vai aparecer
   → Clique em "PERMITIR" notificações

3. Faça login no admin

4. Vá em: "Notificações Push"

5. Preencha:
   - Título: 🎉 Teste OneSignal
   - Mensagem: Funcionou!

6. Clique: "Enviar Notificação Push"

7. Resultado esperado:
   ✅ "Notificação enviada para X clientes!"
   ✅ Notificação aparece no navegador
```

---

## ❌ Se Der Erro

### **Erro 1: "Authentication failed" no git pull**

```bash
# Configure o git com seu token
git config --global credential.helper store
git pull origin main
# Digite seu usuário e token quando pedir
```

### **Erro 2: "npm: command not found"**

```bash
# Instalar Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### **Erro 3: "Permission denied" no nginx reload**

```bash
# Dar permissão sudo sem senha para nginx
echo "ubuntu ALL=(ALL) NOPASSWD: /bin/systemctl reload nginx" | sudo tee /etc/sudoers.d/nginx-reload
```

### **Erro 4: Notificação não aparece no teste**

1. Verifique se clicou em "PERMITIR" no popup
2. Limpe o cache do navegador COMPLETAMENTE
3. Feche TODAS as abas do site
4. Abra uma nova aba e teste novamente

---

## 📞 Se Precisar de Ajuda

1. Copie a mensagem de erro completa
2. Me envie aqui no chat
3. Eu te ajudo a resolver

---

## ✅ Como Saber se Funcionou?

Depois de fazer o deploy, você pode verificar:

```bash
cd /var/www/cashback/cashback-system
grep -o "onesignal" dist/assets/index-*.js
```

Se aparecer **"onesignal"**, está funcionando! ✅

---

## 📚 Documentação Completa

Depois que tudo funcionar, leia a documentação completa:

```bash
cat /var/www/cashback/cashback-system/ONESIGNAL-PRONTO.md
```

Lá tem:
- ✅ Como usar
- ✅ Templates de notificações
- ✅ Custos (10.000 usuários grátis)
- ✅ Melhores práticas
- ✅ Troubleshooting

---

## 🎯 RESUMO - COMANDOS PARA COPIAR E COLAR

```bash
# 1. Conectar no servidor
ssh ubuntu@SEU_SERVIDOR

# 2. Ir para o diretório e baixar código
cd /var/www/cashback/cashback-system
git pull origin main

# 3. Dar permissão e executar
chmod +x DEPLOY-ONESIGNAL-PRODUCAO.sh
./DEPLOY-ONESIGNAL-PRODUCAO.sh

# 4. Verificar se funcionou
grep -o "onesignal" dist/assets/index-*.js
```

**Pronto! É só isso!** 🚀

---

**Criado em:** 2024-11-01  
**Autor:** Claude (Assistente AI)  
**Versão:** 1.0
