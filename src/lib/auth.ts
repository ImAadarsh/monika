import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { query, RowDataPacket } from "@/lib/db";

const COOKIE_NAME = "formflow_session";

function getSecret() {
  const secret = process.env.JWT_SECRET || "formflow-dev-secret-change-me";
  return new TextEncoder().encode(secret);
}

export interface AdminSession {
  id: string;
  email: string;
  name: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSession(admin: AdminSession): Promise<string> {
  return new SignJWT({ ...admin })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());
}

export async function verifySession(
  token: string
): Promise<AdminSession | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload as unknown as AdminSession;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySession(token);
}

export { COOKIE_NAME };

export async function authenticateAdmin(email: string, password: string) {
  const rows = await query<RowDataPacket[]>(
    "SELECT id, email, password_hash, name FROM admins WHERE email = :email LIMIT 1",
    { email }
  );
  if (!rows.length) return null;
  const valid = await bcrypt.compare(password, rows[0].password_hash);
  if (!valid) return null;
  return {
    id: rows[0].id,
    email: rows[0].email,
    name: rows[0].name,
  };
}
