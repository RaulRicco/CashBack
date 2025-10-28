# 🔔 NOTIFICAÇÕES POPUP - Guia Completo

## ✅ O QUE FOI IMPLEMENTADO

Sistema completo de notificações popup para informar o cliente em tempo real sobre suas movimentações de cashback!

---

## 🎨 TIPOS DE NOTIFICAÇÕES

### 1. 🎉 Cashback Recebido (Verde)

Aparece quando o cliente **ganha** cashback em uma compra.

```
┌─────────────────────────────────────┐
│ 🎁  🎉 Cashback Recebido!          │
│                                     │
│     Você ganhou em Padaria do João │
│     +R$ 10,50                       │
│                                     │
│     ████████████░░░░ 60%            │
└─────────────────────────────────────┘
```

### 2. 💰 Resgate Realizado (Laranja)

Aparece quando o cliente **usa** seu cashback.

```
┌─────────────────────────────────────┐
│ 📊  💰 Resgate Realizado!          │
│                                     │
│     Você usou em Padaria do João   │
│     -R$ 25,00                       │
│                                     │
│     ████████████░░░░ 60%            │
└─────────────────────────────────────┘
```

### 3. ✅ Sucesso (Azul) - Futuro

Para mensagens de sucesso genéricas.

### 4. ❌ Erro (Vermelho) - Futuro

Para avisos de erro.

---

## 🎯 QUANDO APARECEM

### Cashback Recebido:
1. Cliente faz uma compra
2. Estabelecimento gera QR Code
3. **Cliente escaneia o QR Code**
4. ✨ **POPUP APARECE**: "🎉 Cashback Recebido!"

### Resgate Realizado:
1. Cliente pede para resgatar
2. Estabelecimento gera QR Code de resgate
3. **Cliente escaneia QR Code de resgate**
4. ✨ **POPUP APARECE**: "💰 Resgate Realizado!"

---

## 📱 CARACTERÍSTICAS

### ✨ Animações

**Entrada**: Desliza da direita para esquerda  
**Saída**: Desliza da esquerda para direita  
**Duração**: 300ms (suave)

### ⏱️ Tempo

- **Duração padrão**: 5 segundos (5000ms)
- **Cashback/Resgate**: 6 segundos (6000ms)
- **Barra de progresso**: Mostra tempo restante

### 🎨 Design

- **Cores**: Verde (cashback), Laranja (resgate)
- **Ícones**: Gift (presente), TrendingUp (gráfico)
- **Sombra**: Shadow-2xl para destacar
- **Borda**: Borda lateral colorida (4px)
- **Responsivo**: Funciona em mobile e desktop

### 🔘 Interação

- **Fechar manual**: Botão X no canto
- **Auto-fechar**: Fecha sozinho após tempo
- **Múltiplas**: Empilha notificações (máx 3)
- **Hover**: Efeito visual ao passar mouse

---

## 💻 ARQUIVOS CRIADOS

### 1. `NotificationPopup.jsx`
Componente principal da notificação popup.

**Localização**: `src/components/NotificationPopup.jsx`

**Props**:
- `type`: 'cashback' | 'redemption' | 'success' | 'error'
- `title`: Título da notificação
- `message`: Mensagem descritiva
- `amount`: Valor (opcional)
- `duration`: Tempo em ms (default: 5000)
- `autoClose`: Fecha automaticamente (default: true)
- `onClose`: Callback ao fechar

### 2. `NotificationContainer.jsx`
Container para empilhar múltiplas notificações.

**Localização**: `src/components/NotificationContainer.jsx`

**Props**:
- `notifications`: Array de notificações

### 3. `useNotification.js`
Hook para gerenciar notificações.

**Localização**: `src/hooks/useNotification.js`

**Retorna**:
- `notifications`: Array de notificações ativas
- `showNotification(config)`: Mostrar notificação
- `closeNotification(id)`: Fechar específica
- `clearAll()`: Limpar todas

---

## 🚀 COMO USAR (Para desenvolvedores)

### Exemplo Básico:

```jsx
import { useNotification } from '../hooks/useNotification';
import NotificationContainer from '../components/NotificationContainer';

function MyComponent() {
  const { notifications, showNotification } = useNotification();

  const handleClick = () => {
    showNotification({
      type: 'cashback',
      title: '🎉 Cashback Recebido!',
      message: 'Você ganhou em Padaria do João',
      amount: 10.50,
      duration: 6000
    });
  };

  return (
    <div>
      <NotificationContainer notifications={notifications} />
      <button onClick={handleClick}>Testar Notificação</button>
    </div>
  );
}
```

### Exemplo com Resgate:

```jsx
showNotification({
  type: 'redemption',
  title: '💰 Resgate Realizado!',
  message: 'Você usou seu cashback em Padaria',
  amount: 25.00,
  duration: 6000
});
```

---

## 🧪 COMO TESTAR

### Passo 1: Fazer Deploy

```bash
ssh root@31.97.167.88
cd /var/www/cashback/cashback-system
git pull origin main
npm install
npm run build
systemctl reload nginx
```

### Passo 2: Testar Cashback

