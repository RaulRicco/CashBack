# 🚀 Deploy na Hostinger VPS

## 📋 Pré-requisitos

- ✅ VPS Hostinger contratado
- ✅ Acesso SSH ao servidor
- ✅ Domínio: localcashback.com.br
- ✅ Código no GitHub

---

## ⚙️ Especificações Mínimas do VPS

- **CPU**: 1 core
- **RAM**: 1 GB
- **Disco**: 20 GB
- **Sistema**: Ubuntu 22.04 LTS (recomendado)

---

## 🎯 Passo a Passo Completo

### **Etapa 1: Contratar VPS na Hostinger**

1. Acesse: https://www.hostinger.com.br/vps-hospedagem
2. Escolha o plano **VPS 1** (mais barato, suficiente para começar)
3. Durante a configuração:
   - Sistema Operacional: **Ubuntu 22.04**
   - Localização: **Brasil** (São Paulo)
4. Anote as credenciais SSH que a Hostinger vai enviar por email

---

### **Etapa 2: Conectar ao VPS via SSH**

**No Windows (PowerShell ou CMD):**
```bash
ssh root@seu-ip-do-vps
```

**No Mac/Linux (Terminal):**
```bash
ssh root@seu-ip-do-vps
```

Digite a senha quando solicitado.

---

### **Etapa 3: Atualizar Sistema e Instalar Dependências**

```bash
# Atualizar sistema
apt update && apt upgrade -y

# Instalar Node.js 20 (LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Instalar Nginx (servidor web)
apt install -y nginx

# Instalar Certbot (SSL grátis)
apt install -y certbot python3-certbot-nginx

# Instalar Git
apt install -y git

# Verificar instalações
node --version  # Deve mostrar v20.x
npm --version   # Deve mostrar 10.x
nginx -v        # Deve mostrar nginx version
```

---

### **Etapa 4: Clonar Repositório do GitHub**

```bash
# Criar diretório para aplicações
mkdir -p /var/www
cd /var/www

# Clonar repositório
git clone https://github.com/RaulRicco/CashBack.git cashback

# Entrar no diretório do projeto
cd cashback/cashback-system

# Instalar dependências
npm install

# Criar arquivo .env com variáveis do Supabase
cat > .env << 'EOF'
VITE_SUPABASE_URL=https://mtylboaluqswdkgljgsd.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10eWxib2FsdXFzd2RrZ2xqZ3NkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0Nzc5OTAsImV4cCI6MjA3NzA1Mzk5MH0.heq_wso726i0TJSWTMzIWoD61GXnEWzkFw3Iy06YSqI
EOF

# Fazer build do projeto
npm run build
```

Aguarde ~2-3 minutos. Quando terminar, você terá uma pasta `dist/` com os arquivos prontos.

---

### **Etapa 5: Configurar Nginx**

```bash
# Criar configuração do site
nano /etc/nginx/sites-available/localcashback
```

Cole este conteúdo (pressione Ctrl+Shift+V):

```nginx
server {
    listen 80;
    server_name localcashback.com.br www.localcashback.com.br;
    
    root /var/www/cashback/cashback-system/dist;
    index index.html;

    # Logs
    access_log /var/log/nginx/localcashback-access.log;
    error_log /var/log/nginx/localcashback-error.log;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript application/json;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # SPA - todas as rotas vão para index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache para assets estáticos
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Cache para index.html (sem cache)
    location = /index.html {
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }
}
```

Pressione **Ctrl+X**, depois **Y**, depois **Enter** para salvar.

```bash
# Ativar site
ln -s /etc/nginx/sites-available/localcashback /etc/nginx/sites-enabled/

# Remover site padrão
rm /etc/nginx/sites-enabled/default

# Testar configuração
nginx -t

# Se aparecer "test is successful", reiniciar Nginx
systemctl restart nginx
```

---

### **Etapa 6: Configurar DNS no Painel da Hostinger**

1. Acesse o painel da Hostinger: https://hpanel.hostinger.com
2. Vá em **Domínios** → **localcashback.com.br**
3. Clique em **Gerenciar**
4. Vá em **DNS / Nameservers**
5. Adicione/edite estes registros:

```
Tipo: A
Nome: @
Valor: [IP DO SEU VPS]
TTL: 3600

Tipo: A
Nome: www
Valor: [IP DO SEU VPS]
TTL: 3600
```

**IMPORTANTE**: Use o IP do seu VPS que a Hostinger forneceu!

6. Clique em **Salvar**

Aguarde 5-30 minutos para propagação DNS.

---

### **Etapa 7: Instalar SSL (HTTPS Grátis)**

Aguarde o DNS propagar (teste com `ping localcashback.com.br`).

Quando o DNS estiver funcionando:

```bash
# Instalar certificado SSL
certbot --nginx -d localcashback.com.br -d www.localcashback.com.br

# Responda as perguntas:
# Email: seu-email@example.com
# Termos: A (Agree)
# Newsletter: N (No)
# Redirect HTTP para HTTPS: 2 (Yes)
```

