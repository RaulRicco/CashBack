import NotificationPopup from './NotificationPopup';

/**
 * Container para empilhar múltiplas notificações
 */
export default function NotificationContainer({ notifications }) {
  if (!notifications || notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm w-full pointer-events-none">
      {notifications.map((notification, index) => (
        <div 
          key={notification.id} 
          className="pointer-events-auto"
          style={{ 
            transform: `translateY(${index * 10}px)`,
            transition: 'transform 0.3s ease-out'
          }}
        >
          <NotificationPopup {...notification} />
        </div>
      ))}
    </div>
  );
}
