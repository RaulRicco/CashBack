/**
 * 🎯 useDynamicManifest Hook
 * 
 * Hook React para gerenciar manifest.json dinâmico por estabelecimento
 */

import { useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { injectDynamicManifest } from '../utils/dynamicManifest';

/**
 * Hook para injetar manifest dinâmico baseado no merchant
 * 
 * @param {Object|string} merchantOrId - Objeto merchant completo ou merchant_id string
 * 
 * @example
 * // Uso com merchant_id
 * useDynamicManifest(merchantId);
 * 
 * // Uso com objeto merchant
 * useDynamicManifest(merchant);
 * 
 * // Uso automático (detecta da URL)
 * useDynamicManifest();
 */
export function useDynamicManifest(merchantOrId = null) {
  const params = useParams();
  const [searchParams] = useSearchParams();
  
  useEffect(() => {
    let merchantId = null;
    
    // Se recebeu merchant como parâmetro
    if (merchantOrId) {
      if (typeof merchantOrId === 'string') {
        merchantId = merchantOrId;
      } else if (merchantOrId.id) {
        merchantId = merchantOrId.id;
      }
    } 
    
    // Se não, detectar de várias fontes
    if (!merchantId) {
      merchantId = 
        params.merchantId ||           // URL param (ex: /customer/:merchantId)
        params.id ||                   // URL param alternativo
        searchParams.get('merchant') || // Query param (ex: ?merchant=xxx)
        searchParams.get('m') ||        // Query param curto
        localStorage.getItem('current_merchant_id'); // localStorage
    }
    
    if (merchantId) {
      console.log('🎯 useDynamicManifest: injecting for', merchantId);
      injectDynamicManifest(merchantId);
      
      // Salvar para próximas visitas
      localStorage.setItem('current_merchant_id', merchantId);
    }
    
  }, [merchantOrId, params, searchParams]);
}

export default useDynamicManifest;
