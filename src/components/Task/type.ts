export interface TaskData {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  columnId: string;
}

export interface TaskProps {
  task: TaskData;
  onDragStart: (task: TaskData) => void;
  onDragEnd: (task: TaskData) => void;
  onDelete: (taskId: string) => void;
  onUpdate: (taskId: string, updates: Partial<TaskData>) => void;
  onStartEditing: (taskId: string) => void;
  onFinishEditing: () => void;
  isEditing: boolean;
  isDragging: boolean;
}