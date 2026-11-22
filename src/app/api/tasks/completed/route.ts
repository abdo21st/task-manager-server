import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";

export async function DELETE(request: NextRequest) {
  const auth = getAuthenticatedUser(request);
  if (!auth) {
    return NextResponse.json({ error: "غير مصرح، يرجى تسجيل الدخول" }, { status: 401 });
  }

  try {
    const result = await prisma.task.deleteMany({
      where: { userId: auth.userId, isCompleted: true },
    });

    return NextResponse.json({ deletedCount: result.count });
  } catch (error) {
    console.error("DELETE /api/tasks/completed error:", error);
    return NextResponse.json({ error: "تعذر مسح المهام المكتملة" }, { status: 500 });
  }
}
