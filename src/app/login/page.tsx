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
      <div className="absolute -left-24 top-16 h-80 w-80 rounded-full bg-brand-100 blur-3xl" />
      <div className="absolute -right-24 bottom-16 h-80 w-80 rounded-full bg-yellow-100 blur-3xl" />
      <div className="absolute left-1/2 top-8 h-72 w-72 -translate-x-1/2 rounded-full bg-emerald-100/60 blur-3xl" />
      <section className="relative grid w-full max-w-6xl overflow-hidden rounded-[2.25rem] border border-white/80 bg-white/90 shadow-premium backdrop-blur-xl lg:grid-cols-[1fr_430px]">
        <div className="relative hidden overflow-hidden bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900 p-10 text-white lg:block">
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/15 blur-3xl" />
          <div className="absolute bottom-8 right-8 h-32 w-32 rounded-full border border-white/20" />
          <div className="relative grid h-16 w-16 place-items-center rounded-3xl bg-white text-2xl font-bold text-brand-700 shadow-card">SE</div>
          <p className="relative mt-10 inline-flex rounded-full bg-white/15 px-4 py-2 text-sm font-semibold text-blue-50 backdrop-blur">Tuition finance command center</p>
          <h1 className="relative mt-5 text-5xl font-semibold tracking-tight">Silver Education workspace</h1>
          <p className="relative mt-4 max-w-md text-blue-100">Manage standards, students, payments, invoices, and reports from a polished admin dashboard built for daily clarity.</p>
          <div className="relative mt-10 grid gap-3 text-sm text-blue-50">
            <p className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">Standard-wise student records</p>
            <p className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">Dynamic PDF invoices</p>
            <p className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">Cash, UPI, and date-wise reports</p>
          </div>
        </div>
        <form action={loginAction} className="p-8 sm:p-10">
          <div className="mb-8 lg:hidden">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-600 text-xl font-bold text-white">SE</div>
          </div>
          <p className="inline-flex rounded-full bg-brand-50 px-3 py-1 text-sm font-semibold text-brand-700">Admin portal</p>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">Welcome back</h2>
          <p className="mt-2 text-sm text-slate-500">Default: admin@silvereducation.local / admin12345</p>
          {searchParams.error ? <p className="mt-5 rounded-2xl bg-red-50 p-3 text-sm font-medium text-red-700">Invalid email or password.</p> : null}
          <label className="mt-6 block">
            <span className="text-sm font-semibold text-slate-700">Email</span>
            <input name="email" type="email" required defaultValue="admin@silvereducation.local" className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-sm shadow-sm outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100" />
          </label>
          <label className="mt-4 block">
            <span className="text-sm font-semibold text-slate-700">Password</span>
            <input name="password" type="password" required defaultValue="admin12345" className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-sm shadow-sm outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100" />
          </label>
          <button className="mt-6 w-full google-primary-button py-3">Login</button>
        </form>
      </section>
    </main>
  );
}
