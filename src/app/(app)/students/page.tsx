import Link from "next/link";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { studentSchema } from "@/lib/validation";
import { SelectInput, TextArea, TextInput } from "@/components/FormField";
import { ConfirmButton } from "@/components/ConfirmButton";
import { logActivity } from "@/lib/logger";

export const dynamic = 'force-dynamic';

async function createStudent(formData: FormData) {
  "use server";
  const parsed = studentSchema.parse(Object.fromEntries(formData));
  const student = await prisma.student.create({
    data: {
      ...parsed,
      admissionDate: new Date(parsed.admissionDate),
      email: parsed.email || null,
      customFeeAmount: parsed.customFeeAmount === "" ? null : parsed.customFeeAmount,
    },
    include: { standard: true },
  });
  await logActivity("Created", "Student", `Added student ${student.fullName} (${student.studentCode}) to ${student.standard.name}`);
  revalidatePath("/students");
}

async function deleteStudent(id: string) {
  "use server";
  const student = await prisma.student.delete({ where: { id }, include: { standard: true } });
  await logActivity("Deleted", "Student", `Removed student ${student.fullName} (${student.studentCode}) from ${student.standard.name}`);
  revalidatePath("/students");
}

export default async function StudentsPage({ searchParams }: { searchParams: { q?: string; standardId?: string } }) {
  const [standards, students] = await Promise.all([
    prisma.standard.findMany({ orderBy: { name: "asc" }, include: { _count: { select: { students: true } } } }),
    prisma.student.findMany({
      where: {
        standardId: searchParams.standardId || undefined,
        OR: searchParams.q ? [
          { fullName: { contains: searchParams.q } },
          { studentCode: { contains: searchParams.q } },
          { contactNumber: { contains: searchParams.q } },
        ] : undefined,
      },
      include: { standard: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div className="premium-page-header">
        <div className="relative">
          <span className="premium-pill">Student management</span>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">Students</h1>
          <p className="mt-2 max-w-2xl text-slate-500">Create polished student records and browse the class strength standard-wise.</p>
        </div>
      </div>
      <details className="group google-card overflow-hidden shadow-premium">
        <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-4 p-5">
          <div>
            <h2 className="google-section-title">Add student</h2>
            <p className="google-muted">Open one form, select the standard, and save the student.</p>
          </div>
          <span className="google-primary-button group-open:hidden">Add student</span>
          <span className="hidden rounded-full bg-slate-100 px-5 py-2.5 text-sm font-semibold text-slate-700 group-open:inline-flex">Close form</span>
        </summary>
        <form action={createStudent} className="border-t border-slate-100 p-5 pt-6">
          <div className="grid gap-4 md:grid-cols-3">
            <TextInput label="Student code" name="studentCode" placeholder="SE-STU-002" required />
            <TextInput label="Full name" name="fullName" required />
            <SelectInput label="Standard" name="standardId" defaultValue={searchParams.standardId ?? ""} required><option value="" disabled>Select standard</option>{standards.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</SelectInput>
            <TextInput label="Guardian name" name="guardianName" required />
            <TextInput label="Contact number" name="contactNumber" required />
            <TextInput label="WhatsApp number" name="whatsappNumber" />
            <TextInput label="Email" name="email" type="email" />
            <TextInput label="Admission date" name="admissionDate" type="date" required />
            <SelectInput label="Status" name="status" defaultValue="active"><option value="active">Active</option><option value="inactive">Inactive</option><option value="completed">Completed</option><option value="left">Left</option></SelectInput>
            <TextInput label="Custom fee amount" name="customFeeAmount" type="number" />
            <TextInput label="Address" name="address" />
            <TextArea label="Notes" name="notes" rows={1} />
          </div>
          <div className="mt-5 flex justify-end">
            <button className="google-primary-button">Save student</button>
          </div>
        </form>
      </details>
      <section className="google-card overflow-hidden p-5">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="google-section-title">Student list</h2>
            <p className="google-muted">Showing {students.length} student{students.length === 1 ? "" : "s"}</p>
          </div>
          <a href="/students" className="google-secondary-button">Clear filters</a>
        </div>
        <div className="mb-5 flex flex-wrap gap-2">
          <Link href="/students" className={`rounded-full px-4 py-2 text-sm font-semibold transition ${!searchParams.standardId ? "bg-brand-600 text-white shadow-sm" : "bg-slate-100 text-slate-700 hover:bg-brand-50 hover:text-brand-700"}`}>All standards</Link>
          {standards.map((standard) => (
            <Link key={standard.id} href={`/students?standardId=${standard.id}${searchParams.q ? `&q=${encodeURIComponent(searchParams.q)}` : ""}`} className={`rounded-full px-4 py-2 text-sm font-semibold transition ${searchParams.standardId === standard.id ? "bg-brand-600 text-white shadow-sm" : "bg-slate-100 text-slate-700 hover:bg-brand-50 hover:text-brand-700"}`}>
              {standard.name} ({standard._count.students})
            </Link>
          ))}
        </div>
        <form className="mb-5 flex flex-wrap gap-3">
          <input name="q" placeholder="Search students" defaultValue={searchParams.q} className="rounded-full border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-brand-600 focus:ring-4 focus:ring-brand-100" />
          <select name="standardId" defaultValue={searchParams.standardId} className="rounded-full border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-brand-600 focus:ring-4 focus:ring-brand-100"><option value="">All standards</option>{standards.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select>
          <button className="google-secondary-button">Filter</button>
        </form>
        <div className="premium-table-wrap">
          <table className="google-table"><thead><tr><th>Code</th><th>Name</th><th>Standard</th><th>Contact</th><th>Status</th><th></th></tr></thead><tbody>{students.map((student) => <tr key={student.id}><td>{student.studentCode}</td><td><Link className="font-semibold text-brand-700 hover:underline" href={`/students/${student.id}`}>{student.fullName}</Link></td><td>{student.standard.name}</td><td>{student.contactNumber}</td><td><span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold capitalize text-emerald-700">{student.status}</span></td><td className="text-right"><ConfirmButton action={deleteStudent.bind(null, student.id)} /></td></tr>)}</tbody></table>
        </div>
        {students.length === 0 ? <p className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">No students match this standard or search.</p> : null}
      </section>
    </div>
  );
}
