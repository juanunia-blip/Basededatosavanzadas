import { useEffect, useState } from "react";
import { ShoppingCart } from "lucide-react";
import { createBusinessSale, deleteBusinessSale, getBusinessSales, updateBusinessSale } from "../../api/financeApi";
import ActionButtons from "../../components/ActionButtons";
import DateInput from "../../components/DateInput";
import EmptyState from "../../components/EmptyState";
import LoadingCard from "../../components/LoadingCard";
import ModalShell from "../../components/ModalShell";
import SectionHeader from "../../components/SectionHeader";
import TotalPreview from "../../components/TotalPreview";
import { DataTable, TableCell, TableHeader } from "../../components/DataTable";
import { KG_PER_LOAD } from "../../components/utils/businessConstants";
import { formatDate, formatMoney, getToday } from "../../components/utils/businessFormatters";
import { fieldClass, helperTextClass } from "../../components/utils/businessStyles";

function BusinessSales({
  business,
  onRefreshSummary,
  quickAction,
  onQuickActionDone,
}) {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingSale, setEditingSale] = useState(null);

  const [form, setForm] = useState({
    producto: "",
    cantidad: "",
    precio_carga: "",
    comprador: "",
    fecha: getToday(),
  });

  const cantidadKg = Number(form.cantidad || 0);
  const precioCarga = Number(form.precio_carga || 0);
  const precioKiloCalculado = precioCarga > 0 ? precioCarga / KG_PER_LOAD : 0;
  const totalVentaCalculado = cantidadKg * precioKiloCalculado;

  const loadSales = async () => {
    try {
      setLoading(true);
      const data = await getBusinessSales(business._id);
      setSales(data);
    } catch (error) {
      console.error("Error cargando ventas:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSales();
  }, [business._id]);

  useEffect(() => {
    if (quickAction === "venta") {
      openCreateModal();
      onQuickActionDone?.();
    }
  }, [quickAction]);

  const openCreateModal = () => {
    setEditingSale(null);
    setForm({
      producto: "",
      cantidad: "",
      precio_carga: "",
      comprador: "",
      fecha: getToday(),
    });
    setModalOpen(true);
  };

  const openEditModal = (sale) => {
    setEditingSale(sale);

    const precioKiloGuardado = Number(
      sale.precio_unitario || sale.precio_kilo || 0
    );

    setForm({
      producto: sale.producto || "",
      cantidad: sale.cantidad || sale.kilos || "",
      precio_carga:
        sale.precio_carga || (precioKiloGuardado > 0 ? precioKiloGuardado * KG_PER_LOAD : ""),
      comprador: sale.comprador || "",
      fecha: sale.fecha
        ? new Date(sale.fecha).toISOString().slice(0, 10)
        : getToday(),
    });

    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingSale(null);
    setForm({
      producto: "",
      cantidad: "",
      precio_carga: "",
      comprador: "",
      fecha: getToday(),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const cantidad = Number(form.cantidad || 0);
    const precioCargaDia = Number(form.precio_carga || 0);
    const precioKilo = precioCargaDia / KG_PER_LOAD;
    const totalVenta = cantidad * precioKilo;

    if (!form.producto || cantidad <= 0 || precioCargaDia <= 0 || !form.fecha) {
      alert("Producto, kilos vendidos, precio por carga y fecha son obligatorios");
      return;
    }

    const payload = {
      producto: form.producto,
      cantidad,
      kilos: cantidad,
      precio_carga: precioCargaDia,
      precio_unitario: precioKilo,
      precio_kilo: precioKilo,
      total_venta: totalVenta,
      fecha: form.fecha,
      comprador: form.comprador,
    };

    try {
      setSaving(true);

      if (editingSale) {
        await updateBusinessSale(business._id, editingSale._id, payload);
      } else {
        await createBusinessSale(business._id, payload);
      }

      closeModal();
      await loadSales();
      await onRefreshSummary?.();
    } catch (error) {
      alert(error.response?.data?.message || "No se pudo guardar la venta");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (sale) => {
    const confirmDelete = window.confirm(
      `¿Seguro que deseas eliminar la venta de ${sale.producto}?`
    );

    if (!confirmDelete) return;

    try {
      await deleteBusinessSale(business._id, sale._id);
      await loadSales();
      await onRefreshSummary?.();
    } catch (error) {
      alert(error.response?.data?.message || "No se pudo eliminar la venta");
    }
  };

  return (
    <section className="space-y-6">
      <SectionHeader
        icon={<ShoppingCart className="text-violet-600" size={24} />}
        title="Registro de ventas"
        description="Historial de ventas e ingresos del negocio."
        buttonText="Nueva venta"
        onClick={openCreateModal}
      />

      {loading ? (
        <LoadingCard text="Cargando ventas..." />
      ) : sales.length === 0 ? (
        <EmptyState
          icon={<ShoppingCart size={52} />}
          title="No hay ventas registradas"
          text="Agrega ventas para calcular ingresos y utilidad del negocio."
          buttonText="Nueva venta"
          onClick={openCreateModal}
        />
      ) : (
        <DataTable>
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <TableHeader>Producto</TableHeader>
              <TableHeader>Kilos vendidos</TableHeader>
              <TableHeader>Precio kilo</TableHeader>
              <TableHeader>Total</TableHeader>
              <TableHeader>Cliente</TableHeader>
              <TableHeader>Fecha</TableHeader>
              <TableHeader align="right">Acciones</TableHeader>
            </tr>
          </thead>

          <tbody>
            {sales.map((sale) => {
              const cantidad = Number(sale.cantidad || sale.kilos || 0);
              const precio = Number(sale.precio_unitario || sale.precio_kilo || 0);
              const total = Number(sale.total_venta || cantidad * precio);

              return (
                <tr
                  key={sale._id}
                  className="border-b border-slate-100 last:border-b-0"
                >
                  <TableCell strong>{sale.producto}</TableCell>
                  <TableCell>{cantidad}</TableCell>
                  <TableCell>{formatMoney(precio)}</TableCell>
                  <TableCell className="font-bold text-emerald-600">
                    {formatMoney(total)}
                  </TableCell>
                  <TableCell>{sale.comprador || "Sin cliente"}</TableCell>
                  <TableCell>{formatDate(sale.fecha)}</TableCell>

                  <td className="px-6 py-4">
                    <ActionButtons
                      onEdit={() => openEditModal(sale)}
                      onDelete={() => handleDelete(sale)}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </DataTable>
      )}

      {modalOpen && (
        <ModalShell
          title={editingSale ? "Editar venta" : "Nueva venta"}
          description="Registra ingresos de productos o servicios vendidos."
          onClose={closeModal}
          onSubmit={handleSubmit}
          saving={saving}
          submitText={editingSale ? "Guardar cambios" : "Guardar venta"}
        >
          <input
            value={form.producto}
            onChange={(e) =>
              setForm({
                ...form,
                producto: e.target.value,
              })
            }
            placeholder="Producto o servicio"
            className={fieldClass}
            required
          />

          <input
            type="number"
            min="0"
            value={form.cantidad}
            onChange={(e) =>
              setForm({
                ...form,
                cantidad: e.target.value,
              })
            }
            placeholder="Kilos vendidos. Ej: 250"
            className={fieldClass}
            required
          />

          <div>
            <input
              type="number"
              min="0"
              value={form.precio_carga}
              onChange={(e) =>
                setForm({
                  ...form,
                  precio_carga: e.target.value,
                })
              }
              placeholder="Precio por Carga del día"
              className={fieldClass}
              required
            />

            <p className={helperTextClass}>
              Precio por kilo calculado: {formatMoney(precioKiloCalculado)}
            </p>
          </div>

          <input
            value={form.comprador}
            onChange={(e) =>
              setForm({
                ...form,
                comprador: e.target.value,
              })
            }
            placeholder="Cliente o comprador"
            className={fieldClass}
          />

          <DateInput
            label="Fecha de venta"
            value={form.fecha}
            onChange={(e) =>
              setForm({
                ...form,
                fecha: e.target.value,
              })
            }
            required
          />

          <TotalPreview
            label="Total venta"
            value={totalVentaCalculado}
          />
        </ModalShell>
      )}
    </section>
  );
}

export default BusinessSales;
