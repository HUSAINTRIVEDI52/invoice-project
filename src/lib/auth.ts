import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { prisma } from "./db";

const cookieName = "silver_session";

function secretKey() {
  return new TextEncoder().encode(process.env.SESSION_SECRET ?? "development-secret");
}

export async function createSession(adminId: string) {
  const token = await new SignJWT({ adminId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secretKey());

  cookies().set(cookieName, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function getSession() {
  const token = cookies().get(cookieName)?.value;
  if (!token) return null;

  try {
    const verified = await jwtVerify(token, secretKey());
    const adminId = verified.payload.adminId;
    if (typeof adminId !== "string") return null;

    // Check if ID is a valid 24-character hex string (MongoDB ObjectId)
    if (!/^[0-9a-fA-F]{24}$/.test(adminId)) return null;

    return await prisma.admin.findUnique({ where: { id: adminId }, select: { id: true, name: true, email: true } });
  } catch {
    return null;
  }
}

export async function requireAdmin() {
  const admin = await getSession();
  if (!admin) redirect("/login");
  return admin;
}

export async function login(email: string, password: string) {
  const admin = await prisma.admin.findUnique({ where: { email } });
  if (!admin) return false;
  const valid = await bcrypt.compare(password, admin.passwordHash);
  if (!valid) return false;
  await createSession(admin.id);
  return true;
}

export function logout() {
  cookies().delete(cookieName);
}
