
export interface SheetRow {
  id: string;
  timestamp: string;
  user: string;
  source: string;
  status: 'active' | 'pending' | 'completed';
  value: number;
}

export interface AppState {
  spreadsheetId: string;
  lastProcessedCount: number;
  rows: SheetRow[];
}

export enum ViewMode {
  ALL = 'all',
  NEW = 'new'
}
