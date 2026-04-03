import { cn } from "@/lib/utils";

interface InputSkorProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export function InputSkor({ label, className, ...props }: InputSkorProps) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label className="text-sm font-medium text-slate-600 pl-1">
        {label}
      </label>
      <input
        className={cn(
          "w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 shadow-soft-inner",
          "focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-100/50 outline-none",
          "transition-all duration-300 text-slate-700 font-medium placeholder:text-slate-400",
          "disabled:opacity-50 disabled:bg-slate-50 disabled:cursor-not-allowed",
          className
        )}
        {...props}
      />
    </div>
  );
}