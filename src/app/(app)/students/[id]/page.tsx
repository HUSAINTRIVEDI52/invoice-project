import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { formatCurrency, formatDate } from "@/lib/format";
import { calculatePendingForStudent } from "@/lib/reports";

export const dynamic = 'force-dynamic';
export const dynamicParams = true;

export default async function StudentProfilePage({ params }: { params: { id: string } }) {
  const [student, settings] = await Promise.all([
    prisma.student.findUnique({ where: { id: params.id }, include: { standard: { include: { feeStructures: true } }, payments: { orderBy: { paymentDate: "desc" } } } }),
    prisma.settings.findUnique({ where: { id: "default" } }),
  ]);
  if (!student) notFound();
  const pending = calculatePendingForStudent(student);
  return (
    <div className="space-y-6">
      <section className="premium-page-header">
        <div className="relative flex flex-wrap items-center justify-between gap-4"><div className="flex items-center gap-4"><div className="grid h-16 w-16 place-items-center rounded-3xl bg-gradient-to-br from-brand-600 to-brand-900 text-2xl font-bold text-white shadow-glow">{student.fullName.slice(0, 1)}</div><div><span className="premium-pill">Student profile</span><h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">{student.fullName}</h1><p className="text-slate-500">{student.studentCode} · {student.standard.name}</p></div></div><Link href={`/payments/new?standardId=${student.standardId}&studentId=${student.id}`} className="google-primary-button">Record payment</Link></div>
      </section>
      <div className="grid gap-4 md:grid-cols-3"><div className="google-card p-5"><p className="text-sm text-slate-500">Guardian</p><p className="mt-1 font-semibold text-slate-950">{student.guardianName}</p></div><div className="google-card p-5"><p className="text-sm text-slate-500">Contact</p><p className="mt-1 font-semibold text-slate-950">{student.contactNumber}</p></div><div className="google-card p-5"><p className="text-sm text-slate-500">Pending</p><p className="mt-1 font-semibold text-red-700">{formatCurrency(pending, settings?.currency)}</p></div></div>
      <section className="google-card overflow-hidden p-5"><h2 className="google-section-title">Payment history</h2><div className="mt-4 premium-table-wrap"><table className="google-table"><thead><tr><th>Invoice</th><th>Period</th><th>Date</th><th>Mode</th><th>Amount</th><th></th></tr></thead><tbody>{student.payments.map((payment) => <tr key={payment.id}><td className="font-semibold">{payment.invoiceNumber}</td><td>{payment.feePeriod}</td><td>{formatDate(payment.paymentDate)}</td><td>{payment.paymentMode}</td><td className="font-semibold">{formatCurrency(payment.amountReceived, settings?.currency)}</td><td><a className="font-semibold text-brand-700 hover:underline" href={`/api/invoices/${payment.id}/pdf`}>PDF</a></td></tr>)}</tbody></table></div></section>
    </div>
  );
}
