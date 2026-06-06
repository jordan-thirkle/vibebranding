interface ExportButtonProps {
  label: string;
  format: string;
  onExport: (format: string) => void;
  loading: boolean;
  highlighted?: boolean;
}

export default function ExportButton({ label, format, onExport, loading, highlighted }: ExportButtonProps) {
  return (
    <button
      onClick={() => onExport(format)}
      disabled={loading}
      aria-label={`Download ${label}`}
      className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-colors min-h-[44px] ${
        highlighted
          ? "bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400"
          : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 disabled:opacity-50"
      }`}
    >
      {loading ? "..." : label}
    </button>
  );
}
