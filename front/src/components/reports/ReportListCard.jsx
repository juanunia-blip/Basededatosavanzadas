export default function ReportListCard({ title, description, emptyText, items, renderItem }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-xl font-bold text-slate-950">{title}</h3>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
      <div className="mt-5">
        {items.length === 0 ? <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">{emptyText}</p> : items.map(renderItem)}
      </div>
    </div>
  );
}
