// ====================================
// SISTEMA DE TRACKING - GTM & META PIXEL
// ====================================

// Google Tag Manager
export const initGTM = (gtmId) => {
  if (!gtmId) return;
  
  // GTM Script
  const script = document.createElement('script');
  script.innerHTML = `
    (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer','${gtmId}');
  `;
  document.head.appendChild(script);

  // GTM NoScript
  const noscript = document.createElement('noscript');
  noscript.innerHTML = `
    <iframe src="https://www.googletagmanager.com/ns.html?id=${gtmId}"
    height="0" width="0" style="display:none;visibility:hidden"></iframe>
  `;
  document.body.insertBefore(noscript, document.body.firstChild);
};

// Meta Pixel (Facebook Pixel)
export const initMetaPixel = (pixelId) => {
  if (!pixelId) return;

  // 🚨 DESABILITADO: Meta Pixel está sendo gerenciado via Google Tag Manager
  // Para evitar conflitos de inicialização duplicada, não inicializamos via código
  console.log('📘 Meta Pixel configurado via GTM (ID:', pixelId, ')');
  console.log('ℹ️ Meta Pixel será inicializado pelo Google Tag Manager');
  
  // NOTA: Se quiser voltar a usar via código, descomente o bloco abaixo
  // e remova a tag do Meta Pixel do Google Tag Manager
  
  /*
  // Meta Pixel Code
  const script = document.createElement('script');
  script.innerHTML = `
    !function(f,b,e,v,n,t,s)
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', '${pixelId}');
    fbq('track', 'PageView');
  `;
  document.head.appendChild(script);

  // Meta Pixel NoScript
  const noscript = document.createElement('noscript');
  noscript.innerHTML = `
    <img height="1" width="1" style="display:none"
    src="https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1"/>
  `;
  document.body.appendChild(noscript);
  */
};

// Tracking Events
export const trackEvent = (eventName, eventData = {}) => {
  // GTM Event
  if (window.dataLayer) {
    window.dataLayer.push({
      event: eventName,
      ...eventData
    });
  }

  // Meta Pixel Event
  if (window.fbq) {
    window.fbq('track', eventName, eventData);
  }

  console.log('📊 Event tracked:', eventName, eventData);
};

// Eventos específicos do sistema de cashback
export const trackCashbackGenerated = (data) => {
  trackEvent('CashbackGenerated', {
    value: data.amount,
    cashback_value: data.cashbackAmount,
    customer_phone: data.customerPhone,
    merchant_id: data.merchantId
  });
};

export const trackCashbackScanned = (data) => {
  trackEvent('CashbackScanned', {
    value: data.amount,
    cashback_value: data.cashbackAmount,
    customer_phone: data.customerPhone,
    merchant_id: data.merchantId
  });
};

export const trackCashbackCompleted = (data) => {
  trackEvent('Purchase', {
    value: data.amount,
    cashback_value: data.cashbackAmount,
    currency: 'BRL',
    customer_phone: data.customerPhone,
    merchant_id: data.merchantId
  });
};

export const trackRedemptionGenerated = (data) => {
  trackEvent('RedemptionGenerated', {
    value: data.amount,
    customer_phone: data.customerPhone,
    merchant_id: data.merchantId
  });
};

export const trackRedemptionCompleted = (data) => {
  trackEvent('RedemptionCompleted', {
    value: data.amount,
    currency: 'BRL',
    customer_phone: data.customerPhone,
    merchant_id: data.merchantId
  });
};

export const trackPageView = (pageName) => {
  trackEvent('PageView', {
    page_name: pageName,
    page_path: window.location.pathname
  });
};
