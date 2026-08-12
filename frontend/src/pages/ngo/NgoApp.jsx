import { Routes, Route } from "react-router-dom";
import NgoDashboard from "./NgoDashboard";

export default function NgoApp() {
  return (
    <Routes>
      <Route path="/" element={<NgoDashboard />} />
    </Routes>
  );
}
