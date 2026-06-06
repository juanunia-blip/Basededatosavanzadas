export default function StatusBadge({ status }) {
  const styles = {
    pendiente: "bg-orange-50 text-orange-700",
    abonado: "bg-blue-50 text-blue-700",
    pagado: "bg-emerald-50 text-emerald-700",
  };
  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${styles[status] || "bg-slate-100 text-slate-700"}`}>{status || "pendiente"}</span>;
}
