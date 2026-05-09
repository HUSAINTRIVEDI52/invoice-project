import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { settingsSchema } from "@/lib/validation";
import { TextInput } from "@/components/FormField";
import { ConfirmSubmitButton } from "@/components/ConfirmSubmitButton";

export const dynamic = 'force-dynamic';

async function saveSettings(formData: FormData) {
  "use server";
  const raw = Object.fromEntries(formData);
  raw.invoicePrefix = String(raw.invoicePrefix ?? "").trim().toUpperCase().slice(0, 8);
  raw.currency = String(raw.currency ?? "").trim().toUpperCase().slice(0, 3);
  const data = settingsSchema.parse(raw);
  await prisma.settings.upsert({ where: { id: "default" }, update: data, create: { id: "default", ...data } });
  revalidatePath("/settings");
  redirect("/settings?toast=Settings%20saved%20successfully");
}

export default async function SettingsPage() {
  const settings = await prisma.settings.findUnique({ where: { id: "default" } });
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="premium-page-header"><div className="relative"><span className="premium-pill">Institution profile</span><h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">Settings</h1><p className="mt-2 text-slate-500">These details appear on generated invoices and reports.</p></div></div>
      <form action={saveSettings} className="google-card space-y-4 p-6 shadow-premium">
        <TextInput label="Institution name" name="className" defaultValue={settings?.className} required />
        <TextInput label="Address" name="address" defaultValue={settings?.address ?? ""} />
        <div className="grid gap-4 md:grid-cols-2"><TextInput label="Contact number" name="contactNumber" defaultValue={settings?.contactNumber ?? ""} /><TextInput label="Email" name="email" type="email" defaultValue={settings?.email ?? ""} /></div>
        <div className="grid gap-4 md:grid-cols-2"><TextInput label="Invoice prefix" name="invoicePrefix" defaultValue={settings?.invoicePrefix ?? "MSL"} maxLength={8} required /><TextInput label="Currency" name="currency" defaultValue={settings?.currency ?? "INR"} maxLength={3} required /></div>
        <TextInput label="Logo URL" name="logoUrl" defaultValue={settings?.logoUrl ?? ""} />
        <ConfirmSubmitButton className="google-primary-button" message="Save settings?">Save settings</ConfirmSubmitButton>
      </form>
    </div>
  );
}
