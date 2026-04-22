import { Model } from '@nozbe/watermelondb';
import { field, date, readonly } from '@nozbe/watermelondb/decorators';
import type { Associations } from '@nozbe/watermelondb/Model';

// Modelo de la tabla 'tasks' en la BD local
export class TaskModel extends Model {
  static table = 'tasks';

  // Una tarea puede tener muchas fotos adjuntas, por eso es "has_many"
  static associations: Associations = {
    task_attachments: { type: 'has_many', foreignKey: 'task_id' },
  };

  @field('remote_id') remoteId!: number;  // ID de la API
  @field('title') title!: string;    
  @field('completed') completed!: boolean;   
  @field('user_id') userId!: number;          
  @field('attachment_uri') attachmentUri!: string | null; 

  // @readonly → WatermelonDB lo actualiza solo, no se puede modificar manualmente
  @readonly @date('updated_at') updatedAt!: Date;
}