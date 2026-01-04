import { useState, useCallback } from 'react';

/**
 * Hook para gerenciar notificações
 * 
 * Uso:
 * const { notifications, showNotification, closeNotification } = useNotification();
 * 
 * showNotification({
 *   type: 'cashback',
 *   title: 'Cashback Recebido!',
 *   message: 'Você ganhou cashback em sua compra',
 *   amount: 10.50,
 *   duration: 5000
 * });
 */
export function useNotification() {
  const [notifications, setNotifications] = useState([]);

  const showNotification = useCallback((notification) => {
    const id = Date.now() + Math.random();
    const newNotification = {
      id,
      ...notification,
      onClose: () => closeNotification(id)
    };

    setNotifications(prev => [...prev, newNotification]);

    // Limpar após duração (com margem de segurança)
    const duration = notification.duration || 5000;
    setTimeout(() => {
      closeNotification(id);
    }, duration + 500);

    return id;
  }, []);

  const closeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  return {
    notifications,
    showNotification,
    closeNotification,
    clearAll
  };
}
