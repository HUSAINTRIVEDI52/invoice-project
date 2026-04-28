import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { settingsSchema } from "@/lib/validation";
import { TextInput } from "@/components/FormField";

async function saveSettings(formData: FormData) {
  "use server";
  const data = settingsSchema.parse(Object.fromEntries(formData));
  await prisma.settings.upsert({ where: { id: "default" }, update: data, create: { id: "default", ...data } });
  revalidatePath("/settings");
}

export default async function SettingsPage() {
  const settings = await prisma.settings.findUnique({ where: { id: "default" } });
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="premium-page-header"><div className="relative"><span className="premium-pill">Institute profile</span><h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">Settings</h1><p className="mt-2 text-slate-500">These details appear on generated invoices and reports.</p></div></div>
      <form action={saveSettings} className="google-card space-y-4 p-6 shadow-premium">
        <TextInput label="Class name" name="className" defaultValue={settings?.className} required />
        <TextInput label="Address" name="address" defaultValue={settings?.address ?? ""} />
        <div className="grid gap-4 md:grid-cols-2"><TextInput label="Contact number" name="contactNumber" defaultValue={settings?.contactNumber ?? ""} /><TextInput label="Email" name="email" type="email" defaultValue={settings?.email ?? ""} /></div>
        <div className="grid gap-4 md:grid-cols-2"><TextInput label="Invoice prefix" name="invoicePrefix" defaultValue={settings?.invoicePrefix ?? "SE"} required /><TextInput label="Currency" name="currency" defaultValue={settings?.currency ?? "INR"} required /></div>
        <TextInput label="Logo URL" name="logoUrl" defaultValue={settings?.logoUrl ?? ""} />
        <button className="google-primary-button">Save settings</button>
      </form>
    </div>
  );
}
