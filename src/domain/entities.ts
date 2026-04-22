// ─── Domain Entities & Types ────────────────────────────────────────────────
// Pure TypeScript interfaces / types — no framework dependencies here.

/** Shape of a todo item returned by the dummyjson API */
export interface ApiTodo {
  id: number;
  todo: string;
  completed: boolean;
  userId: number;
}

/** Shape of the paginated dummyjson response */
export interface ApiTodoResponse {
  todos: ApiTodo[];
  total: number;
  skip: number;
  limit: number;
}

/** Core Task entity used throughout the domain */
export interface Task {
  id: string;           // WatermelonDB local UUID
  remoteId: number;     // dummyjson id
  title: string;
  completed: boolean;
  userId: number;
  attachmentUri: string | null;
  updatedAt: Date;
}

/** Lightweight user representation (derived from userId in this demo) */
export interface User {
  id: number;
  name: string;
}

/** Filter states available in the Dashboard */
export enum FilterType {
  ALL = 'ALL',
  COMPLETED = 'COMPLETED',
  PENDING = 'PENDING',
}

/** Result of a sync operation */
export interface SyncResult {
  created: number;
  updated: number;
  failed: number;
}

/** Camera/attachment result returned by CameraModule */
export interface CameraResult {
  uri: string;
  fileName?: string;
  width?: number;
  height?: number;
  size?: number;
}
