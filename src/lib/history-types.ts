export type HistoryItem = {
  id: string; name: string; type: 'text' | 'image' | 'video'; module: string;
  result: string; confidence: number; date: string; status: 'completed' | 'processing' | 'failed';
};
export type HistoryPage = {items: HistoryItem[]; nextCursor: string | null; isGuest: boolean};
