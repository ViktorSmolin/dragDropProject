import styles from './Column.module.css';
import Task from '../Task/Task';

function Column({column, 
  tasks, 
  onDrop, 
  onDragStart, 
  onDragEnd, 
  onDeleteTask,
  onUpdateTask,
  onStartEditing,
  onFinishEditing,
  editingTaskId }) {
  const columnClass = `column_${column.id}`;
  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add(styles.drag_over);
  };
  
  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove(styles.drag_over);
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove(styles.drag_over);
    
    // Получаем id задачи из данных перетаскивания
    const taskId = e.dataTransfer.getData('text/plain');
    onDrop(taskId, column.id);
  };

  return  (
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
        {tasks.length > 0 ? (
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
            />
          ))
        ) : (
          <div className={styles.empty_column}>
            Перетащите задачу сюда
          </div>
        )}
      </div>
    </div>
  );
}

export default Column;