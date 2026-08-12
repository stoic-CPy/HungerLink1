import { Routes, Route } from "react-router-dom";
import Welcome from "./pages/auth/Welcome";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import DonorApp from "./pages/donor/DonorApp";
import NgoApp from "./pages/ngo/NgoApp";
import NgoAdminProfile from "./pages/ngo/NgoAdminProfile";
import ProtectedRoute from "./components/common/ProtectedRoute";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Welcome />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/donor/*"
        element={
          <ProtectedRoute role="donor">
            <DonorApp />
          </ProtectedRoute>
        }
      />

      <Route
        path="/ngo/*"
        element={
          <ProtectedRoute role="ngo">
            <NgoApp />
          </ProtectedRoute>
        }
      />

      <Route
        path="/ngo-admin-profile"
        element={
          <ProtectedRoute role="ngo">
            <NgoAdminProfile />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Welcome />} />
    </Routes>
  );
}
