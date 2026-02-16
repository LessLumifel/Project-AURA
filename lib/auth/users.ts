import { promises as fs } from "node:fs";
import path from "node:path";
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

export type UserRole = "member" | "admin";

export type User = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  approved: boolean;
  passwordHash: string;
  salt: string;
  createdAt: string;
  updatedAt: string;
};

export type PublicUser = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  approved: boolean;
  createdAt: string;
  updatedAt: string;
};

const DATA_DIR = path.join(process.cwd(), "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function toPublicUser(user: User): PublicUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    approved: user.approved,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
}

function hashPassword(password: string, salt: string) {
  return scryptSync(password, salt, 64).toString("hex");
}

async function readUsers(): Promise<User[]> {
  try {
    const raw = await fs.readFile(USERS_FILE, "utf8");
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.map((item) => {
      const role = item?.role === "admin" ? "admin" : "member";
      const approved = item?.approved === false ? false : true;
      return {
        ...item,
        role,
        approved
      } as User;
    });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return [];
    }

    throw error;
  }
}

async function writeUsers(users: User[]) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2), "utf8");
}

export async function findUserByEmail(email: string) {
  const normalizedEmail = normalizeEmail(email);
  const users = await readUsers();
  return users.find((user) => user.email === normalizedEmail) ?? null;
}

export async function createUser(input: { email: string; name: string; password: string }): Promise<PublicUser> {
  return createUserWithRole({ ...input, role: "member", approved: false });
}

export async function createUserWithRole(input: {
  email: string;
  name: string;
  password: string;
  role?: UserRole;
  approved?: boolean;
}): Promise<PublicUser> {
  const email = normalizeEmail(input.email);
  const name = input.name.trim();
  const role: UserRole = input.role === "admin" ? "admin" : "member";
  const approved = typeof input.approved === "boolean" ? input.approved : true;

  if (!email || !email.includes("@")) {
    throw new Error("Invalid email");
  }

  if (name.length < 2) {
    throw new Error("Name must be at least 2 characters");
  }

  if (input.password.length < 8) {
    throw new Error("Password must be at least 8 characters");
  }

  const users = await readUsers();
  if (users.some((user) => user.email === email)) {
    throw new Error("Email already exists");
  }

  const now = new Date().toISOString();
  const salt = randomBytes(16).toString("hex");
  const user: User = {
    id: crypto.randomUUID(),
    email,
    name,
    role,
    approved,
    salt,
    passwordHash: hashPassword(input.password, salt),
    createdAt: now,
    updatedAt: now
  };

  users.push(user);
  await writeUsers(users);
  return toPublicUser(user);
}

export async function verifyUser(email: string, password: string): Promise<PublicUser | null> {
  const user = await findUserByEmail(email);
  if (!user) return null;

  const candidate = Buffer.from(hashPassword(password, user.salt), "hex");
  const expected = Buffer.from(user.passwordHash, "hex");
  if (candidate.length !== expected.length || !timingSafeEqual(candidate, expected)) {
    return null;
  }

  return toPublicUser(user);
}

export async function listUsers(): Promise<PublicUser[]> {
  const users = await readUsers();
  return users
    .map(toPublicUser)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export async function countAdmins() {
  const users = await readUsers();
  return users.filter((user) => user.role === "admin").length;
}

export async function findUserById(id: string): Promise<PublicUser | null> {
  const users = await readUsers();
  const user = users.find((item) => item.id === id);
  return user ? toPublicUser(user) : null;
}

export async function updateUserRole(id: string, role: UserRole): Promise<PublicUser | null> {
  const users = await readUsers();
  const target = users.find((item) => item.id === id);
  if (!target) return null;

  target.role = role;
  target.updatedAt = new Date().toISOString();
  await writeUsers(users);
  return toPublicUser(target);
}

export async function updateUserProfile(
  id: string,
  input: { name?: string; password?: string }
): Promise<PublicUser | null> {
  const users = await readUsers();
  const target = users.find((item) => item.id === id);
  if (!target) return null;

  const nextName = input.name?.trim();
  if (typeof nextName === "string") {
    if (nextName.length < 2) {
      throw new Error("Name must be at least 2 characters");
    }
    target.name = nextName;
  }

  if (typeof input.password === "string") {
    if (input.password.length < 8) {
      throw new Error("Password must be at least 8 characters");
    }
    const salt = randomBytes(16).toString("hex");
    target.salt = salt;
    target.passwordHash = hashPassword(input.password, salt);
  }

  target.updatedAt = new Date().toISOString();
  await writeUsers(users);
  return toPublicUser(target);
}

export async function updateUserByAdmin(
  id: string,
  input: {
    name?: string;
    email?: string;
    role?: UserRole;
    approved?: boolean;
    password?: string;
  }
): Promise<PublicUser | null> {
  const users = await readUsers();
  const target = users.find((item) => item.id === id);
  if (!target) return null;

  if (typeof input.name === "string") {
    const nextName = input.name.trim();
    if (nextName.length < 2) {
      throw new Error("Name must be at least 2 characters");
    }
    target.name = nextName;
  }

  if (typeof input.email === "string") {
    const nextEmail = normalizeEmail(input.email);
    if (!nextEmail || !nextEmail.includes("@")) {
      throw new Error("Invalid email");
    }
    if (users.some((user) => user.id !== target.id && user.email === nextEmail)) {
      throw new Error("Email already exists");
    }
    target.email = nextEmail;
  }

  if (input.role) {
    target.role = input.role;
  }

  if (typeof input.approved === "boolean") {
    target.approved = input.approved;
  }

  if (typeof input.password === "string") {
    if (input.password.length < 8) {
      throw new Error("Password must be at least 8 characters");
    }
    const salt = randomBytes(16).toString("hex");
    target.salt = salt;
    target.passwordHash = hashPassword(input.password, salt);
  }

  target.updatedAt = new Date().toISOString();
  await writeUsers(users);
  return toPublicUser(target);
}

export async function deleteUserById(id: string): Promise<PublicUser | null> {
  const users = await readUsers();
  const index = users.findIndex((item) => item.id === id);
  if (index < 0) return null;

  const [removed] = users.splice(index, 1);
  await writeUsers(users);
  return toPublicUser(removed);
}
