import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { feeStructureSchema } from "@/lib/validation";
import { SelectInput, TextInput } from "@/components/FormField";
import { ConfirmButton } from "@/components/ConfirmButton";
import { formatCurrency } from "@/lib/format";
import { logActivity } from "@/lib/logger";

async function createFeeStructure(formData: FormData) {
  "use server";
  const data = feeStructureSchema.parse(Object.fromEntries(formData));
  const fee = await prisma.feeStructure.upsert({
    where: { standardId_feeType: { standardId: data.standardId, feeType: data.feeType } },
    update: { amount: data.amount, billingCycle: data.billingCycle },
    create: data,
    include: { standard: true },
  });
  await logActivity("Updated", "Fee Structure", `Set ${fee.feeType} for ${fee.standard.name} to ${fee.amount} (${fee.billingCycle})`);
  revalidatePath("/fee-structures");
}

async function deleteFeeStructure(id: string) {
  "use server";
  const fee = await prisma.feeStructure.delete({ where: { id }, include: { standard: true } });
  await logActivity("Deleted", "Fee Structure", `Removed ${fee.feeType} from ${fee.standard.name}`);
  revalidatePath("/fee-structures");
}

export default async function FeeStructuresPage() {
  const [standards, fees, settings] = await Promise.all([
    prisma.standard.findMany({ orderBy: { name: "asc" } }),
    prisma.feeStructure.findMany({ include: { standard: true }, orderBy: { createdAt: "desc" } }),
    prisma.settings.findUnique({ where: { id: "default" } }),
  ]);
  return (
    <div className="space-y-6">
      <div className="premium-page-header"><div className="relative"><span className="premium-pill">Fee planning</span><h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">Fee structures</h1><p className="mt-2 text-slate-500">Set standard-wise monthly, exam, and custom fees.</p></div></div>
      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <form action={createFeeStructure} className="google-card space-y-4 p-6">
          <div><h2 className="google-section-title">Add fee</h2><p className="google-muted">Configure fee amount for a standard.</p></div>
          <SelectInput label="Standard" name="standardId" required>{standards.map((standard) => <option key={standard.id} value={standard.id}>{standard.name}</option>)}</SelectInput>
          <TextInput label="Fee type" name="feeType" defaultValue="Monthly Tuition Fee" required />
          <TextInput label="Amount" name="amount" type="number" required />
          <SelectInput label="Billing cycle" name="billingCycle" defaultValue="monthly"><option value="monthly">Monthly</option><option value="quarterly">Quarterly</option><option value="yearly">Yearly</option><option value="custom">Custom</option></SelectInput>
          <button className="google-primary-button">Save fee</button>
        </form>
        <section className="google-card overflow-hidden p-5">
          <h2 className="google-section-title">Configured fees</h2>
          <div className="mt-4 premium-table-wrap"><table className="google-table"><thead><tr><th>Standard</th><th>Type</th><th>Amount</th><th>Cycle</th><th></th></tr></thead><tbody>{fees.map((fee) => <tr key={fee.id}><td className="font-semibold">{fee.standard.name}</td><td>{fee.feeType}</td><td className="font-semibold">{formatCurrency(fee.amount, settings?.currency)}</td><td><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold capitalize text-slate-700">{fee.billingCycle}</span></td><td className="text-right"><ConfirmButton action={deleteFeeStructure.bind(null, fee.id)} /></td></tr>)}</tbody></table></div>
        </section>
      </div>
    </div>
  );
}
