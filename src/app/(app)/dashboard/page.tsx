import Link from "next/link";
import { StatCard } from "@/components/StatCard";
import { prisma } from "@/lib/db";
import { formatCurrency, formatDate } from "@/lib/format";
import { calculatePendingForStudent } from "@/lib/reports";

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const [students, standards, payments, settings] = await Promise.all([
    prisma.student.findMany({ include: { standard: { include: { feeStructures: true } }, payments: true } }),
    prisma.standard.count(),
    prisma.payment.findMany(),
    prisma.settings.findUnique({ where: { id: "default" } }),
  ]);
  const totalReceived = payments.reduce((sum, payment) => sum + payment.amountReceived, 0);
  const pendingRows = students.map((student) => ({ student, pending: calculatePendingForStudent(student) })).filter((row) => row.pending > 0);
  const totalPending = pendingRows.reduce((sum, row) => sum + row.pending, 0);
  const recentPayments = [...payments].sort((a, b) => b.paymentDate.getTime() - a.paymentDate.getTime()).slice(0, 5);
  const topPending = pendingRows.sort((a, b) => b.pending - a.pending).slice(0, 5);
  const collectionRate = totalReceived + totalPending === 0 ? 0 : Math.round((totalReceived / (totalReceived + totalPending)) * 100);

  return (
    <div className="space-y-6">
      <section className="premium-hero">
        <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-white/15 blur-3xl" />
        <div className="absolute bottom-8 right-10 hidden h-32 w-32 rounded-full border border-white/20 lg:block" />
        <div className="relative grid gap-8 lg:grid-cols-[1fr_320px] lg:items-center">
          <div>
            <div className="mb-5 inline-flex rounded-full border border-white/15 bg-white/15 px-4 py-2 text-sm font-bold text-emerald-50 backdrop-blur">Today&apos;s workspace</div>
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Dashboard</h1>
            <p className="mt-3 max-w-2xl leading-7 text-emerald-100">A premium command center for student fee collection, standards, and pending balances at {settings?.className ?? "MSL"}.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/payments/new" className="rounded-full bg-white px-5 py-2.5 text-sm font-bold text-brand-700 shadow-card transition hover:-translate-y-0.5 hover:shadow-float">Record payment</Link>
              <Link href="/students" className="rounded-full border border-white/20 bg-white/10 px-5 py-2.5 text-sm font-bold text-white backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/20">Manage students</Link>
              <Link href="/reports" className="rounded-full border border-white/20 bg-white/10 px-5 py-2.5 text-sm font-bold text-white backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/20">View reports</Link>
            </div>
          </div>
          <div className="rounded-[1.75rem] border border-white/15 bg-white/10 p-5 shadow-card backdrop-blur">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-emerald-100">Collection rate</p>
                <p className="mt-2 text-5xl font-semibold tracking-tight">{collectionRate}%</p>
              </div>
              <div className="grid h-16 w-16 place-items-center rounded-3xl bg-white/15 text-lg font-semibold text-white ring-1 ring-white/20">₹</div>
            </div>
            <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/15">
              <div className="h-full rounded-full bg-white" style={{ width: `${collectionRate}%` }} />
            </div>
            <p className="mt-3 text-sm text-emerald-100">{formatCurrency(totalReceived, settings?.currency)} collected against {formatCurrency(totalPending, settings?.currency)} pending.</p>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard title="Students" value={students.length} hint="Active student records" />
        <StatCard title="Standards" value={standards} hint="Configured classes" />
        <StatCard title="Fees received" value={formatCurrency(totalReceived, settings?.currency)} hint="Total collection" />
        <StatCard title="Pending" value={formatCurrency(totalPending, settings?.currency)} hint="Balance to collect" />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_380px]">
        <section className="google-card overflow-hidden p-5 shadow-card">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="google-section-title">Recent collections</h2>
              <p className="google-muted">Latest fee receipts recorded in the system.</p>
            </div>
            <Link href="/payments" className="google-secondary-button">All payments</Link>
          </div>
          <div className="mt-5 premium-table-wrap">
            <table className="google-table">
              <thead><tr><th>Invoice</th><th>Date</th><th>Mode</th><th>Amount</th></tr></thead>
              <tbody>
                {recentPayments.map((payment) => (
                  <tr key={payment.id}>
                    <td className="font-semibold text-brand-700">{payment.invoiceNumber}</td>
                    <td>{formatDate(payment.paymentDate)}</td>
                    <td><span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">{payment.paymentMode}</span></td>
                    <td className="font-semibold">{formatCurrency(payment.amountReceived, settings?.currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {recentPayments.length === 0 ? <p className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm font-medium text-slate-500">No payments recorded yet.</p> : null}
        </section>

        <section className="google-card p-5 shadow-card">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="google-section-title">Quick actions</h2>
              <p className="google-muted">Open the most-used admin workflows.</p>
            </div>
          </div>
          <div className="mt-5 grid gap-3">
            <Link href="/students" className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-200 hover:bg-brand-50">
              <span className="text-sm font-semibold text-stone-950">Add or find student</span>
              <span className="mt-1 block text-sm text-stone-500">Manage student records and standard filters.</span>
            </Link>
            <Link href="/payments/new" className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-200 hover:bg-brand-50">
              <span className="text-sm font-semibold text-stone-950">Record fee payment</span>
              <span className="mt-1 block text-sm text-stone-500">Collect fees and generate invoice PDF.</span>
            </Link>
            <Link href="/reports" className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-200 hover:bg-brand-50">
              <span className="text-sm font-semibold text-stone-950">Review reports</span>
              <span className="mt-1 block text-sm text-stone-500">Filter collections and export records.</span>
            </Link>
          </div>
        </section>
      </div>

      <section className="google-card overflow-hidden p-5 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="google-section-title">Highest pending balances</h2>
            <p className="google-muted">Prioritise students with the largest remaining fee balance.</p>
          </div>
          <Link href="/reports" className="google-secondary-button">Pending report</Link>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {topPending.map(({ student, pending }) => (
            <Link key={student.id} href={`/students/${student.id}`} className="rounded-3xl border border-slate-100 bg-gradient-to-br from-white to-red-50/60 p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-red-200 hover:shadow-card">
              <span className="text-sm font-semibold text-stone-950">{student.fullName}</span>
              <span className="mt-1 block text-xs font-medium text-stone-500">{student.standard.name}</span>
              <span className="mt-4 block text-lg font-semibold text-red-700">{formatCurrency(pending, settings?.currency)}</span>
            </Link>
          ))}
        </div>
        {topPending.length === 0 ? <p className="mt-4 rounded-2xl bg-emerald-50 p-4 text-sm font-bold text-emerald-700">No pending balances found.</p> : null}
      </section>
    </div>
  );
}
