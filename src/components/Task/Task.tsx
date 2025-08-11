import { useState, useRef, useEffect } from 'react';
import { TaskProps } from './type';
import styles from './Task.module.css';

const KEYBOARD_KEYS = {
  ENTER: 'Enter',
  ESCAPE: 'Escape'
} as const;

function Task({ 
  task, 
  onDragStart, 
  onDragEnd, 
  onDelete, 
  onUpdate,
  onStartEditing,
  onFinishEditing,
  isEditing,
  isDragging = false 
}: TaskProps) {
  const [editedTitle, setEditedTitle] = useState(task.title);
  const [editedDescription, setEditedDescription] = useState(task.description);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const [isDragActive, setIsDragActive] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const taskRef = useRef<HTMLDivElement>(null);

  const resetEditedValues = () => {
    setEditedTitle(task.title);
    setEditedDescription(task.description);
  };

  const isValidTitle = (title: string): boolean => {
    return title.trim() !== '';
  };

  const handleDoubleClick = () => {
    if (!isDragging) {
      onStartEditing(task.id);
    }
  };

  const handleSave = () => {
    if (!isValidTitle(editedTitle)) {
      return;
    }
    
    onUpdate(task.id, {
      title: editedTitle,
      description: editedDescription
    });
    
    onFinishEditing();
  };

  const handleCancel = () => {
    resetEditedValues();
    onFinishEditing();
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.key === KEYBOARD_KEYS.ENTER && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === KEYBOARD_KEYS.ESCAPE) {
      handleCancel();
    }
  };

  const createCustomGhostElement = (): HTMLElement => {
    const ghostElement = document.createElement('div');
    ghostElement.className = styles.custom_ghost;
    
    ghostElement.innerHTML = `
      <div class="${styles.ghost_header}">
        <div class="${styles.ghost_icon}">📋</div>
        <div class="${styles.ghost_title}">${task.title}</div>
      </div>
      <div class="${styles.ghost_body}">
        <div class="${styles.ghost_description}">${task.description}</div>
        <div class="${styles.ghost_priority} ${styles[`ghost_priority_${task.priority}`]}">
          ${task.priority}
        </div>
      </div>
      <div class="${styles.ghost_footer}">
        <div class="${styles.ghost_drag_hint}">🔄 Перетаскивание...</div>
      </div>
    `;

    ghostElement.style.position = 'absolute';
    ghostElement.style.top = '-1000px';
    ghostElement.style.left = '-1000px';
    ghostElement.style.pointerEvents = 'none';
    
    document.body.appendChild(ghostElement);
    
    return ghostElement;
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    if (!isEditing) {
      e.dataTransfer.setData('text/plain', task.id);
      setIsDragActive(true);
      setDragPosition({ x: e.clientX, y: e.clientY });
      
      const customGhost = createCustomGhostElement();
      
      e.dataTransfer.setDragImage(customGhost, 150, 75); 
      
      setTimeout(() => {
        if (document.body.contains(customGhost)) {
          document.body.removeChild(customGhost);
        }
      }, 0);
      
      e.dataTransfer.effectAllowed = 'move';
      
      console.log(`🚀 Начало перетаскивания задачи: "${task.title}"`);
      console.log(`📍 Начальная позиция: x=${e.clientX}, y=${e.clientY}`);
      console.log(`👻 Создан кастомный ghost элемент`);
      
      onDragStart(task);
    }
  };

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    if (!isEditing && isDragActive) {
      if (e.clientX !== 0 && e.clientY !== 0) {
        const newPosition = { x: e.clientX, y: e.clientY };
        setDragPosition(newPosition);
        
        const distance = Math.sqrt(
          Math.pow(newPosition.x - dragPosition.x, 2) + 
          Math.pow(newPosition.y - dragPosition.y, 2)
        );
        
        if (distance > 50) {
          console.log(`🔄 Перетаскивание "${task.title}": x=${e.clientX}, y=${e.clientY}`);
        }
      }
    }
  };

  const handleDragEnd = () => {
    if (!isEditing) {
      setIsDragActive(false);
      setDragPosition({ x: 0, y: 0 });
      
      console.log(`✅ Завершено перетаскивание задачи: "${task.title}"`);
      console.log(`👻 Ghost элемент удален`);
      
      onDragEnd(task);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(task.id);
  };

  const renderDragIndicator = () => (
    <div className={styles.drag_indicator}>
      <svg 
        width="12" 
        height="12" 
        viewBox="0 0 12 12" 
        fill="none"
        className={styles.drag_icon}
      >
        <path 
          d="M2 2L10 10M10 2L2 10" 
          stroke="#ff4757" 
          strokeWidth="2" 
          strokeLinecap="round"
        />
      </svg>
      {isDragActive && (
        <div className={styles.drag_coordinates}>
          {dragPosition.x}, {dragPosition.y}
        </div>
      )}
    </div>
  );

  const renderDragCorners = () => (
    <>
      <div className={`${styles.drag_corner} ${styles.drag_corner_bottom_right}`} />
    </>
  );

  const renderEditMode = () => (
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
          onClick={handleCancel}
        >
          Отмена
        </button>
      </div>
    </>
  );

  const renderViewMode = () => (
    <>
      {renderDragCorners()}
      
      <div className={styles.task_content}>
        <div className={styles.task_title}>{task.title}</div>
        <div className={styles.task_description}>{task.description}</div>
        <div className={`${styles.task_priority} ${styles[`priority_${task.priority}`]}`}>
          {task.priority}
        </div>
      </div>
      
      {isDragging && renderDragIndicator()}
      
      <button 
        className={styles.delete_button}
        onClick={handleDeleteClick}
      >
        ✕
      </button>
    </>
  );

  useEffect(() => {
    if (isEditing && titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, [isEditing]);
  
  return (
    <div 
      ref={taskRef}
      className={`${styles.task} ${isEditing ? styles.editing : ''} ${isDragging ? styles.dragging : ''} ${isDragActive ? styles.drag_active : ''}`}
      draggable={!isEditing}
      onDragStart={handleDragStart}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      data-task-id={task.id}
      onDoubleClick={handleDoubleClick}
    >
      {isEditing ? renderEditMode() : renderViewMode()}
    </div>
  );
}

export default Task;