import { Download } from "lucide-react";

export default function ExportButton({ label, onClick, className = "" }) {
  return (
    <button onClick={onClick} className={`flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-bold transition ${className}`}>
      <Download size={16} />
      {label}
    </button>
  );
}
