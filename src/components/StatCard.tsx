type StatCardProps = {
  title: string;
  value: string | number;
  hint?: string;
};

export function StatCard({ title, value, hint }: StatCardProps) {
  return (
    <div className="group google-card relative overflow-hidden p-5 transition duration-300 hover:-translate-y-1 hover:shadow-float">
      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-brand-100/80 blur-2xl transition group-hover:bg-brand-100" />
      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-500">{title}</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{value}</p>
          {hint ? <p className="mt-2 text-sm text-slate-500">{hint}</p> : null}
        </div>
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-brand-50 to-white text-sm font-bold text-brand-700 shadow-sm ring-1 ring-brand-100">
          {title.slice(0, 1)}
        </div>
      </div>
      <div className="relative mt-5 h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-brand-500 to-google-green transition group-hover:w-full" />
      </div>
    </div>
  );
}
