# Cashback System

## Proxy de Integrações

Subir localmente:
```bash
cd cashback-system
set -a && source ../.env && set +a
npm run proxy
```

Endpoints úteis:
- `GET /health`
- `GET /api/onesignal/config`
- `GET /api/onesignal/validate`
 - `POST /api/onesignal/send-to-all` (suporta `dryRun: true`)
 - `POST /api/onesignal/send-to-user` (suporta `dryRun: true`)

## Scripts auxiliares

Executar testes do Resend:
```bash
npm run scripts:resend-test
```

Criar usuário no Supabase Auth:
```bash
npm run scripts:create-auth-user
```

Verificar/gerar usuário via Service Role:
```bash
npm run scripts:check-auth-user
```

Diagnóstico OneSignal (config, validate e dry-run):
```bash
PORT=3001 bash cashback-system/scripts/onesignal_diagnostics.sh
```

Observações:
- Carregue variáveis com `source ../.env` antes de executar scripts.
- Não commitar segredos; use `.env` apenas localmente. Em produção use variáveis de ambiente do servidor/CI.
 - Para testes de notificação, prefira `dryRun` para validar payload sem enviar.

## Autenticação (Supabase Auth)

- Variáveis obrigatórias: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.
- Verificação de email:
	- Link com token: `/verify-email?token=XXXXXX` (código de 6 dígitos).
	- Página `EmailVerification` aceita token sem expor email.
- Reset de senha:
	- `ForgotPassword` usa `supabase.auth.resetPasswordForEmail` e redireciona para `/reset-password`.
	- Página de reset utiliza `supabase.auth.updateUser` após estabelecer sessão via hash.

Requisitos no Dashboard Supabase:
- Configurar SMTP para envio de emails.
- Configurar Redirect URLs: incluir `/verify-email` e `/reset-password`.

