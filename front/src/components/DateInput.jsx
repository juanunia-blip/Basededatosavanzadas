import { useRef } from "react";
import { CalendarDays } from "lucide-react";
import { fieldClass, helperTextClass, labelClass } from "./utils/businessStyles";

export default function DateInput({ label, value, onChange, required = false, helperText }) {
  const inputRef = useRef(null);
  const openCalendar = () => {
    const input = inputRef.current;
    if (!input) return;
    if (typeof input.showPicker === "function") {
      input.showPicker();
      return;
    }
    input.focus();
    input.click();
  };
  return (
    <div>
      {label && <label className={labelClass}>{label}</label>}
      <div className="relative">
        <input ref={inputRef} type="date" value={value} onChange={onChange} className={`${fieldClass} cursor-pointer pr-12`} required={required} onClick={openCalendar} onFocus={(e) => { if (typeof e.currentTarget.showPicker === "function") e.currentTarget.showPicker(); }} />
        <button type="button" onClick={openCalendar} className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl text-slate-400 transition hover:bg-violet-50 hover:text-violet-600" aria-label="Abrir calendario">
          <CalendarDays size={18} />
        </button>
      </div>
      {helperText && <p className={helperTextClass}>{helperText}</p>}
    </div>
  );
}
