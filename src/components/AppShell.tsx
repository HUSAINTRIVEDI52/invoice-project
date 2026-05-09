import Link from "next/link";
import { redirect } from "next/navigation";
import { logout } from "@/lib/auth";
import { ToastFromUrl } from "@/components/ToastFromUrl";

const links = [
  ["Dashboard", "/dashboard", "D"],
  ["Standards", "/standards", "C"],
  ["Students", "/students", "S"],
  ["Fees", "/fee-structures", "F"],
  ["Payments", "/payments", "P"],
  ["Reports", "/reports", "R"],
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
    <div className="relative min-h-screen overflow-hidden pb-24 lg:flex lg:gap-5 lg:p-5 lg:pb-5">
      <ToastFromUrl />
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_10%_12%,rgba(16,185,129,.18),transparent_30rem),radial-gradient(circle_at_90%_16%,rgba(79,70,229,.14),transparent_28rem),radial-gradient(circle_at_70%_90%,rgba(20,184,166,.10),transparent_28rem)]" />
      <aside className="no-print hidden google-card flex-col border-white/60 p-4 lg:sticky lg:top-5 lg:flex lg:h-[calc(100vh-2.5rem)] lg:w-72">
        <div className="relative shrink-0 overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-slate-950 via-accent-700 to-brand-700 p-5 text-white shadow-glow">
          <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-white/20 blur-3xl" />
          <div className="absolute -bottom-14 left-4 h-28 w-28 rounded-full bg-accent-500/25 blur-3xl" />
          <div className="relative flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/95 text-lg font-semibold tracking-tight text-brand-700 shadow-card">MSL</div>
            <div>
              <p className="text-lg font-bold leading-tight">MSL</p>
              <p className="text-sm text-emerald-100">Student fees workspace</p>
            </div>
          </div>
          <div className="relative mt-5 rounded-2xl border border-white/15 bg-white/10 p-3 text-xs font-medium text-emerald-50 backdrop-blur">
            Daily collections, student records, and reports in one place.
          </div>
        </div>
        <nav className="mt-5 flex flex-1 flex-col gap-1.5 overflow-y-auto pr-1">
          {links.map(([label, href, icon]) => (
            <Link key={href} href={href} className="group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold text-stone-600 transition duration-200 hover:-translate-y-0.5 hover:bg-brand-50 hover:text-brand-800 hover:shadow-sm hover:ring-1 hover:ring-brand-200">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl bg-stone-100 text-xs font-semibold text-stone-500 transition group-hover:bg-gradient-to-br group-hover:from-brand-600 group-hover:to-accent-700 group-hover:text-white">{icon}</span>
              {label}
            </Link>
          ))}
        </nav>
      </aside>

      <main className="min-w-0 flex-1 p-3 lg:p-0">
        <header className="no-print google-card sticky top-3 z-20 mb-5 flex items-center justify-between gap-3 px-4 py-3 shadow-premium lg:static lg:px-5 lg:py-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-slate-950 via-accent-700 to-brand-700 text-sm font-semibold text-white shadow-card lg:hidden">MSL</div>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400 sm:text-sm">Welcome back</p>
              <p className="truncate text-base font-semibold tracking-tight text-stone-950 sm:text-xl">{adminName}</p>
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

      <nav className="no-print fixed inset-x-2 bottom-2 z-30 rounded-[1.75rem] border border-white/70 bg-[#fffaf3]/90 px-2 py-2 shadow-float backdrop-blur-2xl lg:hidden">
        <div className="grid grid-cols-5 gap-1">
          {mobileLinks.map(([label, href, icon]) => (
            <Link key={href} href={href} className="flex flex-col items-center justify-center rounded-2xl px-1 py-2 text-[11px] font-bold text-slate-600 transition hover:bg-brand-50 hover:text-brand-700">
              <span className="mb-1 grid h-8 w-8 place-items-center rounded-full bg-slate-100 text-xs font-semibold transition group-hover:bg-brand-100">{icon}</span>
              <span className="max-w-full truncate">{label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
