import { Routes, Route } from "react-router-dom";
import { DonationsProvider } from "../../context/DonationsContext";
import DonorLayout from "../../components/donor/DonorLayout";
import Dashboard from "./Dashboard";
import AddFood from "./AddFood";
import MyDonations from "./MyDonations";
import TotalDonations from "./TotalDonations";
import Profile from "./Profile";
import Settings from "./Settings";
import HelpSupport from "./HelpSupport";
import Logout from "./Logout";

export default function DonorApp() {
  return (
    <DonationsProvider>
      <DonorLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/add-food" element={<AddFood />} />
          <Route path="/my-donations" element={<MyDonations />} />
          <Route path="/total-donations" element={<TotalDonations />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/help" element={<HelpSupport />} />
          <Route path="/logout" element={<Logout />} />
        </Routes>
      </DonorLayout>
    </DonationsProvider>
  );
}
