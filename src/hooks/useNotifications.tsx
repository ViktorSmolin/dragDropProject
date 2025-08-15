import { useState, useEffect, useCallback } from 'react';

interface NotificationOptions {
  body?: string;
  icon?: string;
  tag?: string;
  requireInteraction?: boolean;
}

export const useNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isRequesting, setIsRequesting] = useState(false);

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      console.warn('Браузер не поддерживает уведомления');
      return false;
    }

    if (permission === 'granted') {
      return true;
    }

    if (isRequesting) {
      return false;
    }

    setIsRequesting(true);

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      console.log('Результат запроса разрешения:', result);
      return result === 'granted';
    } catch (error) {
      console.error('Ошибка при запросе разрешения:', error);
      return false;
    } finally {
      setIsRequesting(false);
    }
  }, [permission, isRequesting]);

  const showNotification = useCallback(async (title: string, options: NotificationOptions = {}) => {
        if (!('Notification' in window)) {
      console.log(`📢 Уведомление: ${title}`, options.body);
      showFallbackNotification(title, options);
      return;
    }

    if (permission !== 'granted') {
      console.log(`📢 Уведомление (без разрешения): ${title}`, options.body);
      showFallbackNotification(title, options);
      return;
    }

    try {
      const notification = new Notification(title, {
        body: options.body,
        icon: options.icon || '/favicon.ico',
        tag: options.tag,
        requireInteraction: options.requireInteraction || false,
      });

      setTimeout(() => {
        notification.close();
      }, 5000);

    } catch (error) {
      console.error('Ошибка при показе уведомления:', error);
      showFallbackNotification(title, options);
    }
  }, [permission]);

  const showFallbackNotification = (title: string, options: NotificationOptions) => {
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.innerHTML = `
      <div class="toast-header">
        ${options.icon || '📢'} ${title}
      </div>
      ${options.body ? `<div class="toast-body">${options.body}</div>` : ''}
    `;
    
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #333;
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      z-index: 10000;
      max-width: 300px;
      animation: slideIn 0.3s ease-out;
      font-family: system-ui, -apple-system, sans-serif;
    `;

    if (!document.getElementById('toast-styles')) {
      const style = document.createElement('style');
      style.id = 'toast-styles';
      style.textContent = `
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .toast-header { font-weight: bold; margin-bottom: 4px; }
        .toast-body { font-size: 14px; opacity: 0.9; }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'slideIn 0.3s ease-out reverse';
      setTimeout(() => {
        if (document.body.contains(toast)) {
          document.body.removeChild(toast);
        }
      }, 300);
    }, 5000);
  };

  return {
    showNotification,
    requestPermission,
    permission,
    isRequesting,
    isSupported: 'Notification' in window
  };
};