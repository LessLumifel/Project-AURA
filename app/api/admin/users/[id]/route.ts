import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getRequestUser } from "../../../../../lib/auth/request";
import { countAdmins, deleteUserById, findUserById, updateUserByAdmin } from "../../../../../lib/auth/users";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UpdateUserSchema = z
  .object({
    name: z.string().min(2).max(100).optional(),
    email: z.string().email().optional(),
    role: z.enum(["member", "admin"]).optional(),
    approved: z.boolean().optional(),
    password: z.string().min(8).max(120).optional()
  })
  .refine((data) => Boolean(data.name || data.email || data.role || typeof data.approved === "boolean" || data.password), {
    message: "At least one field is required"
  });

type Context = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: NextRequest, context: Context) {
  try {
    const sessionUser = await getRequestUser(request);
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (sessionUser.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await context.params;
    const parsed = UpdateUserSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const currentUser = await findUserById(id);
    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (id === sessionUser.id && parsed.data.role && parsed.data.role !== currentUser.role) {
      return NextResponse.json({ error: "Cannot change your own role" }, { status: 400 });
    }
    if (id === sessionUser.id && parsed.data.approved === false) {
      return NextResponse.json({ error: "Cannot suspend your own account" }, { status: 400 });
    }

    if (currentUser.role === "admin" && parsed.data.role === "member") {
      const adminCount = await countAdmins();
      if (adminCount <= 1) {
        return NextResponse.json({ error: "Cannot demote the last admin" }, { status: 400 });
      }
    }

    const user = await updateUserByAdmin(id, parsed.data);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update user";
    if (message === "Email already exists") {
      return NextResponse.json({ error: message }, { status: 409 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: Context) {
  try {
    const sessionUser = await getRequestUser(request);
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (sessionUser.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await context.params;
    if (id === sessionUser.id) {
      return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 });
    }

    const currentUser = await findUserById(id);
    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (currentUser.role === "admin") {
      const adminCount = await countAdmins();
      if (adminCount <= 1) {
        return NextResponse.json({ error: "Cannot delete the last admin" }, { status: 400 });
      }
    }

    const deleted = await deleteUserById(id);
    if (!deleted) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, user: deleted });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete user";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
