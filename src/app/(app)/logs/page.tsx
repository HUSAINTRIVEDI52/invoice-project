import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/format";

export const dynamic = 'force-dynamic';

export default async function LogsPage() {
  const logs = await prisma.activityLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 100, // Keep it to recent 100 to avoid clutter
  });

  return (
    <div className="space-y-6">
      <div className="premium-page-header">
        <div className="relative">
          <span className="premium-pill">System audit</span>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">Activity logs</h1>
          <p className="mt-2 text-slate-500">Track recent changes across students, standards, and payments.</p>
        </div>
      </div>

      <section className="google-card overflow-hidden p-4 sm:p-5 shadow-premium">
        <div className="premium-table-wrap">
          <table className="google-table">
            <thead>
              <tr>
                <th className="w-48">Date & Time</th>
                <th className="w-32">Action</th>
                <th className="w-40">User</th>
                <th className="w-32">Entity</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => {
                const match = log.details.match(/^\[(.*?)\]\s(.*)$/);
                const user = match ? match[1] : "System";
                const cleanDetails = match ? match[2] : log.details;

                return (
                  <tr key={log.id}>
                    <td className="whitespace-nowrap text-slate-500">
                      {formatDate(log.createdAt)} {log.createdAt.toLocaleTimeString()}
                    </td>
                    <td>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold
                        ${log.action === "Created" ? "bg-emerald-50 text-emerald-700" : ""}
                        ${log.action === "Deleted" ? "bg-red-50 text-red-700" : ""}
                        ${log.action === "Updated" ? "bg-blue-50 text-blue-700" : ""}
                        ${log.action === "Recorded" ? "bg-brand-50 text-brand-700" : ""}
                      `}>
                        {log.action}
                      </span>
                    </td>
                    <td>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                        {user}
                      </span>
                    </td>
                    <td className="font-semibold text-slate-700">{log.entity}</td>
                    <td className="text-slate-950">{cleanDetails}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {logs.length === 0 ? (
          <p className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">No recent activity.</p>
        ) : null}
      </section>
    </div>
  );
}
