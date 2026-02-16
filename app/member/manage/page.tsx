import { requireAdminUser } from "../../../lib/auth/server";
import MemberShell from "../MemberShell";
import ManageUsersClient from "./ManageUsersClient";

export default async function MemberManagePage() {
  const user = await requireAdminUser();

  return (
    <MemberShell
      user={user}
      active="manage"
      title="จัดการสมาชิก"
      subtitle="ดูรายชื่อสมาชิกทั้งหมดและกำหนดสิทธิ์การใช้งาน"
    >
      <ManageUsersClient currentUserId={user.id} />
    </MemberShell>
  );
}
