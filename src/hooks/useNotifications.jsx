import { useState, useEffect } from 'react'

 export const useNotifications = () => {
  const [permission, setPermission] = useState(Notification.permission)

  useEffect(() => {
    if (permission === 'default') {
      Notification.requestPermission().then((result) => {
        setPermission(result)
      })
    }
  }, [permission])

  const showNotification = (title, options = {}) => {
    if (permission === 'granted') {
      const notification = new Notification(title, {
        icon: '/vite.svg',
        body: options.body || '',
        tag: options.tag || 'default',
        ...options
      })

      setTimeout(() => {
        notification.close()
      }, 3000)

      return notification
    } else {
      console.log('Разрешение на уведомление не предоставлено')
    }
  }

  return { showNotification, permission }
}

