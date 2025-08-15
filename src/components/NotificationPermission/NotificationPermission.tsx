import { useNotifications } from '../../hooks/useNotifications';
import styles from './NotificationPermission.module.css';

function NotificationPermission() {
  const { permission, requestPermission, isSupported, isRequesting } = useNotifications();

  const handleRequestPermission = async () => {
    console.log('Клик по кнопке разрешения');
    const granted = await requestPermission();
    console.log('Разрешение получено:', granted);
  };

  if (!isSupported) {
    return (
      <div className={styles.permission_banner}>
        ⚠️ Ваш браузер не поддерживает уведомления
      </div>
    );
  }

  if (permission === 'granted') {
    return null; 
  }

  if (permission === 'denied') {
    return (
      <div className={styles.permission_banner}>
        <div className={styles.permission_content}>
          <span>🚫 Уведомления заблокированы. Разрешите их в настройках браузера</span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.permission_banner}>
      <div className={styles.permission_content}>
        <span>🔔 Разрешите уведомления для лучшего опыта</span>
        <button 
          onClick={handleRequestPermission}
          disabled={isRequesting}
          className={styles.permission_button}
        >
          {isRequesting ? 'Запрашиваем...' : 'Разрешить'}
        </button>
      </div>
    </div>
  );
}

export default NotificationPermission;