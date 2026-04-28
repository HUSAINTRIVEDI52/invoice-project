import Link from "next/link";
import { StatCard } from "@/components/StatCard";
import { prisma } from "@/lib/db";
import { formatCurrency } from "@/lib/format";
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

  return (
    <div className="space-y-6">
      <section className="premium-hero">
        <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-white/15 blur-3xl" />
        <div className="absolute bottom-8 right-10 hidden h-32 w-32 rounded-full border border-white/20 lg:block" />
        <div className="relative flex flex-wrap items-center justify-between gap-6">
          <div>
            <div className="mb-5 inline-flex rounded-full bg-white/15 px-4 py-2 text-sm font-semibold text-blue-50 backdrop-blur">Today&apos;s workspace</div>
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Dashboard</h1>
            <p className="mt-3 max-w-2xl text-blue-100">A premium command center for fee collection, students, standards, and pending balances at {settings?.className ?? "Silver Education"}.</p>
          </div>
          <Link href="/payments/new" className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-brand-700 shadow-card transition hover:-translate-y-0.5 hover:shadow-float">Record payment</Link>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard title="Students" value={students.length} />
        <StatCard title="Standards" value={standards} />
        <StatCard title="Fees received" value={formatCurrency(totalReceived, settings?.currency)} />
        <StatCard title="Pending" value={formatCurrency(totalPending, settings?.currency)} />
      </div>

    </div>
  );
}
