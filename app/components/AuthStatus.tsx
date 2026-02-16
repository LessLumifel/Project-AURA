import { getCurrentUser } from "../../lib/auth/server";
import AuthMenuClient from "./AuthMenuClient";

export default async function AuthStatus() {
  const user = await getCurrentUser();

  if (!user) {
    return <AuthMenuClient user={null} />;
  }

  return (
    <AuthMenuClient
      user={{
        id: user.id,
        name: user.name,
        role: user.role
      }}
    />
  );
}
