import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { paymentSchema } from "@/lib/validation";
import { nextInvoiceNumber, nextPaymentCode } from "@/lib/invoices";
import { currentPeriod } from "@/lib/format";
import { SelectInput, TextArea, TextInput } from "@/components/FormField";
import { ConfirmSubmitButton } from "@/components/ConfirmSubmitButton";
import { logActivity } from "@/lib/logger";

export const dynamic = 'force-dynamic';

async function createPayment(formData: FormData) {
  "use server";
  const data = paymentSchema.parse(Object.fromEntries(formData));
  const [student, settings] = await Promise.all([
    prisma.student.findUniqueOrThrow({ where: { id: data.studentId }, include: { standard: { include: { feeStructures: true } } } }),
    prisma.settings.findUnique({ where: { id: "default" } }),
  ]);
  const standardFee = student.standard.feeStructures.find((fee) => fee.feeType === "Monthly Fee") ?? student.standard.feeStructures[0];
  const expectedAmount = student.customFeeAmount ?? standardFee?.amount ?? data.amountReceived;
  const payment = await prisma.payment.create({
    data: {
      ...data,
      expectedAmount,
      standardId: student.standardId,
      paymentDate: new Date(data.paymentDate),
      invoiceNumber: await nextInvoiceNumber(settings?.invoicePrefix ?? "MSL", new Date(data.paymentDate)),
      paymentCode: await nextPaymentCode(new Date(data.paymentDate)),
    },
  });
  await logActivity("Recorded", "Payment", `Received ${data.amountReceived} from ${student.fullName} via ${data.paymentMode} (Invoice ${payment.invoiceNumber})`);
  redirect(`/api/invoices/${payment.id}/pdf`);
}

export default async function NewPaymentPage({ searchParams }: { searchParams: { standardId?: string; studentId?: string } }) {
  const standards = await prisma.standard.findMany({ orderBy: { name: "asc" }, include: { feeStructures: true } });
  const selectedStandard = standards.find((standard) => standard.id === searchParams.standardId) ?? standards[0];
  const students = selectedStandard
    ? await prisma.student.findMany({ where: { standardId: selectedStandard.id }, include: { standard: { include: { feeStructures: true } } }, orderBy: { fullName: "asc" } })
    : [];
  const selected = students.find((student) => student.id === searchParams.studentId) ?? students[0];
  const standardFee = selectedStandard?.feeStructures.find((fee) => fee.feeType === "Monthly Fee") ?? selectedStandard?.feeStructures[0];
  const expected = selected?.customFeeAmount ?? standardFee?.amount ?? 1;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="premium-page-header">
        <div className="relative">
          <span className="premium-pill">Guided payment flow</span>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">Record payment</h1>
          <p className="mt-2 text-slate-500">Select a standard first, then record the student fee payment and generate the invoice.</p>
        </div>
      </div>
      <form className="google-card space-y-4 p-6 shadow-premium">
        <div className="flex items-start gap-4"><div className="grid h-10 w-10 place-items-center rounded-full bg-brand-100 font-bold text-brand-700">1</div><div><h2 className="google-section-title">Choose standard</h2><p className="google-muted">The student list updates based on this standard.</p></div></div>
        <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
          <SelectInput label="Standard" name="standardId" defaultValue={selectedStandard?.id} required>{standards.map((standard) => <option key={standard.id} value={standard.id}>{standard.name}</option>)}</SelectInput>
          <button className="google-secondary-button">Show students</button>
        </div>
      </form>

      <form action={createPayment} className="google-card space-y-5 p-6 shadow-premium">
        <div className="flex items-start gap-4"><div className="grid h-10 w-10 place-items-center rounded-full bg-emerald-100 font-bold text-emerald-700">2</div><div><h2 className="google-section-title">Payment details</h2><p className="google-muted">Fee type and period are handled automatically.</p></div></div>
        <input type="hidden" name="feeType" value="Monthly Fee" />
        <input type="hidden" name="feePeriod" value={currentPeriod()} />
        <SelectInput label="Student" name="studentId" defaultValue={selected?.id} required>{students.map((student) => <option key={student.id} value={student.id}>{student.fullName} · {student.studentCode}</option>)}</SelectInput>
        {students.length === 0 ? <p className="rounded-2xl bg-amber-50 p-4 text-sm font-medium text-amber-800">No students are available in this standard. Add a student first.</p> : null}
        <div className="grid gap-4 md:grid-cols-2">
          <TextInput label="Amount received" name="amountReceived" type="number" defaultValue={expected} required />
          <TextInput label="Payment date" name="paymentDate" type="date" defaultValue={new Date().toISOString().slice(0, 10)} required />
          <SelectInput label="Payment mode" name="paymentMode" defaultValue="Cash"><option>Cash</option><option>UPI</option><option>Bank Transfer</option><option>Cheque</option><option>Card</option><option>Other</option></SelectInput>
          <TextInput label="Received by" name="receivedBy" defaultValue="Admin" required />
        </div>
        <TextArea label="Notes" name="notes" rows={3} />
        <ConfirmSubmitButton disabled={students.length === 0} className="google-primary-button" message="Record this payment and generate invoice?">Save and generate invoice</ConfirmSubmitButton>
      </form>
    </div>
  );
}