O Certbot vai:
- ✅ Gerar certificado SSL grátis
- ✅ Configurar Nginx para HTTPS
- ✅ Redirecionar HTTP → HTTPS automaticamente
- ✅ Renovar certificado automaticamente

---

### **Etapa 8: Configurar Renovação Automática do SSL**

```bash
# Testar renovação
certbot renew --dry-run

# Configurar renovação automática
systemctl enable certbot.timer
systemctl start certbot.timer
```

Pronto! O SSL será renovado automaticamente a cada 90 dias.

---

### **Etapa 9: Configurar Deploy Automático (Opcional)**

Para atualizar o site automaticamente quando fizer `git push`:

```bash
# Criar script de deploy
nano /var/www/deploy.sh
```

Cole este conteúdo:

```bash
#!/bin/bash

echo "🚀 Iniciando deploy..."

cd /var/www/cashback/cashback-system

echo "📥 Baixando atualizações..."
git pull origin main

echo "📦 Instalando dependências..."
npm install

echo "🏗️ Fazendo build..."
npm run build

echo "♻️ Reiniciando Nginx..."
systemctl reload nginx

echo "✅ Deploy concluído!"
```

Salve (Ctrl+X, Y, Enter) e dê permissão de execução:

```bash
chmod +x /var/www/deploy.sh
```

Agora, sempre que quiser atualizar o site:

```bash
/var/www/deploy.sh
```

---

## 🧪 Testar o Site

1. Acesse: **https://localcashback.com.br**
2. Deve aparecer o sistema de cashback
3. ✅ Cadeado verde (HTTPS)
4. ✅ Login funcionando
5. ✅ Todas as funcionalidades OK

---

## 🔒 Segurança Adicional (Recomendado)

### Configurar Firewall

```bash
# Instalar UFW
apt install -y ufw

# Permitir SSH
ufw allow 22/tcp

# Permitir HTTP e HTTPS
ufw allow 80/tcp
ufw allow 443/tcp

# Ativar firewall
ufw --force enable

# Verificar status
ufw status
```

### Criar Usuário Não-Root

```bash
# Criar usuário
adduser deploy

# Adicionar ao grupo sudo
usermod -aG sudo deploy

# Mudar dono dos arquivos
chown -R deploy:deploy /var/www/cashback

# Testar login
su - deploy
```

Depois, use esse usuário ao invés de root.

---

## 📊 Monitoramento

### Ver Logs do Nginx

```bash
# Logs de acesso
tail -f /var/log/nginx/localcashback-access.log

# Logs de erro
tail -f /var/log/nginx/localcashback-error.log
```

### Ver Status do Sistema

```bash
# CPU e RAM
htop

# Espaço em disco
df -h

# Processos
ps aux | grep nginx
```

---

## 🔄 Atualizar o Site

Sempre que fizer mudanças no código:

```bash
# No seu computador
git add .
git commit -m "suas alterações"
git push origin main

# No VPS
/var/www/deploy.sh
```

---

## 💰 Custo Mensal

| Item | Valor |
|------|-------|
| VPS Hostinger (plano básico) | ~R$ 20-30/mês |
| Domínio (se não tiver) | ~R$ 40/ano |
| SSL | GRÁTIS (Let's Encrypt) |
| **TOTAL** | **~R$ 20-30/mês** |

---

## 🐛 Troubleshooting

### Site não carrega
```bash
# Verificar se Nginx está rodando
systemctl status nginx

# Reiniciar Nginx
systemctl restart nginx

# Verificar logs de erro
tail -50 /var/log/nginx/localcashback-error.log
```

### DNS não propaga
```bash
# Testar DNS
nslookup localcashback.com.br
ping localcashback.com.br

# Aguardar até 24h
```

### SSL não instala
```bash
# Verificar se porta 80 está aberta
netstat -tlnp | grep :80

# Verificar DNS
ping localcashback.com.br

# Logs do Certbot
certbot certificates
```

### Build falha
```bash
# Verificar espaço em disco
df -h

# Limpar cache do npm
npm cache clean --force

# Instalar novamente
cd /var/www/cashback/cashback-system
rm -rf node_modules
npm install
npm run build
```

---

## ✅ Checklist de Deploy

- [ ] VPS contratado e acessível via SSH
- [ ] Node.js instalado (v20)
- [ ] Nginx instalado
- [ ] Repositório clonado
- [ ] Build realizado com sucesso
- [ ] Nginx configurado
- [ ] DNS apontando para IP do VPS
- [ ] Site acessível via HTTP
- [ ] SSL instalado (HTTPS)
- [ ] Firewall configurado
- [ ] Script de deploy criado
- [ ] Testes realizados

---

## 🎯 Comandos Úteis

```bash
# Ver IP do VPS
curl ifconfig.me

# Reiniciar servidor
reboot

# Ver uso de recursos
htop

# Limpar logs antigos
journalctl --vacuum-time=7d

# Atualizar sistema
apt update && apt upgrade -y
```

---

**Pronto! Seu sistema está hospedado na Hostinger VPS!** 🚀

Qualquer dúvida sobre algum passo específico, me avise!
