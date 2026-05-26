import { useEffect, useState } from "react";
import {
  Camera,
  Edit3,
  Mail,
  MapPin,
  User,
  Globe,
  Bell,
  Shield,
  Save,
  LogOut,
} from "lucide-react";

import {
  getMe,
  updateMe,
  getIncomes,
  getExpenses,
  getCategories,
} from "../api/financeApi";

import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { logout } = useAuth();

  const [editing, setEditing] = useState(false);

  const [stats, setStats] = useState({
    transactions: 0,
    categories: 0,
    monthsActive: 0,
  });

  const [form, setForm] = useState({
    nombre: "",
    email: "",
    ciudad: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadProfile = async () => {
    try {
      setLoading(true);

      const [meRes, incomes, expenses, categories] = await Promise.all([
        getMe(),
        getIncomes(),
        getExpenses(),
        getCategories(),
      ]);

      const currentUser = meRes.user;

      setForm({
        nombre: currentUser.nombre || "",
        email: currentUser.email || "",
        ciudad: currentUser.ciudad || "",
      });

      setStats({
        transactions: incomes.length + expenses.length,
        categories: categories.length,
        monthsActive: 4,
      });
    } catch (error) {
      console.error("Error cargando perfil:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const initials = form.nombre
    ? form.nombre
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U";

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const res = await updateMe({
        nombre: form.nombre,
        email: form.email,
        ciudad: form.ciudad,
      });

      localStorage.setItem("user", JSON.stringify(res.user));

      setForm({
        nombre: res.user.nombre || "",
        email: res.user.email || "",
        ciudad: res.user.ciudad || "",
      });

      setEditing(false);
    } catch (error) {
      console.error("Error actualizando perfil:", error);
      alert(
        error.response?.data?.message ||
          "No se pudo actualizar el perfil"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-slate-500">
        Cargando perfil...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8 text-slate-900">
      <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
        <div className="h-32 bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500" />

        <button
          onClick={() => setEditing(!editing)}
          className="absolute right-6 top-6 flex items-center gap-2 rounded-xl border border-white/30 bg-white/20 px-4 py-2 text-sm font-medium text-white backdrop-blur-md transition-all hover:bg-white/30"
        >
          <Edit3 size={16} />
          {editing ? "Cancelar edición" : "Editar Perfil"}
        </button>

        <div className="px-8 pb-8">
          <div className="-mt-10 flex h-28 w-28 items-center justify-center rounded-2xl border-4 border-white bg-gradient-to-br from-violet-500 to-cyan-500 text-3xl font-bold text-white shadow-xl shadow-violet-500/20">
            {initials}

            <button
              type="button"
              className="absolute ml-24 mt-20 rounded-full border border-slate-200 bg-white p-2 text-slate-700 shadow-md transition hover:bg-slate-100"
            >
              <Camera size={16} />
            </button>
          </div>

          <h1 className="mt-6 text-3xl font-bold tracking-tight text-slate-900">
            {form.nombre || "Usuario"}
          </h1>

          <div className="mt-3 flex items-center gap-2 text-slate-500">
            <MapPin size={16} />
            <span>{form.ciudad || "Sin ciudad registrada"}</span>
          </div>

          <p className="mt-4 text-sm text-slate-400">
            Perfil financiero personal
          </p>
        </div>
      </section>

      <div className="mt-8 flex w-fit flex-wrap gap-3 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
        <button className="flex items-center gap-2 rounded-xl bg-violet-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition hover:bg-violet-600">
          <User size={16} />
          Personal
        </button>

        <button className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm text-slate-500 transition hover:bg-slate-100 hover:text-slate-900">
          <Globe size={16} />
          Preferencias
        </button>

        <button className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm text-slate-500 transition hover:bg-slate-100 hover:text-slate-900">
          <Bell size={16} />
          Notificaciones
        </button>

        <button className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm text-slate-500 transition hover:bg-slate-100 hover:text-slate-900">
          <Shield size={16} />
          Seguridad
        </button>
      </div>

      <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
        <div className="mb-8 flex items-center gap-3">
          <User className="text-violet-500" size={22} />

          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Información Personal
            </h2>

            <p className="text-sm text-slate-500">
              Administra tu información de contacto y datos personales.
            </p>
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <Field
            label="Nombre"
            name="nombre"
            value={form.nombre}
            editing={editing}
            onChange={handleChange}
          />

          <Field
            label="Ciudad"
            name="ciudad"
            value={form.ciudad}
            editing={editing}
            onChange={handleChange}
          />
        </div>

        <div className="my-8 border-t border-slate-200" />

        <InfoRow
          icon={<Mail size={18} />}
          label="Correo electrónico"
          value={form.email}
          name="email"
          editing={editing}
          onChange={handleChange}
        />

        <InfoRow
          icon={<MapPin size={18} />}
          label="Ciudad"
          value={form.ciudad}
          name="ciudad"
          editing={editing}
          onChange={handleChange}
        />

        {editing && (
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="mt-8 flex items-center gap-2 rounded-2xl bg-violet-500 px-5 py-3 font-semibold text-white shadow-lg shadow-violet-500/20 transition-all hover:bg-violet-600 disabled:opacity-60"
          >
            <Save size={18} />
            {saving ? "Guardando..." : "Guardar cambios"}
          </button>
        )}
      </section>

      <section className="mt-8 grid gap-6 md:grid-cols-3">
        <StatCard value={stats.transactions} label="Transacciones" />
        <StatCard value={stats.categories} label="Categorías" />
        <StatCard value={stats.monthsActive} label="Meses activo" />
      </section>

      <button
        type="button"
        onClick={logout}
        className="mt-8 flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-5 py-3 text-red-500 transition-all hover:bg-red-100"
      >
        <LogOut size={18} />
        Cerrar sesión
      </button>
    </div>
  );
}

function Field({ label, name, value, editing, onChange }) {
  return (
    <div>
      <p className="mb-3 text-sm text-slate-500">{label}</p>

      {editing ? (
        <input
          name={name}
          value={value}
          onChange={onChange}
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition-all focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20"
        />
      ) : (
        <p className="font-semibold text-slate-900">
          {value || "Sin información"}
        </p>
      )}
    </div>
  );
}

function InfoRow({ icon, label, value, name, editing, onChange }) {
  return (
    <div className="mb-8">
      <div className="mb-3 flex items-center gap-3 text-sm text-violet-500">
        {icon}
        <span>{label}</span>
      </div>

      {editing ? (
        <input
          name={name}
          value={value}
          onChange={onChange}
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition-all focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20"
        />
      ) : (
        <p className="font-semibold text-slate-900">
          {value || "Sin información"}
        </p>
      )}
    </div>
  );
}

function StatCard({ value, label }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
      <p className="text-3xl font-bold text-violet-500">
        {value}
      </p>

      <p className="mt-2 text-sm text-slate-500">
        {label}
      </p>
    </div>
  );
}