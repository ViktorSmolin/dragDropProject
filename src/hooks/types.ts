import { pushStateProps } from "../components/DragDropBoard/types";

 interface HistoryEntry {
  state: pushStateProps;
  title: string;
  timestamp: number;
  url: string;
}
export interface HistoryHookResult {
  history: HistoryEntry[];
  currentIndex: number;
  pushState: (
    state: pushStateProps,
    title?: string,
    url?: string | null
  ) => void;
  goBack: () => void;
  goForward: () => void;
  canGoBack: boolean;
  canGoForward: boolean;
}
export interface NotificationOptions {
  body?: string;
  tag?: string;
  [key: string]: any;
}
