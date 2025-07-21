import { useState, useEffect } from "react";
import Column from "../Column/Column";
import { useNotifications } from "../../hooks/useNotifications";
import { useHistory } from "../../hooks/useHistory";

import styles from "./DragDropBoard.module.css";

function DragDropBoard() {
  const { showNotification } = useNotifications();
  const { pushState, goBack, goForward, canGoBack, canGoForward } =
    useHistory();
  const [columns] = useState([
    { id: "todo", title: "Задача" },
    { id: "inProgress", title: "В процессе" },
    { id: "done", title: "Сделано" },
  ]);
  const [tasks, setTasks] = useState([
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
  ]);
  // Состояние для отслеживания перетаскиваемой задачи
  const [draggedTask, setDraggedTask] = useState(null);
  const [editingTaskId, setEditingTaskId] = useState(null);

  const handleUpdateTask = (taskId, updatedFields) => {
    const updatedTasks = tasks.map((task) =>
      task.id === taskId ? { ...task, ...updatedFields } : task
    );
    setTasks(updatedTasks);
    showNotification("Задача обновлена!", {
      body: `Задача "${
        updatedTasks.find((t) => t.id === taskId).title
      }" была обновлена`,
      tag: "task-updated",
    });

    pushState(
      {
        action: "update_task",
        taskId,
        oldValues: tasks.find((t) => t.id === taskId),
        newValues: updatedTasks.find((t) => t.id === taskId),
        timestamp: Date.now(),
      },
      `Updated task`,
      `?updated=${taskId}`
    );
  };

  const handleStartEditing = (taskId) => {
    setEditingTaskId(taskId);
  };

  const handleFinishEditing = () => {
    setEditingTaskId(null);
  };

  const handleDragStart = (task) => {
    setDraggedTask(task);
    console.log("Начал тянуть:", task.title);
  };

  const handleDragEnd = (task) => {
    setDraggedTask(null);
    console.log("Закончил тянуть:", task.title);
  };

  const handleDrop = (taskId, newColumnId) => {
    const task = tasks.find((t) => t.id === taskId);

    if (!task) return;

    if (task.columnId === newColumnId) return;

    const oldState = { tasks: [...tasks] };

    console.log(oldState);

    const updatedTasks = tasks.map((t) =>
      t.id === taskId ? { ...t, columnId: newColumnId } : t
    );

    setTasks(updatedTasks);

    const oldColumn = columns.find((c) => c.id === task.columnId);
    const newColumn = columns.find((c) => c.id === newColumnId);

    showNotification("Задача перемещена!", {
      body: `"${task.title}" перемещена из "${oldColumn?.title}" в "${newColumn?.title}"`,
      tag: "task-moved",
    });

    // Добавляем действие в историю браузера
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

    console.log(
      `Задача "${task.title}" переехала из ${task.columnId} to ${newColumnId}`
    );
  };

  // Обработчик удаления задачи
  const handleDeleteTask = (taskId) => {
    const taskToDelete = tasks.find((t) => t.id === taskId);

    if (!taskToDelete) return;

    // Подтверждение удаления
    if (
      window.confirm(
        `Вы уверены, что хотите удалить задачу "${taskToDelete.title}"?`
      )
    ) {
      // Удаляем задачу из массива
      const updatedTasks = tasks.filter((t) => t.id !== taskId);

      setTasks(updatedTasks);

      showNotification("Задача удалена!", {
        body: `Задача "${taskToDelete.title}" была удалена`,
        tag: "task-deleted",
      });

      // Добавляем действие в историю браузера
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

      console.log(`Задача "${taskToDelete.title}" удалена`);
    }
  };

  const getTasksForColumn = (columnId) => {
    return tasks.filter((task) => task.columnId === columnId);
  };

  const addNewTask = () => {
    const newTask = {
      id: Date.now().toString(), // Простой способ создать уникальный ID
      title: `Новая задача ${tasks.length + 1}`,
      description: "Описание новой задачи",
      priority: "medium",
      columnId: "todo",
    };

    setTasks((prev) => [...prev, newTask]);

    showNotification("Задача создана!", {
      body: `Создана новая задача: "${newTask.title}"`,
      tag: "task-created",
    });
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const movedTaskId = urlParams.get("moved");

    if (movedTaskId) {
      const taskElement = document.querySelector(
        `[data-task-id="${movedTaskId}"]`
      );
      if (taskElement) {
        taskElement.classList.add("highlighted");
        setTimeout(() => {
          taskElement.classList.remove("highlighted");
        }, 2000);
      }
    }
  }, [tasks]);

  return (
    <div className={styles.drag_drop_board}>
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

        <button onClick={addNewTask} className={styles.add_task_btn}>
          + Добавить задачу
        </button>
      </div>
      <div className={styles.edit_hint}>
        <span className={styles.hint_icon}>💡</span>
        <span>Совет: Дважды кликните по задаче, чтобы редактировать её</span>
      </div>
      {draggedTask && (
        <div className={styles.history_info}>
          Перетаскивается: {draggedTask.title}
        </div>
      )}
      <div className={styles.board_columns}>
        {columns.map((column) => (
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
          />
        ))}
      </div>
    </div>
  );
}

export default DragDropBoard;
