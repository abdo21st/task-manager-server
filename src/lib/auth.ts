import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";

const googleClient = new OAuth2Client();

export interface AuthJwtPayload {
  userId: string;
  email: string;
}

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error("JWT_SECRET is missing or too short (min 16 characters)");
  }
  return secret;
}

export async function verifyGoogleIdToken(idToken: string) {
  const audience = process.env.GOOGLE_WEB_CLIENT_ID;
  if (!audience) {
    throw new Error("GOOGLE_WEB_CLIENT_ID is not configured on the server");
  }

  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience,
  });

  const payload = ticket.getPayload();
  if (!payload || !payload.sub || !payload.email) {
    throw new Error("Invalid Google ID token payload");
  }

  return {
    googleSub: payload.sub,
    email: payload.email,
    name: payload.name || payload.email.split("@")[0],
    avatarUrl: payload.picture || null,
  };
}

export function signAuthToken(payload: AuthJwtPayload): string {
  return jwt.sign(payload, getJwtSecret(), {
    expiresIn: "30d",
  });
}

export function getAuthenticatedUser(request: NextRequest): AuthJwtPayload | null {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.slice(7).trim();
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, getJwtSecret()) as AuthJwtPayload;
    if (!decoded.userId || !decoded.email) return null;
    return decoded;
  } catch {
    return null;
  }
}
