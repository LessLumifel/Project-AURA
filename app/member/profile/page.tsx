import { requireCurrentUser } from "../../../lib/auth/server";
import MemberShell from "../MemberShell";
import ProfileForm from "./ProfileForm";

export default async function MemberProfilePage() {
  const user = await requireCurrentUser();

  return (
    <MemberShell
      user={user}
      active="profile"
      title="ข้อมูลสมาชิก"
      subtitle="แก้ไขชื่อและรหัสผ่านของบัญชีที่ล็อกอินอยู่"
    >
      <ProfileForm initialName={user.name} email={user.email} role={user.role} />
    </MemberShell>
  );
}
