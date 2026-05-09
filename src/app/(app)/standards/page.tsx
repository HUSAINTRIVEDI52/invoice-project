import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { standardSchema } from "@/lib/validation";
import { TextArea, TextInput } from "@/components/FormField";
import { ConfirmButton } from "@/components/ConfirmButton";
import { ConfirmSubmitButton } from "@/components/ConfirmSubmitButton";
import { logActivity } from "@/lib/logger";

export const dynamic = 'force-dynamic';

async function createStandard(formData: FormData) {
  "use server";
  const data = standardSchema.parse(Object.fromEntries(formData));
  const existing = await prisma.standard.findUnique({ where: { name: data.name } });
  const standard = await prisma.standard.upsert({
    where: { name: data.name },
    update: { description: data.description },
    create: data,
  });
  await logActivity(existing ? "Updated" : "Created", "Standard", `${existing ? "Updated" : "Added"} standard ${standard.name}`);
  revalidatePath("/standards");
  redirect(`/standards?toast=${encodeURIComponent(existing ? "Standard updated successfully" : "Standard saved successfully")}`);
}

async function deleteStandard(id: string) {
  "use server";
  const blocked = await prisma.standard.findUnique({
    where: { id },
    select: { _count: { select: { students: true, payments: true } } },
  });
  if (!blocked || blocked._count.students > 0 || blocked._count.payments > 0) {
    revalidatePath("/standards");
    redirect("/standards?toast=Standard%20is%20in%20use%20and%20cannot%20be%20deleted");
  }
  const standard = await prisma.standard.delete({ where: { id } });
  await logActivity("Deleted", "Standard", `Removed standard ${standard.name}`);
  revalidatePath("/standards");
  redirect("/standards?toast=Standard%20deleted%20successfully");
}

export default async function StandardsPage() {
  const standards = await prisma.standard.findMany({ orderBy: { name: "asc" }, include: { _count: { select: { students: true, payments: true } } } });
  return (
    <div className="space-y-6">
      <div className="premium-page-header"><div className="relative"><span className="premium-pill">Class structure</span><h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">Standards</h1><p className="mt-2 text-slate-500">Organise students by standard and jump into standard-wise lists.</p></div></div>
      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <form action={createStandard} className="google-card space-y-4 p-6">
          <div><h2 className="google-section-title">Add standard</h2><p className="google-muted">Create a new standard or batch.</p></div>
          <TextInput label="Standard name" name="name" placeholder="Standard 10" required />
          <TextArea label="Description" name="description" rows={3} />
          <ConfirmSubmitButton className="google-primary-button" message="Save this standard?">Save standard</ConfirmSubmitButton>
        </form>
        <section className="google-card overflow-hidden p-5">
          <h2 className="google-section-title">All standards</h2>
          <div className="mt-4 premium-table-wrap">
            <table className="google-table">
              <thead><tr><th>Name</th><th>Students</th><th>Description</th><th></th></tr></thead>
              <tbody>
                {standards.map((standard) => (
                  <tr key={standard.id}>
                    <td><Link className="font-semibold text-brand-700 hover:underline" href={`/students?standardId=${standard.id}`}>{standard.name}</Link></td>
                    <td><Link className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 hover:bg-brand-100" href={`/students?standardId=${standard.id}`}>{standard._count.students} student{standard._count.students === 1 ? "" : "s"}</Link></td>
                    <td className="text-slate-500">{standard.description}</td>
                    <td className="text-right">
                      {standard._count.students > 0 || standard._count.payments > 0 ? (
                        <span className="inline-flex rounded-full bg-stone-100 px-3.5 py-1.5 text-sm font-semibold text-stone-500">In use</span>
                      ) : (
                        <ConfirmButton action={deleteStandard.bind(null, standard.id)} message="Delete this standard?" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
