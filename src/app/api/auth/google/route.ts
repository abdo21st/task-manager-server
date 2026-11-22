import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signAuthToken, verifyGoogleIdToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const idToken = typeof body?.idToken === "string" ? body.idToken.trim() : "";

    if (!idToken) {
      return NextResponse.json(
        { error: "رمز الدخول من Google مطلوب" },
        { status: 400 }
      );
    }

    const googleUser = await verifyGoogleIdToken(idToken);

    const user = await prisma.user.upsert({
      where: { googleSub: googleUser.googleSub },
      update: {
        email: googleUser.email,
        name: googleUser.name,
        avatarUrl: googleUser.avatarUrl,
      },
      create: {
        googleSub: googleUser.googleSub,
        email: googleUser.email,
        name: googleUser.name,
        avatarUrl: googleUser.avatarUrl,
      },
    });

    const token = signAuthToken({
      userId: user.id,
      email: user.email,
    });

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl ?? "",
      },
    });
  } catch (error) {
    console.error("Google auth error:", error);
    return NextResponse.json(
      { error: "فشل التحقق من حساب Google" },
      { status: 401 }
    );
  }
}
