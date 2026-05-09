import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

type BaseProps = {
  label: string;
  name: string;
};

const fieldClass = "mt-2 w-full rounded-2xl border border-stone-200/90 bg-[#fffdf8]/95 px-4 py-3 text-sm font-semibold shadow-sm outline-none transition placeholder:text-stone-400 hover:border-brand-300 hover:bg-white focus:border-brand-600 focus:ring-4 focus:ring-brand-200/70";

export function TextInput({ label, name, ...props }: BaseProps & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="text-sm font-bold text-stone-700">{label}</span>
      <input name={name} className={fieldClass} {...props} />
    </label>
  );
}

export function SelectInput({ label, name, children, ...props }: BaseProps & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <label className="block">
      <span className="text-sm font-bold text-stone-700">{label}</span>
      <select name={name} className={fieldClass} {...props}>{children}</select>
    </label>
  );
}

export function TextArea({ label, name, ...props }: BaseProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <label className="block">
      <span className="text-sm font-bold text-stone-700">{label}</span>
      <textarea name={name} className={fieldClass} {...props} />
    </label>
  );
}
