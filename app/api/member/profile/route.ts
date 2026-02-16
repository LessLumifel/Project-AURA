import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getRequestUser } from "../../../../lib/auth/request";
import { findUserById, updateUserProfile } from "../../../../lib/auth/users";
import { assertAuthSecret, createSessionToken } from "../../../../lib/auth/session";
import { setSessionCookie, toSessionUser } from "../../../../lib/auth/cookies";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ProfilePatchSchema = z
  .object({
    name: z.string().min(2).max(100).optional(),
    password: z.string().min(8).max(120).optional()
  })
  .refine((data) => Boolean(data.name || data.password), {
    message: "At least one field is required"
  });

export async function GET(request: NextRequest) {
  try {
    const sessionUser = await getRequestUser(request);
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await findUserById(sessionUser.id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load profile";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const sessionUser = await getRequestUser(request);
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const parsed = ProfilePatchSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const user = await updateUserProfile(sessionUser.id, parsed.data);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const secret = assertAuthSecret();
    const token = await createSessionToken(toSessionUser(user), secret);
    const response = NextResponse.json({ user });
    setSessionCookie(response, token);
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update profile";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
