import React from 'react';

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export default function FormField({ label, ...props }: FormFieldProps) {
  return <label className="grid gap-1 text-sm font-medium text-slate-700">{label}<input className="rounded border border-slate-300 px-3 py-2 font-normal" {...props} /></label>;
}
