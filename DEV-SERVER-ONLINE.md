# ✅ SERVIDOR DE DESENVOLVIMENTO ONLINE

**Data**: 2025-11-24 10:07 UTC
**Status**: ✅ FUNCIONANDO

---

## 🌐 URLs DISPONÍVEIS

### Desenvolvimento (Dev Server)
```
http://31.97.167.88:8080
```
✅ **ONLINE** - Servidor Vite com Hot Reload

**Ou acesse diretamente pela porta Vite:**
```
http://31.97.167.88:5173
```

### Produção
```
https://localcashback.com.br
```
✅ **ONLINE** - Build de produção

---

## 🔧 O QUE FOI FEITO

### 1. ✅ Servidor Vite Já Estava Rodando
- Porta: 5173
- PID: 371525
- Status: Online desde 20/Nov

### 2. ✅ Criado Proxy NGINX
- Arquivo: `/etc/nginx/sites-available/dev-8080`
- Porta externa: 8080
- Proxy para: localhost:5173
- WebSocket: Habilitado (Hot Reload funciona)

### 3. ✅ NGINX Recarregado
- Configuração testada: OK
- Porta 8080 exposta
- Proxy ativo

---

## 📊 CARACTERÍSTICAS DO DEV SERVER

### Hot Reload ✅
- Mudanças no código atualizam automaticamente
- Sem necessidade de rebuild manual
- WebSocket configurado

### Fast Refresh ✅
- React Fast Refresh ativo
- Componentes atualizam sem perder estado
- Performance otimizada

### Source Maps ✅
- Debug facilitado
- Erros mostram código original
- DevTools funcionam perfeitamente

---

## 🧪 TESTAR AGORA

### 1. Acesse o Dev Server
```
http://31.97.167.88:8080
```

### 2. Abra DevTools (F12)
- Console deve estar limpo (ou apenas warnings não críticos)
- Network mostra recursos carregando
- Vite client conectado

### 3. Teste Hot Reload
- Faça uma mudança em qualquer arquivo `.jsx`
- Salve o arquivo
- Página deve atualizar automaticamente

---

## 🔄 DIFERENÇAS: DEV vs PRODUÇÃO

| Aspecto | Dev (8080) | Produção (443) |
|---------|------------|----------------|
| Build | ❌ Não compila | ✅ Compilado |
| Hot Reload | ✅ Sim | ❌ Não |
| Source Maps | ✅ Completos | ⚠️ Limitados |
| Performance | ⚠️ Mais lento | ✅ Otimizado |
| Minificação | ❌ Não | ✅ Sim |
| Cache | ❌ Desabilitado | ✅ Ativo |
| Uso | 🔧 Desenvolvimento | 🚀 Usuários finais |

---

## 🎯 QUANDO USAR CADA UM

### Use DEV Server (8080) para:
- ✅ Desenvolver novos recursos
- ✅ Testar mudanças rapidamente
- ✅ Debug com source maps
- ✅ Hot reload durante desenvolvimento
- ✅ Ver erros detalhados

### Use PRODUÇÃO (443) para:
- ✅ Testar versão final
- ✅ Verificar performance real
- ✅ Validar antes de release
- ✅ Demonstrar para clientes
- ✅ Uso de usuários finais

---

## 🛠️ COMANDOS ÚTEIS

### Verificar Status do Dev Server
```bash
ps aux | grep vite
```

### Ver Logs do Vite
```bash
pm2 logs vite-dev
# Ou se não estiver no PM2:
journalctl -u vite-dev -f
```

### Reiniciar Dev Server
```bash
# Se estiver no PM2
pm2 restart vite-dev

# Ou manualmente
cd /var/www/cashback/cashback-dev/cashback-system
npm run dev
```

### Verificar Porta 8080
```bash
curl -I http://31.97.167.88:8080
```

### Verificar NGINX
```bash
sudo nginx -t
sudo systemctl status nginx
```

---

## 🔍 TROUBLESHOOTING

### Problema: "ERR_CONNECTION_REFUSED"
**Solução**:
```bash
# Verificar se NGINX está rodando
sudo systemctl status nginx

# Verificar se Vite está rodando
ps aux | grep vite

# Reiniciar NGINX
sudo systemctl restart nginx
```

### Problema: "502 Bad Gateway"
**Solução**:
```bash
# Verificar se Vite está na porta 5173
sudo ss -tulpn | grep :5173

# Se não estiver, reiniciar Vite
cd /var/www/cashback/cashback-dev/cashback-system
npm run dev
```

### Problema: "Hot Reload não funciona"
**Solução**:
- Verifique se WebSocket está conectado (DevTools → Network → WS)
- Limpe cache do navegador
- Recarregue a página

### Problema: "Mudanças não aparecem"
**Solução**:
```bash
# Verificar se arquivo foi salvo
# Verificar logs do Vite
# Hard refresh: Ctrl + Shift + R
```

---

## 📝 CONFIGURAÇÃO NGINX

Arquivo: `/etc/nginx/sites-available/dev-8080`

```nginx
server {
    listen 8080;
    server_name 31.97.167.88;

    location / {
        proxy_pass http://localhost:5173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }
}
```

---

## 🎯 PRÓXIMOS PASSOS

### Para Desenvolvimento:

1. **Acesse o Dev Server**
   ```
   http://31.97.167.88:8080
   ```

2. **Faça suas mudanças**
   - Edite arquivos em `/var/www/cashback/cashback-dev/cashback-system/src/`
   - Hot Reload ativo

3. **Teste no Dev Server**
   - Verifique funcionamento
   - Debug com DevTools

4. **Quando satisfeito, faça Build**
   ```bash
   cd /var/www/cashback/cashback-system
   npm run build
   sudo systemctl reload nginx
   ```

5. **Teste em Produção**
   ```
   https://localcashback.com.br
   ```

---

## 📊 STATUS FINAL

| Serviço | Porta | Status | URL |
|---------|-------|--------|-----|
| Dev Server (Vite) | 5173 | ✅ Online | http://31.97.167.88:5173 |
| Dev Proxy (NGINX) | 8080 | ✅ Online | http://31.97.167.88:8080 |
| Produção (HTTPS) | 443 | ✅ Online | https://localcashback.com.br |
| Stripe API | 3001 | ✅ Online | https://localcashback.com.br/api/ |

---

## 🎉 CONCLUSÃO

✅ **Servidor de desenvolvimento está ONLINE e funcionando!**

**Acesse agora:**
```
http://31.97.167.88:8080
```

**Recursos disponíveis:**
- ✅ Hot Reload
- ✅ Fast Refresh
- ✅ Source Maps
- ✅ WebSocket
- ✅ DevTools

---

**Desenvolvido por**: GenSpark AI Developer
**Data**: 2025-11-24 10:07 UTC
**Status**: ✅ PRONTO PARA USO
