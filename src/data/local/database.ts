import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import { schema } from './schema';
import { TaskModel } from './TaskModel';
import { TaskAttachmentModel } from './TaskAttachmentModel';

// SQLiteAdapter es el "motor" de la BD — guarda los datos en SQLite
// dentro del dispositivo, lo que permite que la app funcione sin internet
const adapter = new SQLiteAdapter({
  schema,// estructura de las tablas (columnas y tipos)
  migrations: undefined,
  jsi: false,
  onSetUpError: (error: Error) => {
    console.error('[WatermelonDB] Setup error:', error);
  },
});
//todos los archivos comparten LA MISMA conexión a la BD
export const database = new Database({
  adapter,
  modelClasses: [TaskModel, TaskAttachmentModel],
});
