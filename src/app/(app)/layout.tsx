import { AppShell } from "@/components/AppShell";
import { requireAdmin } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  return <AppShell adminName={admin.name}>{children}</AppShell>;
}
