import Link from "next/link";
import { redirect } from "next/navigation";
import { logout } from "@/lib/auth";

const links = [
  ["Dashboard", "/dashboard", "D"],
  ["Standards", "/standards", "C"],
  ["Students", "/students", "S"],
  ["Fees", "/fee-structures", "F"],
  ["Payments", "/payments", "P"],
  ["Reports", "/reports", "R"],
  ["Logs", "/logs", "L"],
  ["Settings", "/settings", "G"],
];

const mobileLinks = links.filter(([label]) => ["Dashboard", "Students", "Payments", "Reports", "Settings"].includes(label));

export function AppShell({ children, adminName }: { children: React.ReactNode; adminName: string }) {
  async function logoutAction() {
    "use server";
    logout();
    redirect("/login");
  }

  return (
    <div className="relative min-h-screen overflow-hidden pb-24 lg:flex lg:gap-4 lg:p-4 lg:pb-4">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_12%_10%,rgba(66,133,244,.16),transparent_28rem),radial-gradient(circle_at_88%_18%,rgba(52,168,83,.10),transparent_24rem)]" />
      <aside className="no-print hidden google-card flex-col p-4 lg:sticky lg:top-4 lg:flex lg:h-[calc(100vh-2rem)] lg:w-72">
        <div className="relative shrink-0 overflow-hidden rounded-[1.7rem] bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900 p-4 text-white shadow-glow">
          <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/20 blur-2xl" />
          <div className="relative flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-xl font-bold text-brand-700 shadow-card">SE</div>
            <div>
              <p className="text-lg font-semibold leading-tight">Silver Education</p>
              <p className="text-sm text-blue-100">Premium tuition workspace</p>
            </div>
          </div>
        </div>
        <nav className="mt-5 flex flex-1 flex-col gap-1.5 overflow-y-auto pr-1">
          {links.map(([label, href, icon]) => (
            <Link key={href} href={href} className="group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:bg-white hover:text-brand-700 hover:shadow-sm">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-slate-100 text-xs font-bold text-slate-500 transition group-hover:bg-brand-100 group-hover:text-brand-700">{icon}</span>
              {label}
            </Link>
          ))}
        </nav>
      </aside>

      <main className="min-w-0 flex-1 p-3 lg:p-0">
        <header className="no-print google-card sticky top-3 z-20 mb-4 flex items-center justify-between gap-3 px-4 py-3 shadow-premium lg:static lg:px-5 lg:py-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-brand-600 text-sm font-bold text-white lg:hidden">SE</div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-500 sm:text-sm">Welcome back</p>
              <p className="truncate text-base font-semibold tracking-tight text-slate-950 sm:text-xl">{adminName}</p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <Link href="/payments/new" className="hidden google-primary-button sm:inline-flex">Record payment</Link>
            <form action={logoutAction}>
              <button className="google-secondary-button px-4 py-2">Logout</button>
            </form>
          </div>
        </header>
        <div className="pb-4 lg:px-1">{children}</div>
      </main>

      <nav className="no-print fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 px-2 py-2 shadow-float backdrop-blur lg:hidden">
        <div className="grid grid-cols-5 gap-1">
          {mobileLinks.map(([label, href, icon]) => (
            <Link key={href} href={href} className="flex flex-col items-center justify-center rounded-2xl px-1 py-2 text-[11px] font-semibold text-slate-600 transition hover:bg-brand-50 hover:text-brand-700">
              <span className="mb-1 grid h-7 w-7 place-items-center rounded-full bg-slate-100 text-xs font-bold">{icon}</span>
              <span className="max-w-full truncate">{label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
