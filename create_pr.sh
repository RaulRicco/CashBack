#!/bin/bash

# Get GitHub token from git credentials
TOKEN=$(grep github.com ~/.git-credentials | sed 's/.*:\/\/.*:\(.*\)@.*/\1/')

# Create PR
curl -X POST \
  -H "Authorization: token $TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/repos/RaulRicco/CashBack/pulls \
  -d '{
    "title": "feat: Sistema White Label - Upload de Logo e Melhorias de UI",
    "head": "genspark_ai_developer",
    "base": "main",
    "body": "## 🎉 Mudanças Implementadas\n\n### ✅ Upload de Logo Funcionando\n- Corrigido erro de RLS no Supabase Storage\n- Bucket `merchant-assets` configurado como público\n- Upload de logo testado e funcionando perfeitamente\n- Validação de tipo de arquivo (PNG, JPG) e tamanho (máximo 2MB)\n\n### ✅ Melhorias de Interface\n- Menu renomeado: **White Label** → **Meu CashBack**\n- Layout da área de upload redesenhado e melhorado\n- Preview de logo centralizado e mais intuitivo\n- Área de drop-zone mais clara com ícone de upload\n- Status de upload destacado com feedback visual\n\n### ✅ Página de Configurações White Label\n- Upload e preview de logo\n- Configuração de 3 cores (primária, secundária, destaque)\n- Preview das cores em botões de exemplo\n- Configuração de porcentagem de cashback\n- Informações do estabelecimento (nome, email, telefone)\n- Salvamento automático no banco de dados\n\n### 📋 Arquivos Modificados\n- `src/components/DashboardLayout.jsx` - Nome do menu atualizado\n- `src/pages/WhiteLabelSettings.jsx` - Layout melhorado e funcional\n- Scripts SQL de diagnóstico e correção criados\n\n### 🔧 Configurações Técnicas\n- Bucket Supabase Storage configurado\n- Políticas RLS ajustadas\n- Integração com Supabase Storage completa\n\n### 🎯 Próximos Passos (Futuras PRs)\n1. Aplicar branding dinâmico sistema-wide\n2. Completar isolamento multi-tenant\n3. Aplicar cores personalizadas em todo o sistema\n4. Mostrar logo do merchant em páginas customer-facing\n\n### ✅ Testado\n- ✅ Upload de logo funciona\n- ✅ Preview de logo funciona\n- ✅ Salvamento de configurações funciona\n- ✅ Interface responsiva e alinhada\n\n---\n\n**Review**: Pronto para merge! 🚀"
  }'
