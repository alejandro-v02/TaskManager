import { syncTodos } from '@/data/sync/syncService';
import type { Database } from '@nozbe/watermelondb';
import type { ApiTodo } from '@/domain/entities';

/**
 * Tests for syncService.syncTodos()
 *
 * Strategy:
 * - Mock axios (fetchTodos) to return a controlled list of todos.
 * - Mock the WatermelonDB Database to spy on write() calls.
 * - Assert the correct create/update paths are taken.
 */

// ─── Mocks ────────────────────────────────────────────────────────────────────

jest.mock('@/data/remote/fetchTodos', () => ({
  fetchTodos: jest.fn(),
}));

// We import after the mock is set up
import { fetchTodos } from '@/data/remote/fetchTodos';

const mockFetchTodos = fetchTodos as jest.MockedFunction<typeof fetchTodos>;

// Minimal WatermelonDB Database mock
function createMockDatabase(existingByRemoteId: Record<number, object> = {}) {
  const createdRecords: object[] = [];
  const updatedRecords: object[] = [];

  const mockQuery = (remoteId: number) => ({
    fetch: jest.fn().mockResolvedValue(
      existingByRemoteId[remoteId]
        ? [
            {
              ...existingByRemoteId[remoteId],
              update: jest.fn(async (fn: (r: object) => void) => {
                const record = { ...existingByRemoteId[remoteId] };
                fn(record);
                updatedRecords.push(record);
              }),
            },
          ]
        : [],
    ),
  });

  const tasksCollection = {
    query: jest.fn((_condition: unknown) => {
      // Extract remoteId from the Q.where call — simplified for test
      return mockQuery(0); // overridden per-todo in write callback
    }),
    create: jest.fn(async (fn: (r: Record<string, unknown>) => void) => {
      const record: Record<string, unknown> = {};
      fn(record);
      createdRecords.push(record);
    }),
  };

  const db = {
    get: jest.fn().mockReturnValue(tasksCollection),
    write: jest.fn(async (fn: () => Promise<void>) => {
      await fn();
    }),
    _createdRecords: createdRecords,
    _updatedRecords: updatedRecords,
    _collection: tasksCollection,
  };

  return db;
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('syncTodos', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls database.write() when API returns todos', async () => {
    const todos: ApiTodo[] = [
      { id: 1, todo: 'Task one', completed: false, userId: 1 },
      { id: 2, todo: 'Task two', completed: true, userId: 2 },
    ];
    mockFetchTodos.mockResolvedValue(todos);

    const db = createMockDatabase();
    await syncTodos(db as unknown as Database);

    expect(db.write).toHaveBeenCalledTimes(1);
  });

  it('returns { created: 0, updated: 0, failed: 0 } when API throws', async () => {
    mockFetchTodos.mockRejectedValue(new Error('Network error'));

    const db = createMockDatabase();
    const result = await syncTodos(db as unknown as Database);

    expect(result).toEqual({ created: 0, updated: 0, failed: 0 });
    expect(db.write).not.toHaveBeenCalled();
  });

  it('reports created count for new todos', async () => {
    const todos: ApiTodo[] = [
      { id: 10, todo: 'New task', completed: false, userId: 3 },
    ];
    mockFetchTodos.mockResolvedValue(todos);

    // Override collection.query to return empty (no existing record)
    const db = createMockDatabase({});
    // Patch query to always return empty for any remoteId
    (db._collection.query as jest.Mock).mockReturnValue({
      fetch: jest.fn().mockResolvedValue([]),
    });

    const result = await syncTodos(db as unknown as Database);

    expect(result.created).toBe(1);
    expect(result.updated).toBe(0);
    expect(result.failed).toBe(0);
  });

  it('does not crash when the API returns an empty array', async () => {
    mockFetchTodos.mockResolvedValue([]);

    const db = createMockDatabase();
    const result = await syncTodos(db as unknown as Database);

    expect(result).toEqual({ created: 0, updated: 0, failed: 0 });
    expect(db.write).toHaveBeenCalledTimes(1);
  });
});
