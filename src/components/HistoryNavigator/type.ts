export interface HistoryEntry {
  state: any;
  title: string;
  url: string;
  index: number;
}

export interface HistoryNavigatorProps {
  history: HistoryEntry[];
  currentIndex: number;
  onGoTo: (index: number) => void;
  onClear: () => void;
}