import { useState, useEffect } from "react";
import clsx from "clsx";
import Column from "../Column/Column";
import { useNotifications } from "../../hooks/useNotifications";
import { ColumnType, DragDropBoardProps } from "./types";
import { TaskData } from "../Task/type";
import useHistory from "../../hooks/useHistory";
import HistoryNavigator from '../HistoryNavigator/HistoryNavigator';
import { createColumnNotFoundError, createDragDataError, createTaskNotFoundError, ErrorHandler, ErrorType } from "../../Util/ErrorHandler";
import NotificationPermission from "../NotificationPermission";

import styles from "./DragDropBoard.module.css";

const INITIAL_COLUMNS: ColumnType[] = [
  { id: "todo", title: "Задача" },
  { id: "inProgress", title: "В процессе" },
  { id: "done", title: "Сделано" },
];

const INITIAL_TASKS: TaskData[] = [
  {
    id: "1",
    title: "Изучить React",
    description: "Освоить основы React и создать первое приложение",
    priority: "high",
    columnId: "todo",
  },
  {
    id: "2",
    title: "Настроить Vite",
    description: "Изучить конфигурацию Vite для проекта",
    priority: "medium",
    columnId: "todo",
  },
];
function DragDropBoard({ className, style }: DragDropBoardProps) {
  const { showNotification } = useNotifications();
  const { 
    pushState, 
    goBack, 
    goForward, 
    goTo, 
    canGoBack, 
    canGoForward,
    getHistoryInfo,
    clearHistory,
    currentIndex,
    historyLength
  } = useHistory();
  
  const [columns] = useState<ColumnType[]>(INITIAL_COLUMNS);
  const [tasks, setTasks] = useState<TaskData[]>(INITIAL_TASKS);
  const [draggedTask, setDraggedTask] = useState<TaskData | null>(null);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [lastValidState, setLastValidState] = useState<TaskData[]>(INITIAL_TASKS);

  useEffect(() => {
    if (tasks.length > 0) {
      setLastValidState([...tasks]);
    }
  }, [tasks]);

  const findTaskById = (taskId: string): TaskData | undefined => {
    return tasks.find(task => task.id === taskId);
  };

  const findColumnById = (columnId: string): ColumnType | undefined => {
    return columns.find(column => column.id === columnId);
  };

  const validateTaskData = (task: TaskData): boolean => {
    if (!task.id || !task.title || !task.columnId) {
      ErrorHandler.createError(
        ErrorType.VALIDATION_ERROR,
        'Данные задачи не прошли валидацию',
        { task },
        'validation'
      );
      return false;
    }
    return true;
  };

  const showErrorNotification = (error: any, fallbackMessage: string) => {
    const message = error?.message || fallbackMessage;
    showNotification('Ошибка', { 
      body: message, 
      tag: 'error',
      icon: '❌'
    });
  };

  const recoverFromError = (errorMessage: string) => {
    console.log('🔄 Попытка восстановления состояния...');
    setTasks([...lastValidState]);
    setDraggedTask(null);
    setEditingTaskId(null);
    
    showNotification('Состояние восстановлено', {
      body: `Восстановлено после ошибки: ${errorMessage}`,
      tag: 'recovery',
      icon: '🔄'
    });
  };

  const handleDrop = (taskId: string, newColumnId: string): void => {
    try {
      console.log(`🎯 Попытка перемещения задачи ${taskId} в колонку ${newColumnId}`);

      if (!taskId || typeof taskId !== 'string') {
        const error = createDragDataError({ taskId, newColumnId });
        showErrorNotification(error, 'Некорректные данные перетаскивания');
        return;
      }

      const task = findTaskById(taskId);
      if (!task) {
        const error = createTaskNotFoundError(taskId, 'drop');
        showErrorNotification(error, `Задача не найдена: ${taskId}`);
        return;
      }

      const targetColumn = findColumnById(newColumnId);
      if (!targetColumn) {
        const error = createColumnNotFoundError(newColumnId, 'drop');
        showErrorNotification(error, `Колонка не найдена: ${newColumnId}`);
        return;
      }

      if (task.columnId === newColumnId) {
        console.log('ℹ️ Задача уже находится в этой колонке');
        return;
      }

      if (!validateTaskData(task)) {
        recoverFromError('Некорректные данные задачи');
        return;
      }

      const updatedTasks = tasks.map(t =>
        t.id === taskId ? { ...t, columnId: newColumnId } : t
      );

      const movedTask = updatedTasks.find(t => t.id === taskId);
      if (!movedTask || movedTask.columnId !== newColumnId) {
        const error = ErrorHandler.createError(
          ErrorType.UNKNOWN_ERROR,
          'Не удалось выполнить перемещение задачи',
          { taskId, newColumnId, originalColumn: task.columnId },
          'drop'
        );
        showErrorNotification(error, 'Ошибка при перемещении задачи');
        return;
      }

      setTasks(updatedTasks);

      const oldColumn = findColumnById(task.columnId);
      if (oldColumn && targetColumn) {
        const moveInfo = `перемещена из "${oldColumn.title}" в "${targetColumn.title}"`;
        showNotification("Задача перемещена!", { 
          body: `"${task.title}" ${moveInfo}`, 
          tag: "task-moved" 
        });
      }

      pushState(
        {
          action: "move_task",
          taskId,
          from: task.columnId,
          to: newColumnId,
          timestamp: Date.now(),
        },
        `Moved ${task.title}`,
        `?moved=${taskId}`
      );

      console.log(`✅ Задача "${task.title}" успешно перемещена из ${task.columnId} в ${newColumnId}`);

    } catch (error) {
      console.error('💥 Критическая ошибка при перетаскивании:', error);
      
      const appError = ErrorHandler.createError(
        ErrorType.UNKNOWN_ERROR,
        'Критическая ошибка при перетаскивании',
        { error: error instanceof Error ? error.message : error, taskId, newColumnId },
        'drop',
        false
      );

      showErrorNotification(appError, 'Произошла критическая ошибка');
      recoverFromError('Критическая ошибка при перетаскивании');
    }
  };

  const handleDeleteTask = (taskId: string): void => {
    try {
      const taskToDelete = findTaskById(taskId);
      if (!taskToDelete) {
        const error = createTaskNotFoundError(taskId, 'delete');
        showErrorNotification(error, 'Задача для удаления не найдена');
        return;
      }

      const confirmMessage = `Вы уверены, что хотите удалить задачу "${taskToDelete.title}"?`;
      
      if (!window.confirm(confirmMessage)) {
        console.log('🚫 Удаление отменено пользователем');
        return;
      }

      const updatedTasks = tasks.filter(t => t.id !== taskId);
      
      if (updatedTasks.find(t => t.id === taskId)) {
        const error = ErrorHandler.createError(
          ErrorType.UNKNOWN_ERROR,
          'Не удалось удалить задачу',
          { taskId, taskTitle: taskToDelete.title },
          'delete'
        );
        showErrorNotification(error, 'Ошибка при удалении задачи');
        return;
      }

      setTasks(updatedTasks);

      showNotification("Задача удалена!", { 
        body: `"${taskToDelete.title}" была удалена`, 
        tag: "task-deleted" 
      });

      pushState(
        {
          action: "delete_task",
          taskId,
          deletedTask: taskToDelete,
          timestamp: Date.now(),
        },
        `Deleted ${taskToDelete.title}`,
        `?deleted=${taskId}`
      );

      console.log(`🗑️ Задача "${taskToDelete.title}" успешно удалена`);

    } catch (error) {
      console.error('💥 Ошибка при удалении задачи:', error);
      
      const appError = ErrorHandler.createError(
        ErrorType.UNKNOWN_ERROR,
        'Ошибка при удалении задачи',
        { error: error instanceof Error ? error.message : error, taskId },
        'delete'
      );

      showErrorNotification(appError, 'Не удалось удалить задачу');
      recoverFromError('Ошибка при удалении задачи');
    }
  };

  const handleUpdateTask = (taskId: string, updatedFields: Partial<TaskData>): void => {
    try {
      const oldTask = findTaskById(taskId);
      if (!oldTask) {
        const error = createTaskNotFoundError(taskId, 'update');
        showErrorNotification(error, 'Задача для обновления не найдена');
        return;
      }

      const updatedTask = { ...oldTask, ...updatedFields };
      if (!validateTaskData(updatedTask)) {
        recoverFromError('Некорректные данные при обновлении задачи');
        return;
      }

      const updatedTasks = tasks.map(task =>
        task.id === taskId ? updatedTask : task
      );
      
      setTasks(updatedTasks);

      showNotification("Задача обновлена!", { 
        body: `"${updatedTask.title}" была обновлена`, 
        tag: "task-updated" 
      });

      pushState(
        {
          action: "update_task",
          taskId,
          oldValues: oldTask,
          newValues: updatedTask,
          timestamp: Date.now(),
        },
        "Updated task",
        `?updated=${taskId}`
      );

      console.log(`✏️ Задача "${updatedTask.title}" успешно обновлена`);

    } catch (error) {
      console.error('Ошибка при обновлении задачи:', error);
      
      const appError = ErrorHandler.createError(
        ErrorType.UNKNOWN_ERROR,
        'Ошибка при обновлении задачи',
        { error: error instanceof Error ? error.message : error, taskId, updatedFields },
        'update'
      );

      showErrorNotification(appError, 'Не удалось обновить задачу');
      recoverFromError('Ошибка при обновлении задачи');
    }
  };

  const handleStartEditing = (taskId: string): void => {
    setEditingTaskId(taskId);
  };

  const handleFinishEditing = (): void => {
    setEditingTaskId(null);
  };

  const handleDragStart = (task: TaskData): void => {
    setDraggedTask(task);
    console.log("🚀 Начал тянуть:", task.title);
  };

  const handleDragEnd = (task: TaskData): void => {
    setDraggedTask(null);
    console.log("🏁 Закончил тянуть:", task.title);
  };

  const getTasksForColumn = (columnId: string): TaskData[] => {
    return tasks.filter(task => task.columnId === columnId);
  };

  const addNewTask = (): void => {
    try {
      const newTask: TaskData = {
        id: Date.now().toString(),
        title: `Новая задача ${tasks.length + 1}`,
        description: "Описание новой задачи",
        priority: "medium",
        columnId: "todo",
      };

      if (!validateTaskData(newTask)) {
        showErrorNotification(null, 'Не удалось создать задачу');
        return;
      }

      setTasks(prev => [...prev, newTask]);
      showNotification("Задача создана!", { 
        body: `"${newTask.title}" создана`, 
        tag: "task-created" 
      });

      console.log(`➕ Создана новая задача: "${newTask.title}"`);

    } catch (error) {
      console.error('Ошибка при создании задачи:', error);
      
      const appError = ErrorHandler.createError(
        ErrorType.UNKNOWN_ERROR,
        'Ошибка при создании задачи',
        { error: error instanceof Error ? error.message : error },
        'create'
      );

      showErrorNotification(appError, 'Не удалось создать задачу');
    }
  };

  const renderBoardControls = () => {
    const historyInfo = getHistoryInfo();
    const errorStats = ErrorHandler.getErrorStats();
    
    return (
      <>
        <div className={styles.board_controls}>
          <button
            onClick={goBack}
            disabled={!canGoBack}
            className={styles.history_btn}
          >
            ← Назад
          </button>

          <button
            onClick={goForward}
            disabled={!canGoForward}
            className={styles.history_btn}
          >
            Вперед →
          </button>

          <div className={styles.history_info_compact}>
            <span>Позиция: {currentIndex >= 0 ? currentIndex + 1 : 0} из {historyLength}</span>
            {errorStats.total > 0 && (
              <span className={styles.error_indicator}>
                ⚠️ {errorStats.total} ошибок
              </span>
            )}
          </div>

          <button onClick={addNewTask} className={styles.add_task_btn}>
            + Добавить задачу
          </button>

          {errorStats.total > 0 && (
            <button 
              onClick={() => {
                ErrorHandler.clearErrors();
                showNotification('Журнал ошибок очищен', { tag: 'info' });
              }}
              className={styles.clear_errors_btn}
            >
              Очистить ошибки
            </button>
          )}
        </div>

        <HistoryNavigator
          history={historyInfo.history}
          currentIndex={historyInfo.currentIndex}
          onGoTo={goTo}
          onClear={clearHistory}
        />
      </>
    );
  };


  const renderEditHint = () => (
    <div className={styles.edit_hint}>
      <span className={styles.hint_icon}>💡</span>
      <span>Совет: Дважды кликните по задаче, чтобы редактировать её</span>
    </div>
  );

  const renderDragInfo = () => draggedTask && (
    <div className={styles.history_info}>
      Перетаскивается: {draggedTask.title}
    </div>
  );

  const renderColumns = () => (
    <div className={styles.board_columns}>
      {columns.map(column => (
        <Column
          key={column.id}
          column={column}
          tasks={getTasksForColumn(column.id)}
          onDrop={handleDrop}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDeleteTask={handleDeleteTask}
          onUpdateTask={handleUpdateTask}
          onStartEditing={handleStartEditing}
          onFinishEditing={handleFinishEditing}
          editingTaskId={editingTaskId}
          draggedTaskId={draggedTask?.id || null}
        />
      ))}
    </div>
  );

  return (
    <div className={clsx(styles.root, className)} style={style}>
      <NotificationPermission />
      {renderBoardControls()}
      {renderEditHint()}
      {renderDragInfo()}
      {renderColumns()}
    </div>
  );
  
}

export default DragDropBoard;