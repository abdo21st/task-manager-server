import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import { sanitizeSubTasks, serializeTask } from "@/lib/taskSerializer";

const ALLOWED_PRIORITIES = new Set(["HIGH", "MEDIUM", "LOW"]);
const ALLOWED_CATEGORIES = new Set(["WORK", "PERSONAL", "SHOPPING", "STUDY", "GENERAL"]);
const ALLOWED_REPEATS = new Set(["NONE", "DAILY", "WEEKLY"]);

export async function PUT(
  request: NextRequest,
  context: { params: { id: string } }
) {
  const auth = getAuthenticatedUser(request);
  if (!auth) {
    return NextResponse.json({ error: "غير مصرح، يرجى تسجيل الدخول" }, { status: 401 });
  }

  const taskId = context.params.id;
  try {
    // التحقق الصارم من ملكية المهمة قبل التعديل
    const existing = await prisma.task.findFirst({
      where: { id: taskId, userId: auth.userId },
    });

    if (!existing) {
      return NextResponse.json({ error: "المهمة غير موجودة" }, { status: 404 });
    }

    const body = await request.json();
    const title =
      typeof body?.title === "string" && body.title.trim()
        ? body.title.trim()
        : existing.title;

    const updated = await prisma.task.update({
      where: { id: existing.id },
      data: {
        title,
        description:
          typeof body?.description === "string"
            ? body.description.trim()
            : existing.description,
        priority: ALLOWED_PRIORITIES.has(body?.priority)
          ? body.priority
          : existing.priority,
        category: ALLOWED_CATEGORIES.has(body?.category)
          ? body.category
          : existing.category,
        dueDate:
          typeof body?.dueDate === "string" ? body.dueDate.trim() : existing.dueDate,
        isCompleted:
          typeof body?.isCompleted === "boolean"
            ? body.isCompleted
            : existing.isCompleted,
        isPinned:
          typeof body?.isPinned === "boolean" ? body.isPinned : existing.isPinned,
        repeatMode: ALLOWED_REPEATS.has(body?.repeatMode)
          ? body.repeatMode
          : existing.repeatMode,
        subTasks:
          body?.subTasks !== undefined
            ? sanitizeSubTasks(body.subTasks)
            : (existing.subTasks as object),
      },
    });

    return NextResponse.json({ task: serializeTask(updated) });
  } catch (error) {
    console.error("PUT /api/tasks/[id] error:", error);
    return NextResponse.json({ error: "تعذر تحديث المهمة" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
) {
  const auth = getAuthenticatedUser(request);
  if (!auth) {
    return NextResponse.json({ error: "غير مصرح، يرجى تسجيل الدخول" }, { status: 401 });
  }

  const taskId = context.params.id;
  try {
    const result = await prisma.task.deleteMany({
      where: { id: taskId, userId: auth.userId },
    });

    if (result.count === 0) {
      return NextResponse.json({ error: "المهمة غير موجودة" }, { status: 404 });
    }

    return NextResponse.json({ deleted: true, id: taskId });
  } catch (error) {
    console.error("DELETE /api/tasks/[id] error:", error);
    return NextResponse.json({ error: "تعذر حذف المهمة" }, { status: 500 });
  }
}
