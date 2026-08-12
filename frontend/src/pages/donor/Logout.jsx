import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Logout() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    const confirmed = window.confirm("Are you sure you want to logout?");
    if (!confirmed) return;

    logout();
    navigate("/login", { replace: true });
  };

  return (
    <>
      <div className="topbar">
        <div className="page-title">
          <h1>Logout</h1>
          <p>Sign out from your donor account</p>
        </div>
      </div>

      <div className="logout-box">
        <div className="logout-icon">↪</div>
        <h2>Are you sure?</h2>
        <p>You are about to logout from your donor account.</p>

        <button type="button" className="logout-confirm" onClick={handleLogout}>
          Confirm Logout
        </button>
      </div>
    </>
  );
}
