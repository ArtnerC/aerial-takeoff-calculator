import type { ReactNode } from "react";

interface StepSectionProps {
  step: number;
  title: string;
  optional?: boolean;
  hint?: string;
  complete?: boolean;
  children: ReactNode;
}

export function StepSection({
  step,
  title,
  optional,
  hint,
  complete,
  children,
}: StepSectionProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-3 flex items-start gap-3">
        <span
          aria-hidden="true"
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
            complete
              ? "bg-green-700 text-white"
              : "bg-slate-100 text-slate-600"
          }`}
        >
          {complete ? "✓" : step}
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-semibold text-slate-900 sm:text-lg">
              {title}
            </h2>
            {optional && (
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                Optional
              </span>
            )}
          </div>
          {hint && <p className="mt-0.5 text-sm text-slate-600">{hint}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}
