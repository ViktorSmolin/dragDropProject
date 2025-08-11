import { TaskData } from '../Task/type';

export interface DragDropBoardProps {
  className?: string;
  style?: React.CSSProperties;
}

export interface ColumnType {
  id: string;
  title: string;
}

export type MoveTaskAction = {
  action: "move_task";
  taskId: string;
  from: ColumnType["id"];
  to: ColumnType["id"];
  timestamp: number;
};

export type UpdateTaskAction = {
  action: "update_task";
  taskId: string;
  oldValues: TaskData;
  newValues: TaskData;
  timestamp: number;
};

export type DeleteTaskAction = {
  action: "delete_task";
  taskId: string;
  deletedTask: TaskData;
  timestamp: number;
};

export type pushStateProps = MoveTaskAction | UpdateTaskAction | DeleteTaskAction;

export interface HistoryEntry {
  state: pushStateProps;
  title: string;
  url: string;
  timestamp: number;
}

export interface HistoryHookResult {
  history: HistoryEntry[];
  currentIndex: number;
  pushState: (state: pushStateProps, title?: string, url?: string | null) => void;
  goBack: () => void;
  goForward: () => void;
  canGoBack: boolean;
  canGoForward: boolean;
}