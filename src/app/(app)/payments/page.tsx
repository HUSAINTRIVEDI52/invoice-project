import Link from "next/link";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { ConfirmButton } from "@/components/ConfirmButton";
import { formatCurrency, formatDate } from "@/lib/format";
import { logActivity } from "@/lib/logger";

async function deletePayment(id: string) {
  "use server";
  const payment = await prisma.payment.delete({ where: { id }, include: { student: true } });
  await logActivity("Deleted", "Payment", `Deleted payment ${payment.invoiceNumber} for ${payment.student.fullName}`);
  revalidatePath("/payments");
}

export default async function PaymentsPage({ searchParams }: { searchParams: { q?: string; mode?: string } }) {
  const [payments, settings] = await Promise.all([
    prisma.payment.findMany({
      where: {
        paymentMode: searchParams.mode || undefined,
        OR: searchParams.q ? [
          { invoiceNumber: { contains: searchParams.q } },
          { feePeriod: { contains: searchParams.q } },
          { student: { fullName: { contains: searchParams.q } } },
        ] : undefined,
      },
      include: { student: true, standard: true },
      orderBy: { paymentDate: "desc" },
    }),
    prisma.settings.findUnique({ where: { id: "default" } }),
  ]);
  return (
    <div className="space-y-6">
      <div className="premium-page-header flex flex-wrap items-center justify-between gap-4"><div className="relative"><span className="premium-pill">Collections desk</span><h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">Payments</h1><p className="mt-2 text-slate-500">Search collections, open invoices, and review payment modes.</p></div><Link href="/payments/new" className="relative google-primary-button">Record payment</Link></div>
      <section className="google-card overflow-hidden p-5 shadow-premium">
        <form className="mb-5 flex flex-wrap gap-3"><input name="q" placeholder="Search invoice, student, period" defaultValue={searchParams.q} className="premium-field" /><select name="mode" defaultValue={searchParams.mode} className="premium-field"><option value="">All modes</option>{["Cash", "UPI", "Bank Transfer", "Cheque", "Card", "Other"].map((m) => <option key={m}>{m}</option>)}</select><button className="google-secondary-button">Filter</button></form>
        <div className="premium-table-wrap"><table className="google-table"><thead><tr><th>Invoice</th><th>Student</th><th>Standard</th><th>Period</th><th>Date</th><th>Amount</th><th></th></tr></thead><tbody>{payments.map((payment) => <tr key={payment.id}><td className="font-semibold">{payment.invoiceNumber}</td><td><Link className="font-semibold text-brand-700 hover:underline" href={`/students/${payment.studentId}`}>{payment.student.fullName}</Link></td><td>{payment.standard.name}</td><td>{payment.feePeriod}</td><td>{formatDate(payment.paymentDate)}</td><td className="font-semibold">{formatCurrency(payment.amountReceived, settings?.currency)}</td><td><div className="flex gap-2"><a className="rounded-full border border-brand-100 bg-brand-50 px-3 py-1.5 text-sm font-semibold text-brand-700" href={`/api/invoices/${payment.id}/pdf`}>PDF</a><ConfirmButton action={deletePayment.bind(null, payment.id)} /></div></td></tr>)}</tbody></table></div>
      </section>
    </div>
  );
}
