import { X } from "lucide-react";

export default function ModalShell({ title, description, onClose, onSubmit, saving, submitText, children, maxWidth = "max-w-lg" }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 backdrop-blur-sm">
      <form onSubmit={onSubmit} className={`max-h-[90vh] w-full ${maxWidth} overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl`}>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-950">{title}</h2>
            <p className="mt-1 text-sm text-slate-500">{description}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
            <X size={22} />
          </button>
        </div>
        <div className="space-y-4">{children}</div>
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded-2xl border border-slate-200 px-5 py-3 font-semibold text-slate-600 hover:bg-slate-100">Cancelar</button>
          <button disabled={saving} className="rounded-2xl bg-violet-600 px-5 py-3 font-semibold text-white hover:bg-violet-700 disabled:opacity-60">{saving ? "Guardando..." : submitText}</button>
        </div>
      </form>
    </div>
  );
}
