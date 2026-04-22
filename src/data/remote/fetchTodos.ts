import axios from 'axios';
import type { ApiTodo, ApiTodoResponse } from '../../domain/entities';

const BASE_URL = 'https://dummyjson.com'; // URL base de la API externa
const TODOS_LIMIT = 150;

// Consume la API y retorna la lista de tareas
// Es la ÚNICA función que habla con el servidor — toda la UI lee desde la BD local
export async function fetchTodos(): Promise<ApiTodo[]> {
  const response = await axios.get<ApiTodoResponse>(
    `${BASE_URL}/todos?limit=${TODOS_LIMIT}&skip=0`, // trae 150 tareas desde el inicio
  );
  return response.data.todos; // retorna solo el array de tareas
}