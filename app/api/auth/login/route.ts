import { z } from "zod";
import { NextResponse } from "next/server";
import { assertAuthSecret, createSessionToken } from "../../../../lib/auth/session";
import { setSessionCookie, toSessionUser } from "../../../../lib/auth/cookies";
import { verifyUser } from "../../../../lib/auth/users";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1).max(120)
});

export async function POST(request: Request) {
  try {
    const parsed = LoginSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const user = await verifyUser(parsed.data.email, parsed.data.password);
    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }
    if (!user.approved) {
      return NextResponse.json({ error: "Your account is pending admin approval" }, { status: 403 });
    }

    const secret = assertAuthSecret();
    const token = await createSessionToken(toSessionUser(user), secret);

    const response = NextResponse.json({ user });
    setSessionCookie(response, token);

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Login failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
