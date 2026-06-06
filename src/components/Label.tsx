interface LabelProps {
  children: React.ReactNode;
}

export default function Label({ children }: LabelProps) {
  return <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">{children}</span>;
}
