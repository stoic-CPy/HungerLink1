import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api } from "../api/client";

const DonationsContext = createContext(null);

// The API returns DB column names (snake_case); the existing UI components
// were built around camelCase donation objects. Normalize at the boundary
// so nothing downstream has to change.
function normalize(row) {
  return {
    id: row.id,
    restaurantName: row.restaurant_name,
    foodName: row.food_name,
    quantity: row.quantity,
    donationDate: row.donation_date,
    pickupAddress: row.pickup_address,
    status: row.status,
  };
}

export function DonationsProvider({ children }) {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api.get("/donor/donations");
      setDonations(data.donations.map(normalize));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addDonation = useCallback(async (donationInput) => {
    const data = await api.post("/donor/donations", donationInput);
    const donation = normalize(data.donation);
    setDonations((prev) => [donation, ...prev]);
    return donation;
  }, []);

  const removeDonation = useCallback(async (id) => {
    await api.del(`/donor/donations/${id}`);
    setDonations((prev) => prev.filter((donation) => donation.id !== id));
  }, []);

  const totalCount = donations.length;
  const pendingCount = donations.filter((d) => d.status === "Pending").length;
  const completedCount = donations.filter((d) => d.status === "Completed").length;

  const value = {
    donations,
    loading,
    error,
    refresh,
    addDonation,
    removeDonation,
    totalCount,
    pendingCount,
    completedCount,
  };

  return <DonationsContext.Provider value={value}>{children}</DonationsContext.Provider>;
}

export function useDonations() {
  const ctx = useContext(DonationsContext);
  if (!ctx) {
    throw new Error("useDonations must be used within a <DonationsProvider>");
  }
  return ctx;
}
