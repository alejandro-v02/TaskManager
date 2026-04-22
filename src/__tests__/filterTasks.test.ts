import { FilterType } from '../domain/entities';
import type { TaskModel } from '../data/local/TaskModel';

// ─── Pure filter function (extracted from DashboardScreen for testability) ───

/**
 * Filters a flat array of tasks based on the active FilterType.
 * This logic mirrors the WatermelonDB query, and can be tested without DB.
 */
export function filterTasks(
  tasks: Pick<TaskModel, 'completed'>[],
  filter: FilterType,
): Pick<TaskModel, 'completed'>[] {
  switch (filter) {
    case FilterType.COMPLETED:
      return tasks.filter((t) => t.completed);
    case FilterType.PENDING:
      return tasks.filter((t) => !t.completed);
    case FilterType.ALL:
    default:
      return tasks;
  }
}

// ─── Tests ────────────────────────────────────────────────────────────────────

type MockTask = Pick<TaskModel, 'completed'>;

const mockTasks: MockTask[] = [
  { completed: true },
  { completed: false },
  { completed: true },
  { completed: false },
  { completed: false },
];

describe('filterTasks', () => {
  it('returns all tasks for FilterType.ALL', () => {
    const result = filterTasks(mockTasks, FilterType.ALL);
    expect(result).toHaveLength(5);
  });

  it('returns only completed tasks for FilterType.COMPLETED', () => {
    const result = filterTasks(mockTasks, FilterType.COMPLETED);
    expect(result).toHaveLength(2);
    expect(result.every((t) => t.completed)).toBe(true);
  });

  it('returns only pending tasks for FilterType.PENDING', () => {
    const result = filterTasks(mockTasks, FilterType.PENDING);
    expect(result).toHaveLength(3);
    expect(result.every((t) => !t.completed)).toBe(true);
  });

  it('returns empty array when no tasks match COMPLETED filter', () => {
    const allPending: MockTask[] = [{ completed: false }, { completed: false }];
    expect(filterTasks(allPending, FilterType.COMPLETED)).toHaveLength(0);
  });

  it('returns empty array when no tasks match PENDING filter', () => {
    const allDone: MockTask[] = [{ completed: true }, { completed: true }];
    expect(filterTasks(allDone, FilterType.PENDING)).toHaveLength(0);
  });

  it('handles empty input array', () => {
    expect(filterTasks([], FilterType.ALL)).toHaveLength(0);
    expect(filterTasks([], FilterType.COMPLETED)).toHaveLength(0);
    expect(filterTasks([], FilterType.PENDING)).toHaveLength(0);
  });
});
