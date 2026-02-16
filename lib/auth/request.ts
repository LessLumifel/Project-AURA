import { NextRequest } from "next/server";
import { SESSION_COOKIE_NAME } from "./constants";
import { assertAuthSecret, verifySessionToken } from "./session";
import { findUserById } from "./users";

export async function getRequestUser(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
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
