import { useEffect, useState } from "react";
import { Mail, MapPin, Save, User } from "lucide-react";
import { updateUser } from "../api/financeApi";

export default function Profile({ user, onRefresh }) {
  const [form, setForm] = useState({
    nombre: "",
    email: "",
    ciudad: "",
    fecha_registro: "",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        nombre: user.nombre || "",
        email: user.email || "",
        ciudad: user.ciudad || "",
        fecha_registro: user.fecha_registro
          ? new Date(user.fecha_registro).toISOString().split("T")[0]
          : "",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      await updateUser(user._id, {
        nombre: form.nombre,
        email: form.email,
        ciudad: form.ciudad,
        fecha_registro: form.fecha_registro,
      });

      onRefresh?.();
      alert("Perfil actualizado correctamente");
    } catch (error) {
      console.error(error);
      alert("Error actualizando perfil");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="p-8">
        <p className="text-slate-500">
          No se encontró información del usuario.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-8">
      <div>
        <h1 className="text-4xl font-bold text-slate-950">Perfil</h1>
        <p className="mt-2 text-slate-500">
          Administra tu información personal.
        </p>
      </div>

      <section className="grid gap-6 lg:grid-cols-[1fr_2fr]">
        <article className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-blue-700 text-4xl font-bold text-white">
            {user.nombre?.charAt(0) || "U"}
          </div>

          <h2 className="mt-5 text-2xl font-bold text-slate-950">
            {user.nombre}
          </h2>

          <p className="mt-1 text-slate-500">{user.usuario_id}</p>

          <div className="mt-8 space-y-4 text-left">
            <div className="flex items-center gap-3 text-slate-600">
              <Mail size={20} />
              <span>{user.email}</span>
            </div>

            <div className="flex items-center gap-3 text-slate-600">
              <MapPin size={20} />
              <span>{user.ciudad}</span>
            </div>

            <div className="flex items-center gap-3 text-slate-600">
              <User size={20} />
              <span>Usuario activo</span>
            </div>
          </div>
        </article>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm"
        >
          <h2 className="mb-6 text-2xl font-bold text-slate-950">
            Información personal
          </h2>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Nombre
              </label>
              <input
                type="text"
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                required
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Ciudad
              </label>
              <input
                type="text"
                name="ciudad"
                value={form.ciudad}
                onChange={handleChange}
                required
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Fecha de registro
              </label>
              <input
                type="date"
                name="fecha_registro"
                value={form.fecha_registro}
                onChange={handleChange}
                required
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-600"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-8 flex items-center gap-2 rounded-xl bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800 disabled:opacity-60"
          >
            <Save size={20} />
            {loading ? "Guardando..." : "Guardar cambios"}
          </button>
        </form>
      </section>
    </div>
  );
}