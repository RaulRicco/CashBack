# 🚀 COMANDOS DE DEPLOY DIRETO NO SERVIDOR

## Execute estes comandos NO SERVIDOR DE PRODUÇÃO

```bash
# 1. Navegue para o diretório do projeto (ajuste o caminho se necessário)
cd /var/www/cashback-system

# 2. Faça backup (segurança)
cp -r . ../cashback-backup-$(date +%Y%m%d-%H%M%S)

# 3. Puxe o código atualizado
git fetch origin
git checkout genspark_ai_developer
git pull origin genspark_ai_developer

# 4. Instale dependências
npm install

# 5. Build do projeto
npm run build

# 6. Reinicie o servidor (escolha UM dos comandos abaixo)

# Se usa PM2:
pm2 restart cashback-system

# OU se usa systemd:
sudo systemctl restart cashback-system

# OU se usa nginx com arquivos estáticos:
sudo cp -r dist/* /var/www/html/
sudo systemctl reload nginx
```

## ✅ Pronto!

O deploy está completo. Agora teste:

1. Acesse: `https://seudominio.com/customer/login/SLUG`
2. Clique em "Esqueci minha senha"
3. Digite um telefone de cliente que tenha email cadastrado
4. Verifique se o email chegou

## 📊 Verificar logs (se necessário)

```bash
# Se usa PM2:
pm2 logs cashback-system

# Se usa systemd:
sudo journalctl -u cashback-system -f

# Nginx:
sudo tail -f /var/log/nginx/error.log
```

## 🔥 Se algo der errado

Restaure o backup:
```bash
cd /var/www
rm -rf cashback-system
cp -r cashback-backup-XXXXXX cashback-system
pm2 restart cashback-system
```
