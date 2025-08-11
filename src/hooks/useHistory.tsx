import { useState, useCallback } from 'react';

interface HistoryState {
  action: string;
  taskId?: string;
  timestamp: number;
  [key: string]: any;
}

interface HistoryEntry {
  state: HistoryState;
  title: string;
  url: string;
  index: number;
}

const useHistory = () => {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);

  const pushState = useCallback((state: HistoryState, title: string, url: string) => {
    const newEntry: HistoryEntry = {
      state,
      title,
      url,
      index: currentIndex + 1
    };

    const newHistory = history.slice(0, currentIndex + 1);
    newHistory.push(newEntry);

    setHistory(newHistory);
    setCurrentIndex(newHistory.length - 1);

    window.history.pushState(state, title, url);

    console.log(`📚 История обновлена. Текущий индекс: ${newHistory.length - 1}, Всего записей: ${newHistory.length}`);
  }, [history, currentIndex]);

  const goBack = useCallback(() => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      const entry = history[newIndex];
      
      setCurrentIndex(newIndex);
      window.history.back();
      
      console.log(`⬅️ Переход назад к записи ${newIndex}: "${entry.title}"`);
      return entry;
    }
    console.log('⚠️ Нельзя перейти назад - достигнуто начало истории');
    return null;
  }, [history, currentIndex]);

  const goForward = useCallback(() => {
    if (currentIndex < history.length - 1) {
      const newIndex = currentIndex + 1;
      const entry = history[newIndex];
      
      setCurrentIndex(newIndex);
      window.history.forward();
      
      console.log(`➡️ Переход вперед к записи ${newIndex}: "${entry.title}"`);
      return entry;
    }
    console.log('⚠️ Нельзя перейти вперед - достигнут конец истории');
    return null;
  }, [history, currentIndex]);

  const goTo = useCallback((targetIndex: number) => {
    if (targetIndex < 0 || targetIndex >= history.length) {
      console.log(`⚠️ Неверный индекс: ${targetIndex}. Доступные индексы: 0-${history.length - 1}`);
      return null;
    }

    if (targetIndex === currentIndex) {
      console.log(`ℹ️ Уже находимся на записи ${targetIndex}`);
      return history[targetIndex];
    }

    const entry = history[targetIndex];
    const direction = targetIndex > currentIndex ? 'вперед' : 'назад';
    const steps = Math.abs(targetIndex - currentIndex);
    
    setCurrentIndex(targetIndex);
    
    window.history.replaceState(entry.state, entry.title, entry.url);
    
    console.log(`🎯 Переход ${direction} на ${steps} шаг(ов) к записи ${targetIndex}: "${entry.title}"`);
    return entry;
  }, [history, currentIndex]);

  const getHistoryInfo = useCallback(() => {
    return {
      history,
      currentIndex,
      totalEntries: history.length,
      canGoBack: currentIndex > 0,
      canGoForward: currentIndex < history.length - 1,
      currentEntry: history[currentIndex] || null
    };
  }, [history, currentIndex]);

  const clearHistory = useCallback(() => {
    setHistory([]);
    setCurrentIndex(-1);
    console.log('🗑️ История очищена');
  }, []);

  const canGoBack = currentIndex > 0;
  const canGoForward = currentIndex < history.length - 1;

  return {
    pushState,
    goBack,
    goForward,
    goTo, 
    canGoBack,
    canGoForward,
    getHistoryInfo,
    clearHistory, 
    currentIndex,
    historyLength: history.length
  };
};

export default useHistory;