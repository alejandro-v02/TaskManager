import { useTaskStore } from '@/store/taskStore';
import { FilterType } from '@/domain/entities';

/**
 * Tests for the Zustand taskStore.
 * Verifies that filter, isSyncing, and syncError are correctly managed.
 */
describe('taskStore', () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    useTaskStore.setState({
      filter: FilterType.ALL,
      isSyncing: false,
      syncError: null,
    });
  });

  it('defaults to FilterType.ALL', () => {
    const { filter } = useTaskStore.getState();
    expect(filter).toBe(FilterType.ALL);
  });

  it('setFilter changes the active filter', () => {
    useTaskStore.getState().setFilter(FilterType.COMPLETED);
    expect(useTaskStore.getState().filter).toBe(FilterType.COMPLETED);
  });

  it('setFilter can switch to PENDING', () => {
    useTaskStore.getState().setFilter(FilterType.PENDING);
    expect(useTaskStore.getState().filter).toBe(FilterType.PENDING);
  });

  it('setFilter can switch back to ALL', () => {
    useTaskStore.getState().setFilter(FilterType.COMPLETED);
    useTaskStore.getState().setFilter(FilterType.ALL);
    expect(useTaskStore.getState().filter).toBe(FilterType.ALL);
  });

  it('setSyncing toggles the isSyncing flag', () => {
    useTaskStore.getState().setSyncing(true);
    expect(useTaskStore.getState().isSyncing).toBe(true);

    useTaskStore.getState().setSyncing(false);
    expect(useTaskStore.getState().isSyncing).toBe(false);
  });

  it('setSyncError stores an error message', () => {
    useTaskStore.getState().setSyncError('Network timeout');
    expect(useTaskStore.getState().syncError).toBe('Network timeout');
  });

  it('setSyncError can be cleared to null', () => {
    useTaskStore.getState().setSyncError('Some error');
    useTaskStore.getState().setSyncError(null);
    expect(useTaskStore.getState().syncError).toBeNull();
  });
});