1. Faça login como estabelecimento
2. Vá em **"Registrar Cashback"**
3. Digite telefone de um cliente
4. Digite valor (ex: R$ 100)
5. Clique em "Gerar QR Code"
6. **Abra o QR Code em outro navegador/celular**
7. ✨ **POPUP VERDE** deve aparecer no canto superior direito!

### Passo 3: Testar Resgate

1. No dashboard, vá em **"Validar Resgate"**
2. Digite telefone do cliente
3. Digite valor (ex: R$ 10)
4. Clique em "Gerar QR Code"
5. **Abra o QR Code em outro navegador/celular**
6. ✨ **POPUP LARANJA** deve aparecer!

---

## 📸 EXEMPLO VISUAL

### No Celular:

```
┌─────────────────────────────────────────┐
│                   Navegador             │
├─────────────────────────────────────────┤
│                                         │
│    ┌──────────────────────────────┐    │
│    │ 🎁 Cashback Recebido!       │    │
│    │                              │    │
│    │ Você ganhou em Padaria       │    │
│    │ +R$ 10,50                    │    │
│    │ ████████░░░░ 80%             │    │
│    └──────────────────────────────┘    │
│                                         │
│    🎉 Parabéns!                         │
│    Seu cashback foi creditado          │
│                                         │
│    ┌────────────────────────────┐      │
│    │  Você ganhou               │      │
│    │  R$ 10,50                  │      │
│    └────────────────────────────┘      │
│                                         │
└─────────────────────────────────────────┘
```

A notificação aparece **NO TOPO**, independente do conteúdo da página!

---

## ⚙️ CONFIGURAÇÕES

### Mudar Tempo de Exibição:

No código onde chama `showNotification`:

```jsx
showNotification({
  // ...
  duration: 8000  // 8 segundos
});
```

### Desabilitar Auto-Close:

```jsx
showNotification({
  // ...
  autoClose: false  // Só fecha com botão X
});
```

### Callback ao Fechar:

```jsx
showNotification({
  // ...
  onClose: () => {
    console.log('Notificação fechada!');
  }
});
```

---

## 🎵 SOM DE NOTIFICAÇÃO (Futuro)

Para adicionar som quando notificação aparecer:

1. Adicionar arquivo de som (ex: `notification.mp3`)
2. No `useNotification.js`, adicionar:

```js
const playSound = () => {
  const audio = new Audio('/sounds/notification.mp3');
  audio.play();
};

const showNotification = (notification) => {
  playSound(); // Tocar som
  // ... resto do código
};
```

---

## 📋 CHECKLIST DE TESTE

### No Servidor:
- [ ] Deploy feito (`git pull`, `npm build`, `nginx reload`)
- [ ] Sem erros no console do servidor

### No Site:
- [ ] Site carrega normalmente
- [ ] Registrar cashback funciona
- [ ] QR Code abre em outro navegador
- [ ] **Notificação VERDE aparece** (cashback)
- [ ] Notificação tem título, mensagem e valor
- [ ] Notificação fecha automaticamente após 6s
- [ ] Botão X fecha a notificação
- [ ] Barra de progresso funciona

### Resgate:
- [ ] Validar resgate funciona
- [ ] QR Code abre
- [ ] **Notificação LARANJA aparece** (resgate)
- [ ] Valor aparece negativo (-R$)

### Mobile:
- [ ] Notificação aparece no celular
- [ ] Design responsivo (não quebra)
- [ ] Animação suave
- [ ] Botão X funciona no touch

---

## 🐛 TROUBLESHOOTING

### ❌ Notificação não aparece

**Verificar**:
1. Console do navegador (F12) - ver erros
2. Notificação está sendo chamada no código?
3. Deploy foi feito corretamente?

**Solução**:
```bash
cd /var/www/cashback/cashback-system
git log -1  # Ver último commit
# Deve ser: 11df25f feat: adicionar notificações popup
```

### ❌ Notificação aparece mas sem estilo

**Causa**: CSS não foi compilado

**Solução**:
```bash
npm run build
systemctl reload nginx
```

### ❌ Múltiplas notificações não empilham

**Causa**: `NotificationContainer` não está no componente

**Verificar**: Arquivo tem `<NotificationContainer notifications={notifications} />`

---

## 📊 COMMIT REALIZADO

**Commit**: `11df25f`

```
feat: adicionar notificações popup para cashback e resgates

- Criar componente NotificationPopup com 4 tipos
- Adicionar hook useNotification
- Criar NotificationContainer para empilhar
- Integrar cashback recebido (verde)
- Integrar resgate realizado (laranja)
- Animações suaves
- Barra de progresso automática
- Design responsivo
```

**Branch**: `main`  
**GitHub**: https://github.com/RaulRicco/CashBack

---

## 🎉 PRONTO!

Sistema de notificações popup **100% implementado**!

**Próximo passo**: Fazer deploy e testar! 🚀

---

## 💡 MELHORIAS FUTURAS

Possíveis adições:

1. **Som de notificação** 🔊
2. **Vibração no celular** 📳
3. **Notificações persistentes** (salvar histórico)
4. **Push notifications** (PWA)
5. **Customização de cores** por estabelecimento
6. **Animações diferentes** (confete, fogos, etc)
7. **Badges com contador** de notificações não lidas

---

**Qualquer dúvida, me avise!** 🔔✨
