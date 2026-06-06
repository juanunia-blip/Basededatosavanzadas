import { Pencil, Trash2 } from "lucide-react";

export default function ActionButtons({ onEdit, onDelete }) {
  return (
    <div className="flex justify-end gap-2">
      <button onClick={onEdit} className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-100 hover:text-violet-700" title="Editar">
        <Pencil size={17} />
      </button>
      <button onClick={onDelete} className="rounded-xl border border-red-100 bg-red-50 p-2 text-red-600 hover:bg-red-100" title="Eliminar">
        <Trash2 size={17} />
      </button>
    </div>
  );
}
