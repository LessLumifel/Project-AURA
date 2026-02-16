import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE_NAME } from "./constants";
import { assertAuthSecret, SessionUser, verifySessionToken } from "./session";
import { findUserById } from "./users";

export async function getCurrentUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  const secret = assertAuthSecret();
  const sessionUser = await verifySessionToken(token, secret);
  if (!sessionUser) return null;

  const latestUser = await findUserById(sessionUser.id);
  if (!latestUser || !latestUser.approved) return null;

  return {
    id: latestUser.id,
    email: latestUser.email,
    name: latestUser.name,
    role: latestUser.role
  };
}

export async function requireCurrentUser() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function requireAdminUser() {
  const user = await requireCurrentUser();
  if (user.role !== "admin") {
    redirect("/member");
  }

  return user;
}
