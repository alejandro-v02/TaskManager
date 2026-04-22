import { Database, Q } from '@nozbe/watermelondb';
import type { ApiTodo, SyncResult } from '../../domain/entities';
import { fetchTodos } from '../remote/fetchTodos';
import { TaskModel } from '../local/TaskModel';

// Extrae las iniciales de un nombre, "Alejandro Vitovis" → "AV"
export function extractInitials(name: string): string {
  if (!name || typeof name !== 'string') return '?';
  const trimmed = name.trim();
  if (!trimmed) return '?';
  const words = trimmed.split(/\s+/);
  if (words.length === 1) return words[0][0].toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

// Genera un color único basado en el nombre — mismo nombre = mismo color siempre
export function nameToColor(name: string): string {
  if (!name || typeof name !== 'string') return 'hsl(200, 60%, 45%)';
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash;
  }
  const hue = Math.abs(hash) % 360; // convierte el hash a un ángulo de color (0-360)
  return `hsl(${hue}, 60%, 45%)`;
}

// Convierte un userId numérico en un nombre legible para mostrar en UI
export function userIdToName(userId: number): string {
  const names = [
    'Alice Martin', 'Bob Chen', 'Carlos Rivera', 'Diana Prince',
    'Erik Svensson', 'Fatima Al-Hassan', 'George Kim',
    'Helena Santos', 'Ivan Petrov', 'Julia Weber',
  ];
  const index = (userId > 0) ? (userId - 1) % names.length : 0;
  return names[index];
}

// Sincroniza las tareas de la API con la BD local (patrón offline-first)
// Si no hay internet, retorna sin error y la app sigue funcionando con los datos locales
export async function syncTodos(database: Database): Promise<SyncResult> {
  const result: SyncResult = { created: 0, updated: 0, failed: 0 };

  let apiTodos: ApiTodo[];
  try {
    apiTodos = await fetchTodos();
  } catch (error) {
    // Sin conexión: no crashea, simplemente continúa offline
    console.warn('[syncService] API fetch failed, continuing offline:', error);
    return result;
  }

  const tasksCollection = database.get<TaskModel>('tasks');

  await database.write(async () => {
    for (const apiTodo of apiTodos) {
      try {
        // Busca si la tarea ya existe en la BD local por su remote_id
        const existing = await tasksCollection
          .query(Q.where('remote_id', apiTodo.id))
          .fetch();

        if (existing.length > 0) {
          // Ya existe → solo actualiza título (respeta el estado completed local)
          await existing[0].update((record) => {
            record.title = apiTodo.todo;
            record.userId = apiTodo.userId;
          });
          result.updated += 1;
        } else {
          // Nueva tarea → la crea en la BD local
          await tasksCollection.create((record) => {
            record.remoteId = apiTodo.id;
            record.title = apiTodo.todo;
            record.completed = apiTodo.completed;
            record.userId = apiTodo.userId;
          });
          result.created += 1;
        }
      } catch (itemError) {
        result.failed += 1;
      }
    }
  });

  return result;
}

// Cambia el estado completado/pendiente de una tarea y lo guarda en la BD local
export async function toggleTaskCompletion(
  task: TaskModel,
  completed: boolean,
): Promise<void> {
  await task.db.write(async () => {
    await task.update((record) => {
      record.completed = completed;
    });
  });
}

// Guarda la ruta de la foto adjunta en la tarea dentro de la BD local
export async function saveAttachmentUri(
  task: TaskModel,
  uri: string,
): Promise<void> {
  await task.db.write(async () => {
    await task.update((record) => {
      record.attachmentUri = uri;
    });
  });
}