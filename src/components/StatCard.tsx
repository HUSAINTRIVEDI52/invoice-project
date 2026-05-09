type StatCardProps = {
  title: string;
  value: string | number;
  hint?: string;
};

export function StatCard({ title, value, hint }: StatCardProps) {
  return (
    <div className="group google-card relative overflow-hidden p-5 transition duration-300 hover:-translate-y-1 hover:shadow-float">
      <div className="absolute -right-10 -top-12 h-36 w-36 rounded-full bg-brand-300/45 blur-3xl transition group-hover:bg-brand-400/45" />
      <div className="absolute -bottom-16 left-8 h-28 w-28 rounded-full bg-accent-200/55 blur-3xl" />
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-500 via-teal-500 to-accent-600" />
      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-400">{title}</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-stone-950 sm:text-4xl">{value}</p>
          {hint ? <p className="mt-2 text-sm font-semibold text-stone-500">{hint}</p> : null}
        </div>
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-slate-950 via-accent-700 to-brand-700 text-sm font-semibold text-white shadow-card ring-1 ring-white/70">
          {title.slice(0, 1)}
        </div>
      </div>
      <div className="relative mt-6 h-2 overflow-hidden rounded-full bg-stone-100">
        <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-brand-500 via-teal-500 to-accent-600 transition-all duration-500 group-hover:w-full" />
      </div>
    </div>
  );
}
