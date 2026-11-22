import { Task } from "@prisma/client";

export interface SubTaskDto {
  id: string;
  title: string;
  isDone: boolean;
}

export function serializeTask(task: Task) {
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    priority: task.priority,
    category: task.category,
    dueDate: task.dueDate,
    isCompleted: task.isCompleted,
    isPinned: task.isPinned,
    repeatMode: task.repeatMode,
    subTasks: Array.isArray(task.subTasks) ? task.subTasks : [],
    createdAt: Number(task.createdAt),
  };
}

export function sanitizeSubTasks(input: unknown): SubTaskDto[] {
  if (!Array.isArray(input)) return [];
  return input
    .filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null)
    .map((item) => ({
      id: typeof item.id === "string" && item.id.trim() ? item.id.trim() : crypto.randomUUID(),
      title: typeof item.title === "string" ? item.title.trim() : "",
      isDone: Boolean(item.isDone),
    }))
    .filter((sub) => sub.title.length > 0);
}
