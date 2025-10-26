# 🚀 Guia de Deploy - VPS Hostinger
## LocalCashback.com.br

**IP do Servidor**: 31.97.167.88  
**Domínio**: localcashback.com.br

---

## 📋 PASSO 1: Conectar no VPS

Abra seu terminal (CMD, PowerShell, ou Terminal do Mac/Linux) e execute:

```bash
ssh root@31.97.167.88
```

Quando pedir a senha, digite: `Rauleprih30-`

---

## 📋 PASSO 2: Executar Script de Instalação

Depois de conectado no servidor, copie e cole este comando:

```bash
curl -o setup-vps.sh https://raw.githubusercontent.com/RaulRicco/CashBack/main/setup-vps.sh && chmod +x setup-vps.sh && ./setup-vps.sh
```

**OU**, se preferir fazer manualmente, execute linha por linha:

```bash
# Baixar script
curl -o setup-vps.sh https://raw.githubusercontent.com/RaulRicco/CashBack/main/setup-vps.sh

# Dar permissão de execução
chmod +x setup-vps.sh

# Executar
./setup-vps.sh
```

⏱️ **Tempo estimado**: 5-10 minutos

O script vai:
- ✅ Atualizar o sistema
- ✅ Instalar Node.js 20 LTS
- ✅ Instalar Nginx
- ✅ Instalar Certbot (SSL)
- ✅ Clonar seu repositório
- ✅ Instalar dependências
- ✅ Buildar a aplicação
- ✅ Configurar Nginx
- ✅ Configurar Firewall

---

## 📋 PASSO 3: Configurar DNS do Domínio

Enquanto a instalação roda, configure o DNS:

### 3.1. Acesse o painel de DNS do seu domínio

(Geralmente onde você comprou o domínio: registro.br, GoDaddy, etc.)

### 3.2. Adicione/Edite os registros DNS:

| Tipo | Nome | Valor | TTL |
|------|------|-------|-----|
| A | @ | 31.97.167.88 | 3600 |
| A | www | 31.97.167.88 | 3600 |

**Exemplo visual**:
```
@ (ou vazio)     A     31.97.167.88     3600
www              A     31.97.167.88     3600
```

### 3.3. Salvar e aguardar

⏱️ **Tempo de propagação**: 5 minutos a 2 horas (geralmente 15-30 min)

**Como testar se propagou**:

No seu computador, execute:
```bash
ping localcashback.com.br
```

Se retornar `31.97.167.88`, o DNS propagou! ✅

---

## 📋 PASSO 4: Testar Site (HTTP)

Após a instalação, teste:

**Pelo IP** (funciona imediatamente):
```
http://31.97.167.88
```

**Pelo domínio** (após DNS propagar):
```
http://localcashback.com.br
http://www.localcashback.com.br
```

🟡 **Nota**: Ainda é HTTP (não seguro), vamos instalar SSL no próximo passo.

---

## 📋 PASSO 5: Instalar SSL (HTTPS)

⚠️ **IMPORTANTE**: Só execute após o DNS ter propagado!

No terminal SSH do servidor, execute:

```bash
certbot --nginx -d localcashback.com.br -d www.localcashback.com.br
```

O Certbot vai perguntar:

1. **Email**: Digite seu email (para avisos de renovação)
2. **Termos de Serviço**: Digite `Y` (yes)
3. **Compartilhar email com EFF**: Digite `N` (no) ou `Y` (tanto faz)
4. **Redirect HTTP → HTTPS**: Digite `2` (redirecionar tudo para HTTPS)

✅ **Pronto!** SSL instalado!

Agora acesse:
```
https://localcashback.com.br
```

🔒 Site com cadeado verde (seguro)!

---

## 📋 PASSO 6: Verificar que Tudo Está Funcionando

### 6.1. Testar Login

1. Acesse: https://localcashback.com.br
2. Faça login como merchant, employee ou customer
3. Teste criar transação de cashback
4. Verifique se o saldo é creditado imediatamente
5. Teste resgate (redemption)

### 6.2. Verificar serviços no servidor

No SSH, execute:

```bash
# Ver status do Nginx
systemctl status nginx

# Ver logs do Nginx (caso haja erro)
tail -f /var/log/nginx/error.log

# Ver processos Node.js (se houver)
ps aux | grep node
```

---

## 🔄 PASSO 7: Script de Atualização

Quando você fizer mudanças no código e quiser atualizar o site:

```bash
ssh root@31.97.167.88
cd /var/www/cashback/cashback-system
git pull origin main
npm install
npm run build
systemctl reload nginx
```

**OU**, crie um script de atualização:

```bash
# Criar script
cat > /root/update-site.sh << 'EOF'
#!/bin/bash
cd /var/www/cashback/cashback-system
git pull origin main
npm install
npm run build
systemctl reload nginx
echo "✅ Site atualizado!"
EOF

# Dar permissão
chmod +x /root/update-site.sh

# Executar quando quiser atualizar
/root/update-site.sh
```

---

## 🆘 Troubleshooting

### Erro: "Connection refused"
```bash
# Verificar se Nginx está rodando
systemctl status nginx

# Se não estiver, iniciar
systemctl start nginx
```

### Erro: "502 Bad Gateway"
```bash
# Ver logs de erro
tail -n 50 /var/log/nginx/error.log
```

### Site não carrega assets (JS/CSS)
```bash
# Verificar se o build foi feito corretamente
ls -la /var/www/cashback/cashback-system/dist
```

### DNS não propaga
```bash
# Testar DNS
nslookup localcashback.com.br

# Se não retornar 31.97.167.88, aguarde mais tempo
```

### Certificado SSL não instala
```bash
# Verificar se DNS está apontando corretamente
dig localcashback.com.br

# Tentar novamente
certbot --nginx -d localcashback.com.br -d www.localcashback.com.br
```

---

## 📊 Comandos Úteis

```bash
# Ver uso de disco
df -h

# Ver uso de memória
free -h

# Ver processos em execução
htop
# (instalar: apt install htop)

# Ver portas abertas
netstat -tulpn

# Reiniciar servidor (cuidado!)
reboot
```

---

## 🎯 Checklist Final

- [ ] Script de instalação executado
- [ ] DNS configurado (A records)
- [ ] Site acessível via HTTP
- [ ] SSL instalado (HTTPS)
- [ ] Login funcionando
- [ ] Cashback creditado imediatamente
- [ ] Resgate funcionando
- [ ] Histórico mostrando transações

---

## 📞 Próximos Passos Sugeridos

1. **Backup Automático**
   - Configurar backup diário da aplicação

2. **Monitoramento**
   - Instalar ferramentas de monitoramento (Uptime Kuma, etc.)

3. **Performance**
   - Configurar cache adicional no Nginx

4. **Segurança**
   - Configurar fail2ban (proteção contra ataques)
   - Desabilitar login root via SSH (criar usuário normal)

---

**🎉 Parabéns! Seu sistema está no ar!**

Domínio: https://localcashback.com.br
