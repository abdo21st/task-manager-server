import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import { sanitizeSubTasks, serializeTask } from "@/lib/taskSerializer";

const ALLOWED_PRIORITIES = new Set(["HIGH", "MEDIUM", "LOW"]);
const ALLOWED_CATEGORIES = new Set(["WORK", "PERSONAL", "SHOPPING", "STUDY", "GENERAL"]);
const ALLOWED_REPEATS = new Set(["NONE", "DAILY", "WEEKLY"]);

export async function GET(request: NextRequest) {
  const auth = getAuthenticatedUser(request);
  if (!auth) {
    return NextResponse.json({ error: "غير مصرح، يرجى تسجيل الدخول" }, { status: 401 });
  }

  try {
    const tasks = await prisma.task.findMany({
      where: { userId: auth.userId },
      orderBy: [{ isCompleted: "asc" }, { isPinned: "desc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({
      tasks: tasks.map(serializeTask),
    });
  } catch (error) {
    console.error("GET /api/tasks error:", error);
    return NextResponse.json({ error: "تعذر جلب المهام" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = getAuthenticatedUser(request);
  if (!auth) {
    return NextResponse.json({ error: "غير مصرح، يرجى تسجيل الدخول" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const title = typeof body?.title === "string" ? body.title.trim() : "";
    if (!title) {
      return NextResponse.json({ error: "عنوان المهمة مطلوب" }, { status: 400 });
    }

    const id = typeof body?.id === "string" && body.id.trim() ? body.id.trim() : undefined;
    const priority = ALLOWED_PRIORITIES.has(body?.priority) ? body.priority : "MEDIUM";
    const category = ALLOWED_CATEGORIES.has(body?.category) ? body.category : "GENERAL";
    const repeatMode = ALLOWED_REPEATS.has(body?.repeatMode) ? body.repeatMode : "NONE";
    const createdAt =
      typeof body?.createdAt === "number" && Number.isFinite(body.createdAt)
        ? BigInt(Math.trunc(body.createdAt))
        : BigInt(Date.now());

    const created = await prisma.task.create({
      data: {
        ...(id ? { id } : {}),
        userId: auth.userId,
        title,
        description: typeof body?.description === "string" ? body.description.trim() : "",
        priority,
        category,
        dueDate: typeof body?.dueDate === "string" ? body.dueDate.trim() : "",
        isCompleted: Boolean(body?.isCompleted),
        isPinned: Boolean(body?.isPinned),
        repeatMode,
        subTasks: sanitizeSubTasks(body?.subTasks),
        createdAt,
      },
    });

    return NextResponse.json({ task: serializeTask(created) }, { status: 201 });
  } catch (error) {
    console.error("POST /api/tasks error:", error);
    return NextResponse.json({ error: "تعذر إنشاء المهمة" }, { status: 500 });
  }
}
