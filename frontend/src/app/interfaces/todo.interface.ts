export interface TodoDto {
  id: string;
  title: string;
  description: string | null;
  isCompleted: boolean;
  createdAt: string;
  dueDate: string | null;
}

export interface CreateTodoRequest {
  title: string;
  description: string | null;
  dueDate: string | null;
  requestId: string;
}

export interface UpdateTodoRequest {
  id: string;
  title: string;
  description: string | null;
  isCompleted: boolean;
  dueDate: string | null;
}