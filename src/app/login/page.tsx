import { redirect } from "next/navigation";
import { getSession, login } from "@/lib/auth";

export const dynamic = 'force-dynamic';

async function loginAction(formData: FormData) {
  "use server";
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const ok = await login(email, password);
  if (ok) redirect("/dashboard");
  redirect("/login?error=1");
}

export default async function LoginPage({ searchParams }: { searchParams: { error?: string } }) {
  const admin = await getSession();
  if (admin) redirect("/dashboard");

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden p-6">
      <div className="absolute -left-24 top-16 h-96 w-96 rounded-full bg-brand-200/70 blur-3xl" />
      <div className="absolute -right-24 bottom-16 h-96 w-96 rounded-full bg-accent-100/80 blur-3xl" />
      <div className="absolute left-1/2 top-8 h-80 w-80 -translate-x-1/2 rounded-full bg-brand-100/70 blur-3xl" />
      <section className="google-card relative grid w-full max-w-6xl overflow-hidden shadow-premium lg:grid-cols-[1fr_430px]">
        <div className="relative hidden overflow-hidden bg-gradient-to-br from-brand-600 via-accent-700 to-stone-950 p-10 text-white lg:block">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/20 blur-3xl" />
          <div className="absolute bottom-8 right-8 h-36 w-36 rounded-full border border-white/20" />
          <div className="relative grid h-16 w-16 place-items-center rounded-3xl bg-white text-2xl font-semibold text-brand-700 shadow-card">MSL</div>
          <p className="relative mt-10 inline-flex rounded-full border border-white/15 bg-white/15 px-4 py-2 text-sm font-bold text-emerald-50 backdrop-blur">Student fees collection platform</p>
          <h1 className="relative mt-5 text-5xl font-semibold tracking-tight">MSL workspace</h1>
          <p className="relative mt-4 max-w-md leading-7 text-emerald-100">Manage students, standards, fee payments, invoices, and reports from a polished admin dashboard built for daily clarity.</p>
          <div className="relative mt-10 grid gap-3 text-sm text-emerald-50">
            <p className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">Student records management</p>
            <p className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">Dynamic fee invoice PDFs</p>
            <p className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">Cash, UPI, and date-wise fee reports</p>
          </div>
        </div>
        <form action={loginAction} className="p-8 sm:p-10">
          <div className="mb-8 lg:hidden">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-600 text-xl font-bold text-white">MSL</div>
          </div>
          <p className="premium-pill">Admin portal</p>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight text-stone-950">Welcome back</h2>
          <p className="mt-2 text-sm font-medium text-stone-500">Default: admin@msl.local / admin12345</p>
          {searchParams.error ? <p className="mt-5 rounded-2xl border border-red-100 bg-red-50 p-3 text-sm font-semibold text-red-700">Invalid email or password.</p> : null}
          <label className="mt-6 block">
            <span className="text-sm font-bold text-stone-700">Email</span>
            <input name="email" type="email" required defaultValue="admin@msl.local" className="mt-2 w-full rounded-2xl border border-stone-200/90 bg-[#fffdf8]/95 px-4 py-3 text-sm font-semibold shadow-sm outline-none transition hover:border-brand-300 focus:border-brand-600 focus:ring-4 focus:ring-brand-200/70" />
          </label>
          <label className="mt-4 block">
            <span className="text-sm font-bold text-stone-700">Password</span>
            <input name="password" type="password" required defaultValue="admin12345" className="mt-2 w-full rounded-2xl border border-stone-200/90 bg-[#fffdf8]/95 px-4 py-3 text-sm font-semibold shadow-sm outline-none transition hover:border-brand-300 focus:border-brand-600 focus:ring-4 focus:ring-brand-200/70" />
          </label>
          <button className="mt-6 w-full google-primary-button py-3">Login</button>
        </form>
      </section>
    </main>
  );
}
