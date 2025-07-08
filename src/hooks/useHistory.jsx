import { useState, useEffect } from 'react'

export const useHistory = () => {
  const [history, setHistory] = useState([])
  const [currentIndex, setCurrentIndex] = useState(-1)

  const pushState = (state, title = '', url = null) => {
    const historyEntry = {
      state, 
      title, 
      timestamp: Date.now(),
      url: url || window.location.pathname 
    }

    // Добавляем запись в историю браузера
    window.history.pushState(state, title, url)
    
    // Обновляем локальную историю
    setHistory(prev => [...prev, historyEntry])
    setCurrentIndex(prev => prev + 1)
  }

  // Функция для возврата к предыдущему состоянию
  const goBack = () => {
    if (currentIndex > 0) {
      window.history.back()
      setCurrentIndex(prev => prev - 1)
    }
  }

  // Функция для перехода вперед
  const goForward = () => {
    if (currentIndex < history.length - 1) {
      window.history.forward()
      setCurrentIndex(prev => prev + 1)
    }
  }

  useEffect(() => {
    const handlePopState = (event) => {
      console.log('История изменилась:', event.state)
    }

    window.addEventListener('popstate', handlePopState)

    // Функция очистки - выполняется при размонтировании компонента
    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, []) 

  return {
    history,
    currentIndex,
    pushState,
    goBack,
    goForward,
    canGoBack: currentIndex > 0,
    canGoForward: currentIndex < history.length - 1
  }
}