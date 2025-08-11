import Task from '../Task/Task';
import { DragEvent } from 'react';
import { ColumnProps } from './type';
import styles from './Column.module.css';

const DRAG_DATA_TYPE = 'text/plain';

function Column({
  column, 
  tasks, 
  onDrop, 
  onDragStart, 
  onDragEnd, 
  onDeleteTask,
  onUpdateTask,
  onStartEditing,
  onFinishEditing,
  editingTaskId,
  draggedTaskId,
}: ColumnProps) {
  const columnClass = `column_${column.id}`;
  
  const addDragOverStyle = (element: HTMLDivElement) => {
    element.classList.add(styles.drag_over);
  };
  
  const removeDragOverStyle = (element: HTMLDivElement) => {
    element.classList.remove(styles.drag_over);
  };
  
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    addDragOverStyle(e.currentTarget);
  };
  
  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    removeDragOverStyle(e.currentTarget);
  };
  
  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    removeDragOverStyle(e.currentTarget);
    
    const taskId = e.dataTransfer.getData(DRAG_DATA_TYPE);
    if (taskId) {
      onDrop(taskId, column.id);
    }
  };

  const renderEmptyState = () => (
    <div className={styles.empty_column}>
      Перетащите задачу сюда
    </div>
  );

  const renderTasks = () => (
    tasks.map(task => (
      <Task
        key={task.id}
        task={task}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDelete={onDeleteTask}
        onUpdate={onUpdateTask}
        onStartEditing={onStartEditing}
        onFinishEditing={onFinishEditing}
        isEditing={editingTaskId === task.id}
        isDragging={draggedTaskId === task.id}
      />
    ))
  );

  if (!tasks) {
    return <div className={styles.empty_column} />;
  }

  const hasNoTasks = tasks.length === 0;

  return (
    <div 
      className={`${styles.column} ${styles[columnClass]}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <h2 className={styles.column_header}>
        {column.title}
        <span className={styles.task_counter}>{tasks.length}</span>
      </h2>
      
      <div className={styles.column_content}>
        {hasNoTasks ? renderEmptyState() : renderTasks()}
      </div>
    </div>
  );
}

export default Column;