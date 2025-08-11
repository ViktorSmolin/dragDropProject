import { useState } from 'react';
import styles from './HistoryNavigator.module.css';
import { HistoryNavigatorProps } from './type';

function HistoryNavigator({ history, currentIndex, onGoTo, onClear }: HistoryNavigatorProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (history.length === 0) {
    return (
      <div className={styles.navigator_empty}>
        <span>📚 История пуста</span>
      </div>
    );
  }

  return (
    <div className={styles.navigator}>
      <div className={styles.navigator_header}>
        <button
          className={styles.toggle_button}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          📚 История ({history.length}) {isExpanded ? '▼' : '▶'}
        </button>

        <div className={styles.controls}>
          <select
            value={currentIndex}
            onChange={(e) => onGoTo(Number(e.target.value))}
            className={styles.history_select}
          >
            {history.map((entry, index) => (
              <option key={index} value={index}>
                #{index} - {entry.title}
              </option>
            ))}
          </select>
          
          <button onClick={onClear} className={styles.clear_button}>
            🗑️
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className={styles.history_list}>
          {history.map((entry, index) => (
            <div
              key={index}
              className={`${styles.history_item} ${
                index === currentIndex ? styles.current : ''
              }`}
              onClick={() => onGoTo(index)}
            >
              <span className={styles.item_index}>#{index}</span>
              <span className={styles.item_title}>{entry.title}</span>
              <span className={styles.item_action}>{entry.state.action}</span>
              {index === currentIndex && (
                <span className={styles.current_badge}>Текущая</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default HistoryNavigator;