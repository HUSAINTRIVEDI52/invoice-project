import Link from "next/link";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { standardSchema } from "@/lib/validation";
import { TextArea, TextInput } from "@/components/FormField";
import { ConfirmButton } from "@/components/ConfirmButton";
import { logActivity } from "@/lib/logger";

export const dynamic = 'force-dynamic';

async function createStandard(formData: FormData) {
  "use server";
  const data = standardSchema.parse(Object.fromEntries(formData));
  const standard = await prisma.standard.create({ data });
  await logActivity("Created", "Standard", `Added standard ${standard.name}`);
  revalidatePath("/standards");
}

async function deleteStandard(id: string) {
  "use server";
  const standard = await prisma.standard.delete({ where: { id } });
  await logActivity("Deleted", "Standard", `Removed standard ${standard.name}`);
  revalidatePath("/standards");
}

export default async function StandardsPage() {
  const standards = await prisma.standard.findMany({ orderBy: { name: "asc" }, include: { _count: { select: { students: true } } } });
  return (
    <div className="space-y-6">
      <div className="premium-page-header"><div className="relative"><span className="premium-pill">Class structure</span><h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">Standards</h1><p className="mt-2 text-slate-500">Organize students by class and jump into standard-wise lists.</p></div></div>
      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <form action={createStandard} className="google-card space-y-4 p-6">
          <div><h2 className="google-section-title">Add standard</h2><p className="google-muted">Create a new class or batch.</p></div>
          <TextInput label="Standard name" name="name" placeholder="Standard 10" required />
          <TextArea label="Description" name="description" rows={3} />
          <button className="google-primary-button">Save standard</button>
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
                    <td className="text-right"><ConfirmButton action={deleteStandard.bind(null, standard.id)} message="Delete this standard?" /></td>
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
