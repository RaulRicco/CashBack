import { Helmet } from 'react-helmet-async';

/**
 * Componente para injetar meta tags Open Graph dinâmicas
 * para compartilhamento em redes sociais (WhatsApp, Facebook, etc.)
 * 
 * @param {Object} merchant - Dados do estabelecimento
 * @param {string} merchant.name - Nome do estabelecimento
 * @param {string} merchant.logo_url - URL da logo
 * @param {number} merchant.cashback_percentage - Porcentagem de cashback
 * @param {string} pageType - Tipo de página: 'signup' | 'dashboard'
 */
export default function MerchantSEO({ merchant, pageType = 'signup' }) {
  if (!merchant) return null;

  // Construir título e descrição baseado no tipo de página
  const titles = {
    signup: `Cadastre-se e ganhe ${merchant.cashback_percentage}% de cashback em ${merchant.name}`,
    dashboard: `Programa de Cashback - ${merchant.name}`,
  };

  const descriptions = {
    signup: `Ganhe ${merchant.cashback_percentage}% de cashback em todas as suas compras em ${merchant.name}. Cadastre-se grátis e comece a acumular recompensas hoje mesmo!`,
    dashboard: `Acompanhe seu saldo de cashback e histórico de transações em ${merchant.name}. ${merchant.cashback_percentage}% de cashback em todas as compras.`,
  };

  const title = titles[pageType] || titles.signup;
  const description = descriptions[pageType] || descriptions.signup;

  // URL da logo - usar logo do merchant ou fallback
  const imageUrl = merchant.logo_url || '/logo-light.png';
  
  // URL atual da página
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content={merchant.name} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={currentUrl} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={imageUrl} />

      {/* WhatsApp (usa Open Graph) */}
      <meta property="og:image:alt" content={`Logo ${merchant.name}`} />
      
      {/* LinkedIn */}
      <meta property="og:image:secure_url" content={imageUrl} />
    </Helmet>
  );
}
