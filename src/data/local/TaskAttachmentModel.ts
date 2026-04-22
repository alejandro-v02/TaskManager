import { Model } from '@nozbe/watermelondb';
import { field, relation } from '@nozbe/watermelondb/decorators';
import type { Associations } from '@nozbe/watermelondb/Model';
import { TaskModel } from './TaskModel';

export class TaskAttachmentModel extends Model {
  
  // Nombre de la tabla en la BD donde se guardan estos registros
  static table = 'task_attachments';

  // Define la relación: este attachment "pertenece a" una task
  // usando task_id como llave foránea
  static associations: Associations = {
    tasks: { type: 'belongs_to', key: 'task_id' },
  };

  // @field mapea cada propiedad con su columna en la tabla
  @field('task_id') taskId!: string; 
  @field('uri') uri!: string;   
  @field('file_name') fileName!: string | null;  
  @field('width') width!: number | null;        
  @field('height') height!: number | null;  
  @field('size') size!: number | null;  

  // @relation permite acceder directamente al objeto TaskModel relacionado
  @relation('tasks', 'task_id') task!: TaskModel;
}