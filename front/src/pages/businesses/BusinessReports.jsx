import { useEffect, useState } from "react";
import { FileText } from "lucide-react";
import { getBusinessReports } from "../../api/financeApi";
import EmptyState from "../../components/EmptyState";
import LoadingCard from "../../components/LoadingCard";
import { TableCell, TableHeader } from "../../components/DataTable";
import ExportButton from "../../components/reports/ExportButton";
import ReportLine from "../../components/reports/ReportLine";
import ReportListCard from "../../components/reports/ReportListCard";
import ReportMonthlyChart from "../../components/reports/ReportMonthlyChart";
import { formatMoney } from "../../components/utils/businessFormatters";
import { downloadCSV, sanitizeFileName } from "../../components/utils/csvExport";

function BusinessReports({ business }) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadReport = async () => {
    try {
      setLoading(true);
      const response = await getBusinessReports(business._id);
      setReport(response.reporte || null);
    } catch (error) {
      console.error("Error cargando reportes:", error);
      alert(error.response?.data?.message || "No se pudo cargar el reporte");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, [business._id]);

  const resumen = report?.resumen || {};
  const ventasPorProducto = report?.ventasPorProducto || [];
  const gastosPorTipo = report?.gastosPorTipo || [];
  const detalleMensual = report?.detalleMensual || [];
  const ultimosMovimientos = report?.ultimosMovimientos || {};
  const fileBaseName = sanitizeFileName(business.nombre);

  const exportResumenGeneral = () => {
    downloadCSV(`resumen_general_${fileBaseName}.csv`, [
      {
        ventas_totales: resumen.totalVentas || 0,
        gastos_operativos: resumen.totalGastosOperativos || 0,
        gastos_trabajadores: resumen.totalGastosTrabajadores || 0,
        gastos_totales: resumen.totalGastos || 0,
        utilidad_neta: resumen.utilidadNeta || 0,
        kilos_vendidos: resumen.totalKilosVendidos || 0,
        kilos_producidos: resumen.totalKilosProducidos || 0,
        kilos_sin_liquidar: resumen.totalKilosSinLiquidar || 0,
        pago_sin_liquidar: resumen.totalPagoSinLiquidar || 0,
        total_liquidado: resumen.totalLiquidado || 0,
        total_abonado: resumen.totalAbonado || 0,
        pendiente_trabajadores: resumen.totalPendienteTrabajadores || 0,
        trabajadores_activos: resumen.trabajadoresActivos || 0,
        total_trabajadores: resumen.totalTrabajadores || 0,
        liquidaciones_pagadas: resumen.liquidaciones?.pagadas || 0,
        liquidaciones_abonadas: resumen.liquidaciones?.abonadas || 0,
        liquidaciones_pendientes: resumen.liquidaciones?.pendientes || 0,
      },
    ]);
  };

  const exportDetalleMensual = () => {
    downloadCSV(
      `reporte_mensual_${fileBaseName}.csv`,
      detalleMensual.map((item) => ({
        periodo: item.periodo,
        ventas: item.ventas || 0,
        gastos_operativos: item.gastosOperativos || 0,
        gastos_trabajadores: item.gastosTrabajadores || 0,
        gastos_totales: item.gastosTotales || 0,
        utilidad_neta: item.utilidadNeta || 0,
        kilos_vendidos: item.kilosVendidos || 0,
        kilos_producidos: item.kilosProducidos || 0,
        producciones: item.producciones || 0,
        liquidaciones: item.liquidaciones || 0,
      }))
    );
  };

  const exportVentasPorProducto = () => {
    downloadCSV(
      `ventas_por_producto_${fileBaseName}.csv`,
      ventasPorProducto.map((item) => ({
        producto: item.producto,
        kilos: item.kilos || 0,
        ventas: item.ventas || 0,
        total: item.total || 0,
      }))
    );
  };

  const exportGastosPorTipo = () => {
    downloadCSV(
      `gastos_por_tipo_${fileBaseName}.csv`,
      gastosPorTipo.map((item) => ({
        tipo: item.tipo,
        total: item.total || 0,
        registros: item.registros || 0,
        calculado: item.calculado ? "sí" : "no",
      }))
    );
  };

  const exportMovimientosRecientes = () => {
    const ventas = (ultimosMovimientos.ventas || []).map((item) => ({
      tipo_movimiento: "venta",
      descripcion: item.producto || "",
      monto: item.total_venta || 0,
      fecha: item.fecha || "",
      detalle: item.comprador || "",
    }));

    const gastos = (ultimosMovimientos.gastos || []).map((item) => ({
      tipo_movimiento: "gasto",
      descripcion: item.descripcion || "",
      monto: item.monto || 0,
      fecha: item.fecha || "",
      detalle: item.tipo || "",
    }));

    const liquidaciones = (ultimosMovimientos.liquidaciones || []).map(
      (item) => ({
        tipo_movimiento: "liquidacion",
        descripcion: item.trabajador_nombre || "",
        monto: item.total_pago || 0,
        fecha: item.fecha_fin || item.fecha_inicio || "",
        detalle: item.estado || "",
      })
    );

    const producciones = (ultimosMovimientos.producciones || []).map(
      (item) => ({
        tipo_movimiento: "produccion",
        descripcion: item.trabajador_nombre || "",
        monto: item.total_pago || 0,
        fecha: item.fecha || "",
        detalle: `${Number(item.kilos || 0)} kg`,
      })
    );

    downloadCSV(`movimientos_recientes_${fileBaseName}.csv`, [
      ...ventas,
      ...gastos,
      ...liquidaciones,
      ...producciones,
    ]);
  };

  if (loading) {
    return <LoadingCard text="Generando reportes del negocio..." />;
  }

  if (!report) {
    return (
      <EmptyState
        icon={<FileText size={52} />}
        title="No se pudo cargar el reporte"
        text="Revisa que el backend tenga activa la ruta de reportes."
        buttonText="Reintentar"
        onClick={loadReport}
      />
    );
  }

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-2xl font-bold text-slate-950">
              <FileText className="text-violet-600" size={24} />
              Reportes del negocio
            </h2>

            <p className="mt-1 text-slate-500">
              Analiza el comportamiento mensual, ventas por producto, gastos por tipo y liquidaciones.
            </p>
          </div>

          <button
            onClick={loadReport}
            className="flex items-center justify-center gap-2 rounded-2xl bg-violet-600 px-5 py-3 font-semibold text-white shadow-lg shadow-violet-500/20 hover:bg-violet-700"
          >
            <FileText size={18} />
            Actualizar reporte
          </button>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <ExportButton
            label="Resumen CSV"
            onClick={exportResumenGeneral}
            className="border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
          />

          <ExportButton
            label="Mensual CSV"
            onClick={exportDetalleMensual}
            className="border-blue-100 bg-blue-50 text-blue-700 hover:bg-blue-100"
          />

          <ExportButton
            label="Ventas CSV"
            onClick={exportVentasPorProducto}
            className="border-emerald-100 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
          />

          <ExportButton
            label="Gastos CSV"
            onClick={exportGastosPorTipo}
            className="border-red-100 bg-red-50 text-red-700 hover:bg-red-100"
          />

          <ExportButton
            label="Movimientos CSV"
            onClick={exportMovimientosRecientes}
            className="border-violet-100 bg-violet-50 text-violet-700 hover:bg-violet-100"
          />
        </div>
      </div>

      <ReportMonthlyChart items={detalleMensual} />

      <section className="grid gap-6 xl:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">
          <div className="mb-5">
            <h3 className="text-xl font-bold text-slate-950">
              Detalle mensual
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Ventas, gastos y utilidad por mes.
            </p>
          </div>

          {detalleMensual.length === 0 ? (
            <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">
              Aún no hay movimientos suficientes para mostrar detalle mensual.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <TableHeader>Mes</TableHeader>
                    <TableHeader>Ventas</TableHeader>
                    <TableHeader>Gastos operativos</TableHeader>
                    <TableHeader>Trabajadores</TableHeader>
                    <TableHeader>Utilidad</TableHeader>
                    <TableHeader>Kilos vendidos</TableHeader>
                    <TableHeader>Kilos producidos</TableHeader>
                  </tr>
                </thead>

                <tbody>
                  {detalleMensual.map((item) => (
                    <tr
                      key={item.periodo}
                      className="border-b border-slate-100 last:border-b-0"
                    >
                      <TableCell strong>{item.periodo}</TableCell>

                      <TableCell className="font-semibold text-emerald-600">
                        {formatMoney(item.ventas)}
                      </TableCell>

                      <TableCell className="font-semibold text-red-600">
                        {formatMoney(item.gastosOperativos)}
                      </TableCell>

                      <TableCell className="font-semibold text-amber-600">
                        {formatMoney(item.gastosTrabajadores)}
                      </TableCell>

                      <TableCell
                        className={`font-bold ${
                          Number(item.utilidadNeta || 0) >= 0
                            ? "text-emerald-600"
                            : "text-red-600"
                        }`}
                      >
                        {formatMoney(item.utilidadNeta)}
                      </TableCell>

                      <TableCell>{Number(item.kilosVendidos || 0)}</TableCell>
                      <TableCell>{Number(item.kilosProducidos || 0)}</TableCell>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-xl font-bold text-slate-950">
            Estado de liquidaciones
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Resumen de pagos a trabajadores.
          </p>

          <div className="mt-5 space-y-3">
            <ReportLine
              label="Total liquidaciones"
              value={Number(resumen.liquidaciones?.total || 0)}
            />
            <ReportLine
              label="Pagadas"
              value={Number(resumen.liquidaciones?.pagadas || 0)}
              valueClass="text-emerald-600"
            />
            <ReportLine
              label="Abonadas"
              value={Number(resumen.liquidaciones?.abonadas || 0)}
              valueClass="text-blue-600"
            />
            <ReportLine
              label="Pendientes"
              value={Number(resumen.liquidaciones?.pendientes || 0)}
              valueClass="text-orange-600"
            />
            <ReportLine
              label="Total liquidado"
              value={formatMoney(resumen.totalLiquidado)}
              valueClass="text-slate-900"
            />
            <ReportLine
              label="Total abonado"
              value={formatMoney(resumen.totalAbonado)}
              valueClass="text-blue-600"
            />
            <ReportLine
              label="Pendiente"
              value={formatMoney(resumen.totalPendienteTrabajadores)}
              valueClass="text-orange-600"
            />
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <ReportListCard
          title="Ventas por producto"
          description="Productos con más ingresos."
          emptyText="No hay ventas registradas."
          items={ventasPorProducto}
          renderItem={(item) => (
            <div
              key={item.producto}
              className="flex items-center justify-between gap-4 border-b border-slate-100 py-3 last:border-b-0"
            >
              <div>
                <p className="font-semibold text-slate-900">{item.producto}</p>
                <p className="text-sm text-slate-500">
                  {Number(item.kilos || 0)} kg · {Number(item.ventas || 0)} ventas
                </p>
              </div>

              <p className="font-bold text-emerald-600">
                {formatMoney(item.total)}
              </p>
            </div>
          )}
        />

        <ReportListCard
          title="Gastos por tipo"
          description="Incluye trabajadores como gasto calculado."
          emptyText="No hay gastos registrados."
          items={gastosPorTipo}
          renderItem={(item) => (
            <div
              key={item.tipo}
              className="flex items-center justify-between gap-4 border-b border-slate-100 py-3 last:border-b-0"
            >
              <div>
                <p className="font-semibold capitalize text-slate-900">
                  {item.tipo}
                </p>
                <p className="text-sm text-slate-500">
                  {Number(item.registros || 0)} registros
                  {item.calculado ? " · automático" : ""}
                </p>
              </div>

              <p className="font-bold text-red-600">
                {formatMoney(item.total)}
              </p>
            </div>
          )}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-xl font-bold text-slate-950">
            Producción pendiente
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Trabajo registrado que aún no ha sido liquidado.
          </p>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl bg-cyan-50 p-4">
              <p className="text-sm font-semibold text-cyan-700">
                Kilos sin liquidar
              </p>
              <p className="mt-2 text-2xl font-bold text-cyan-700">
                {Number(resumen.totalKilosSinLiquidar || 0)} kg
              </p>
            </div>

            <div className="rounded-2xl bg-violet-50 p-4">
              <p className="text-sm font-semibold text-violet-700">
                Pago sin liquidar
              </p>
              <p className="mt-2 text-2xl font-bold text-violet-700">
                {formatMoney(resumen.totalPagoSinLiquidar)}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-xl font-bold text-slate-950">
            Últimos movimientos
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Actividad reciente del negocio.
          </p>

          <div className="mt-5 space-y-3">
            <ReportLine
              label="Ventas recientes"
              value={Number(ultimosMovimientos.ventas?.length || 0)}
              valueClass="text-emerald-600"
            />
            <ReportLine
              label="Gastos recientes"
              value={Number(ultimosMovimientos.gastos?.length || 0)}
              valueClass="text-red-600"
            />
            <ReportLine
              label="Liquidaciones recientes"
              value={Number(ultimosMovimientos.liquidaciones?.length || 0)}
              valueClass="text-blue-600"
            />
            <ReportLine
              label="Producciones recientes"
              value={Number(ultimosMovimientos.producciones?.length || 0)}
              valueClass="text-cyan-600"
            />
          </div>
        </div>
      </section>
    </section>
  );
}

export default BusinessReports;
