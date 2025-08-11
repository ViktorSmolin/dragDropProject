export interface TaskData {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  columnId: string;
}

export interface ColumnProps {
  column: {
    id: string;
    title: string;
  };
  tasks: TaskData[];
  onDrop: (taskId: string, columnId: string) => void;
  onDragStart: (task: TaskData) => void;
  onDragEnd: (task: TaskData) => void;
  onDeleteTask: (taskId: string) => void;
  onUpdateTask: (taskId: string, updatedData: Partial<TaskData>) => void;
  onStartEditing: (taskId: string) => void;
  onFinishEditing: () => void;
  editingTaskId: string | null;
  draggedTaskId: string | null;
}

export interface ColumnData {
  id: string;
  title: string;
}

export interface TaskProps {
  task: TaskData;
  onDragStart: (task: TaskData) => void;
  onDragEnd: (task: TaskData) => void;
  onDelete: (taskId: string) => void;
  onUpdate: (taskId: string, updatedData: Partial<TaskData>) => void;
  onStartEditing: (taskId: string) => void;
  onFinishEditing: () => void;
  isEditing: boolean;
}