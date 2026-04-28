import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

type BaseProps = {
  label: string;
  name: string;
};

const fieldClass = "mt-1.5 w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-sm shadow-sm outline-none transition placeholder:text-slate-400 hover:border-brand-100 hover:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-100";

export function TextInput({ label, name, ...props }: BaseProps & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <input name={name} className={fieldClass} {...props} />
    </label>
  );
}

export function SelectInput({ label, name, children, ...props }: BaseProps & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <select name={name} className={fieldClass} {...props}>{children}</select>
    </label>
  );
}

export function TextArea({ label, name, ...props }: BaseProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <textarea name={name} className={fieldClass} {...props} />
    </label>
  );
}
