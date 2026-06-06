export const formatMoney = (value) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value || 0);

export const formatDate = (date) => {
  if (!date) return "Sin fecha";

  return new Date(date).toLocaleDateString("es-CO", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

export const getToday = () => new Date().toISOString().slice(0, 10);
