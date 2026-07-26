# Configuracao do retorno dos Pricing Tables Stripe

Objetivo: depois que o checkout do plano terminar no Stripe, o usuario deve voltar para o sistema e cair na etapa final de cadastro.

URL de sucesso recomendada:

`https://SEU-DOMINIO/checkout/complete`

Se quiser usar direto o formulario, pode usar:

`https://SEU-DOMINIO/signup`

Configuracao recomendada por pricing table:

- Lancamento: `prctbl_1TKQA9Aev6mInEFVj5MVuWLO`
- Starter: `prctbl_1TKQFeAev6mInEFVrusJAS8p`
- Business: `prctbl_1TKQI8Aev6mInEFVqFRA25KG`
- Premium: `prctbl_1TKQJQAev6mInEFV1VgFDeLQ`

Passos no dashboard Stripe:

1. Abra o Dashboard Stripe.
2. Va para Product catalog > Pricing tables.
3. Abra cada pricing table acima.
4. Edite a configuracao de redirect/success after checkout.
5. Defina a URL como `https://SEU-DOMINIO/checkout/complete`.
6. Salve e publique a alteracao.

Observacao:

- O cadastro no sistema agora exige que o email usado no formulario seja o mesmo email usado no checkout Stripe.
- O fluxo PIX/Boleto foi descontinuado para novas assinaturas. O modelo oficial agora e assinatura recorrente com 14 dias de trial controlados pelo Stripe.