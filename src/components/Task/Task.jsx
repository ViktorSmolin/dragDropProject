// Task.jsx
import { useState, useRef, useEffect } from 'react';
import styles from './Task.module.css';

function Task({ 
  task, 
  onDragStart, 
  onDragEnd, 
  onDelete, 
  onUpdate,
  onStartEditing,
  onFinishEditing,
  isEditing 
}) {
  const [editedTitle, setEditedTitle] = useState(task.title);
  const [editedDescription, setEditedDescription] = useState(task.description);
  const titleInputRef = useRef(null);

  const handleDoubleClick = () => {
    onStartEditing(task.id);
  };
  
  // Обработчик сохранения изменений
  const handleSave = () => {
    if (editedTitle.trim() === '') {
      return;
    }
    
    onUpdate(task.id, {
      title: editedTitle,
      description: editedDescription
    });
    
    onFinishEditing();
  };
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      setEditedTitle(task.title);
      setEditedDescription(task.description);
      onFinishEditing();
    }
  };

    useEffect(() => {
    if (isEditing && titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, [isEditing]);
  
  return (
    <div 
      className={`${styles.task} ${isEditing ? styles.editing : ''}`}
      draggable={!isEditing}
      onDragStart={(e) => {
        if (!isEditing) {
          e.dataTransfer.setData('text/plain', task.id);
          onDragStart(task);
        }
      }}
      onDragEnd={() => !isEditing && onDragEnd(task)}
      data-task-id={task.id}
      onDoubleClick={handleDoubleClick}
    >
      {isEditing ? (
        <>
          <input
            ref={titleInputRef}
            className={styles.edit_title}
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Название задачи"
          />
          <textarea
            className={styles.edit_description}
            value={editedDescription}
            onChange={(e) => setEditedDescription(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Описание задачи"
          />
          <div className={styles.edit_controls}>
            <button 
              className={styles.save_button}
              onClick={handleSave}
            >
              Сохранить
            </button>
            <button 
              className={styles.cancel_button}
              onClick={() => {
                setEditedTitle(task.title);
                setEditedDescription(task.description);
                onFinishEditing();
              }}
            >
              Отмена
            </button>
          </div>
        </>
      ) : (
        <>
          <div className={styles.task_title}>{task.title}</div>
          <div className={styles.task_description}>{task.description}</div>
          <div className={`${styles.task_priority} ${styles[`priority_${task.priority}`]}`}>
            {task.priority}
          </div>
          <button 
            className={styles.delete_button}
            onClick={(e) => {
              e.stopPropagation();
              onDelete(task.id);
            }}
          >
            ✕
          </button>
        </>
      )}
    </div>
  );
}

export default Task;