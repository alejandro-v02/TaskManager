import { create } from 'zustand';
import { FilterType } from '../domain/entities';

/**
 * App-wide Zustand store.
 *
 * Note: Task data itself is NOT stored here — it lives in WatermelonDB
 * and is read reactively via withObservables in DashboardScreen.
 * This store holds only UI/control state.
 */
interface TaskStoreState {
  /** Current active filter applied to the task list */
  filter: FilterType;
  /** Whether a sync operation is in progress */
  isSyncing: boolean;
  /** Last sync error message, or null if no error */
  syncError: string | null;

  // Actions
  setFilter: (filter: FilterType) => void;
  setSyncing: (isSyncing: boolean) => void;
  setSyncError: (error: string | null) => void;
}

export const useTaskStore = create<TaskStoreState>((set) => ({
  filter: FilterType.ALL,
  isSyncing: false,
  syncError: null,

  setFilter: (filter) => set({ filter }),
  setSyncing: (isSyncing) => set({ isSyncing }),
  setSyncError: (syncError) => set({ syncError }),
}));
