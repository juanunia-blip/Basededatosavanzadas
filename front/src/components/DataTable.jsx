export function DataTable({ children }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-left">{children}</table>
      </div>
    </div>
  );
}

export function TableHeader({ children, align = "left" }) {
  return (
    <th className={`px-6 py-4 text-sm font-bold text-slate-500 ${align === "right" ? "text-right" : "text-left"}`}>
      {children}
    </th>
  );
}

export function TableCell({ children, strong, className = "" }) {
  return (
    <td className={`px-6 py-4 text-slate-600 ${strong ? "font-semibold text-slate-900" : ""} ${className}`}>
      {children}
    </td>
  );
}
