import { useEffect, useState } from "react";

import {
  getBusinesses,
  getBusinessSummary,
} from "../../api/financeApi";

import BusinessDetail from "./BusinessDetail";
import BusinessList from "./BusinessList";

import { emptyBusinessSummary } from "../../components/utils/businessConstants";

import {
  getBusinessBadge,
  getBusinessIcon,
} from "../../components/utils/businessVisuals";

export default function Businesses() {
  const [businesses, setBusinesses] = useState([]);
  const [summaries, setSummaries] = useState({});
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [selectedSummary, setSelectedSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadBusinesses = async () => {
    try {
      setLoading(true);
      const data = await getBusinesses();
      setBusinesses(data);
      const summaryEntries = await Promise.all(
        data.map(async (business) => {
          try {
            const response = await getBusinessSummary(business._id);
            return [business._id, response.resumen];
          } catch (error) {
            console.error("Error cargando resumen:", business.nombre, error);
            return [business._id, emptyBusinessSummary];
          }
        })
      );
      setSummaries(Object.fromEntries(summaryEntries));
    } catch (error) {
      console.error("Error cargando negocios:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBusinesses();
  }, []);

  const openBusiness = async (business) => {
    setSelectedBusiness(business);
    const cachedSummary = summaries[business._id];
    if (cachedSummary) {
      setSelectedSummary(cachedSummary);
      return;
    }
    try {
      const response = await getBusinessSummary(business._id);
      setSelectedSummary(response.resumen);
      setSummaries((prev) => ({ ...prev, [business._id]: response.resumen }));
    } catch (error) {
      console.error("Error cargando resumen del negocio:", error);
      setSelectedSummary(emptyBusinessSummary);
    }
  };

  const refreshSelectedSummary = async () => {
    if (!selectedBusiness?._id) return;
    const response = await getBusinessSummary(selectedBusiness._id);
    setSelectedSummary(response.resumen);
    setSummaries((prev) => ({ ...prev, [selectedBusiness._id]: response.resumen }));
  };

  if (selectedBusiness) {
    return (
      <BusinessDetail
        business={selectedBusiness}
        summary={selectedSummary}
        onBack={() => {
          setSelectedBusiness(null);
          setSelectedSummary(null);
          loadBusinesses();
        }}
        onRefreshSummary={refreshSelectedSummary}
        getBusinessIcon={getBusinessIcon}
        getBusinessBadge={getBusinessBadge}
      />
    );
  }

  return (
    <BusinessList
      businesses={businesses}
      summaries={summaries}
      loading={loading}
      onOpenBusiness={openBusiness}
      onReload={loadBusinesses}
      getBusinessIcon={getBusinessIcon}
      getBusinessBadge={getBusinessBadge}
    />
  );
}
