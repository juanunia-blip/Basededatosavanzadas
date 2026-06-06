import { Building2, Scissors, Store, Trees } from "lucide-react";

export const getBusinessIcon = (type) => {
  switch (type) {
    case "finca":
      return Trees;
    case "barberia":
      return Scissors;
    case "tienda":
      return Store;
    default:
      return Building2;
  }
};

export const getBusinessBadge = (type) => {
  switch (type) {
    case "finca":
      return "bg-violet-50 text-violet-700";
    case "barberia":
      return "bg-blue-50 text-blue-700";
    case "tienda":
      return "bg-cyan-50 text-cyan-700";
    case "restaurante":
      return "bg-indigo-50 text-indigo-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
};
