import { appSchema, tableSchema } from '@nozbe/watermelondb';

// appSchema define la estructura completa de la base de datos.
// para que WatermelonDB sepa que debe actualizar la BD en el dispositivo
export const schema = appSchema({
  version: 3,// version: 3 → si cambias columnas o tablas, subes este número
  tables: [

    // ── Tabla principal de tareas ──────────────────────────────────────
    tableSchema({
      name: 'tasks',
      columns: [
        { name: 'remote_id', type: 'number' },   // ID que viene de la API (dummyjson)
        { name: 'title', type: 'string' },        // texto de la tarea
        { name: 'completed', type: 'boolean' },   // true = completada, false = pendiente
        { name: 'user_id', type: 'number' },      // a qué usuario pertenece
        { name: 'attachment_uri', type: 'string', isOptional: true }, // ruta local de la foto (puede ser null)
        { name: 'updated_at', type: 'number' },   // fecha de última modificación (timestamp)
      ],
    }),

    tableSchema({
      name: 'task_attachments',
      columns: [
        { name: 'task_id', type: 'string', isIndexed: true }, 
        { name: 'uri', type: 'string' },  
        { name: 'file_name', type: 'string', isOptional: true },  
        { name: 'width', type: 'number', isOptional: true },  
        { name: 'height', type: 'number', isOptional: true },
        { name: 'size', type: 'number', isOptional: true }, 
      ],
    }),
  ],
});