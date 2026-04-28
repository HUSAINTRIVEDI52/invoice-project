import { StatCard } from "@/components/StatCard";
import { prisma } from "@/lib/db";
import { formatCurrency, formatDate } from "@/lib/format";
import { activeFilterLabel, buildPaymentWhere, paymentModes, type ReportsSearchParams } from "@/lib/reportFilters";
import { calculatePendingForStudent } from "@/lib/reports";

export default async function ReportsPage({ searchParams }: { searchParams: ReportsSearchParams }) {
  const paymentWhere = buildPaymentWhere(searchParams);
  const queryString = new URLSearchParams(Object.entries(searchParams).filter(([, value]) => value)).toString();

  const [students, payments, settings, standards] = await Promise.all([
    prisma.student.findMany({ include: { standard: { include: { feeStructures: true } }, payments: true }, orderBy: { fullName: "asc" } }),
    prisma.payment.findMany({ where: paymentWhere, include: { student: true, standard: true }, orderBy: { paymentDate: "desc" } }),
    prisma.settings.findUnique({ where: { id: "default" } }),
    prisma.standard.findMany({ orderBy: { name: "asc" } }),
  ]);
  const selectedStandard = standards.find((standard) => standard.id === searchParams.standardId);
  const filterLabel = activeFilterLabel({ ...searchParams, standardName: selectedStandard?.name });

  const total = payments.reduce((sum, payment) => sum + payment.amountReceived, 0);
  const byStandard = new Map<string, number>();
  const byMode = new Map<string, number>();

  for (const payment of payments) {
    byStandard.set(payment.standard.name, (byStandard.get(payment.standard.name) ?? 0) + payment.amountReceived);
    byMode.set(payment.paymentMode, (byMode.get(payment.paymentMode) ?? 0) + payment.amountReceived);
  }

  const pending = students.map((student) => ({ student, amount: calculatePendingForStudent(student) })).filter((row) => row.amount > 0);
  const fieldClass = "mt-1.5 w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-sm shadow-sm outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100";
  const filterFields = (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-7">
      <label className="block"><span className="text-sm font-semibold text-slate-700">Standard</span><select name="standardId" defaultValue={searchParams.standardId ?? ""} className={fieldClass}><option value="">All standards</option>{standards.map((standard) => <option key={standard.id} value={standard.id}>{standard.name}</option>)}</select></label>
      <label className="block"><span className="text-sm font-semibold text-slate-700">Payment mode</span><select name="mode" defaultValue={searchParams.mode ?? ""} className={fieldClass}><option value="">All modes</option>{paymentModes.map((mode) => <option key={mode} value={mode}>{mode}</option>)}</select></label>
      <label className="block"><span className="text-sm font-semibold text-slate-700">Specific day</span><input name="date" type="date" defaultValue={searchParams.date ?? ""} className={fieldClass} /></label>
      <label className="block"><span className="text-sm font-semibold text-slate-700">Month</span><input name="month" type="month" defaultValue={searchParams.month ?? ""} className={fieldClass} /></label>
      <label className="block"><span className="text-sm font-semibold text-slate-700">Year</span><input name="year" type="number" min="2000" max="2100" placeholder="2026" defaultValue={searchParams.year ?? ""} className={fieldClass} /></label>
      <label className="block"><span className="text-sm font-semibold text-slate-700">From</span><input name="from" type="date" defaultValue={searchParams.from ?? ""} className={fieldClass} /></label>
      <label className="block"><span className="text-sm font-semibold text-slate-700">To</span><input name="to" type="date" defaultValue={searchParams.to ?? ""} className={fieldClass} /></label>
    </div>
  );
  const filterActions = (
    <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <button className="google-primary-button min-h-11 w-full">Apply filters</button>
      <a href="/reports" className="google-secondary-button min-h-11 w-full">Clear filters</a>
      <a href={`/api/reports/export/excel${queryString ? `?${queryString}` : ""}`} className="inline-flex min-h-11 w-full items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 px-5 py-2.5 text-sm font-semibold text-emerald-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-emerald-100">Export Excel</a>
      <a href={`/api/reports/export/pdf${queryString ? `?${queryString}` : ""}`} className="inline-flex min-h-11 w-full items-center justify-center rounded-full border border-red-200 bg-red-50 px-5 py-2.5 text-sm font-semibold text-red-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-red-100">Export PDF</a>
    </div>
  );

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="premium-page-header p-5 sm:p-8">
        <div className="relative flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="premium-pill">Financial analytics</span>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Reports</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">Review collections by standard and payment mode, apply precise filters, and export professional records.</p>
          </div>
          <div className="rounded-3xl bg-gradient-to-br from-brand-600 to-brand-900 p-4 text-white shadow-glow">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-100">Active view</p>
            <p className="mt-1 max-w-48 text-sm font-semibold">{filterLabel}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Filtered collection" value={formatCurrency(total, settings?.currency)} hint={filterLabel} />
        <StatCard title="Filtered payments" value={payments.length} />
        <StatCard title="Cash collection" value={formatCurrency(byMode.get("Cash") ?? 0, settings?.currency)} />
        <StatCard title="UPI collection" value={formatCurrency(byMode.get("UPI") ?? 0, settings?.currency)} />
      </div>

      <form className="google-card hidden p-5 shadow-premium lg:block">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="google-section-title">Filters & exports</h2>
            <p className="google-muted">Use the filters below without losing sight of the report dashboard.</p>
          </div>
          <span className="premium-pill">{filterLabel}</span>
        </div>
        {filterFields}
        {filterActions}
      </form>

      <details className="group google-card overflow-hidden p-4 shadow-premium lg:hidden">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
          <div>
            <p className="font-semibold text-slate-950">Filters & exports</p>
            <p className="text-sm text-slate-500">Open to refine reports or download files.</p>
          </div>
          <span className="rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white group-open:bg-slate-100 group-open:text-slate-700">Open</span>
        </summary>
        <form className="mt-5 border-t border-slate-100 pt-5">
          {filterFields}
          {filterActions}
        </form>
      </details>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="google-card p-5 shadow-card">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="google-section-title">Mode-wise collection</h2>
              <p className="google-muted">Collection grouped by payment channel.</p>
            </div>
            <span className="premium-pill">{byMode.size} modes</span>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            {Array.from(byMode).map(([name, amount]) => <div className="rounded-2xl border border-slate-100 bg-gradient-to-br from-slate-50 to-white p-4" key={name}><span className="text-sm font-semibold text-slate-500">{name}</span><strong className="mt-1 block text-lg tracking-tight text-slate-950">{formatCurrency(amount, settings?.currency)}</strong></div>)}
            {byMode.size === 0 ? <p className="google-muted">No collection found.</p> : null}
          </div>
        </section>

        <section className="google-card p-5 shadow-card">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="google-section-title">Standard-wise collection</h2>
              <p className="google-muted">Collection grouped by class or batch.</p>
            </div>
            <span className="premium-pill">{byStandard.size} standards</span>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            {Array.from(byStandard).map(([name, amount]) => <div className="rounded-2xl border border-slate-100 bg-gradient-to-br from-brand-50/60 to-white p-4" key={name}><span className="text-sm font-semibold text-slate-500">{name}</span><strong className="mt-1 block text-lg tracking-tight text-slate-950">{formatCurrency(amount, settings?.currency)}</strong></div>)}
            {byStandard.size === 0 ? <p className="google-muted">No collection found.</p> : null}
          </div>
        </section>
      </div>

      <section className="google-card overflow-hidden p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="google-section-title">Filtered payment records</h2>
            <p className="google-muted">{payments.length} matching payment{payments.length === 1 ? "" : "s"}</p>
          </div>
        </div>
        <div className="mt-4 premium-table-wrap"><table className="google-table"><thead><tr><th>Date</th><th>Invoice</th><th>Student</th><th>Mode</th><th>Amount</th></tr></thead><tbody>{payments.map((payment) => <tr key={payment.id}><td>{formatDate(payment.paymentDate)}</td><td className="font-semibold">{payment.invoiceNumber}</td><td>{payment.student.fullName}</td><td>{payment.paymentMode}</td><td className="font-semibold">{formatCurrency(payment.amountReceived, settings?.currency)}</td></tr>)}</tbody></table></div>
        {payments.length === 0 ? <p className="mt-4 google-muted">No payments match these filters.</p> : null}
      </section>

      <section className="google-card overflow-hidden p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="google-section-title">Pending fees</h2>
            <p className="google-muted">Students with remaining balance.</p>
          </div>
        </div>
        <div className="mt-4 premium-table-wrap"><table className="google-table"><thead><tr><th>Student</th><th>Standard</th><th>Pending</th></tr></thead><tbody>{pending.map(({ student, amount }) => <tr key={student.id}><td>{student.fullName}</td><td>{student.standard.name}</td><td className="font-semibold text-red-700">{formatCurrency(amount, settings?.currency)}</td></tr>)}</tbody></table></div>
      </section>
    </div>
  );
}
