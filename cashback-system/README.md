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

Observações:
- Carregue variáveis com `source ../.env` antes de executar scripts.
- Não commitar segredos; use `.env` apenas localmente. Em produção use variáveis de ambiente do servidor/CI.

