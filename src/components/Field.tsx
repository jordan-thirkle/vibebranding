interface FieldProps {
  label: string;
  hint: string;
  hintId?: string;
  children: React.ReactNode;
}

export default function Field({ label, hint, hintId, children }: FieldProps) {
  const id = hintId || `field-${label.replace(/\s+/g, '-').toLowerCase()}-hint`;
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5">{label}</label>
      {children}
      <p id={id} className="mt-1 text-xs text-zinc-500">{hint}</p>
    </div>
  );
}
