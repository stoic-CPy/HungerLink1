import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../api/client";
import "../../styles/ngoDashboard.css";

function normalize(row) {
  return {
    id: row.id,
    restaurant: row.restaurant_name,
    food: row.food_name,
    qty: row.quantity,
    address: row.pickup_address,
    date: row.donation_date,
    status: row.status,
    acceptedByMe: false, // filled in by caller
  };
}

function formatDate(value) {
  const date = new Date(value);
  if (isNaN(date.getTime())) return value;
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function Brand() {
  return (
    <div className="brand">
      <span className="hunger">Hunger</span>
      <span className="link">Link</span>
    </div>
  );
}

function Header({ onProfileClick }) {
  return (
    <header className="brand-header">
      <Brand />
      <button className="header-profile" title="Open NGO Admin Profile" onClick={onProfileClick}>
        <span>NGO Admin</span>
        <div className="header-avatar">NA</div>
      </button>
    </header>
  );
}

function Sidebar({ collapsed, activePage, onHelp, onSettings, onLogout, onToggle }) {
  const handleSidebarClick = (event) => {
    if (event.target.closest?.("button")) {
      return;
    }
    onToggle();
  };

  return (
    <aside className={`sidebar${collapsed ? " collapsed" : ""}`} onClick={handleSidebarClick}>
      <div className="system-label">SYSTEM</div>

      <button className="nav-btn" onClick={onSettings}>
        <span className="nav-icon">■■</span>
        <span className="nav-text">Settings</span>
      </button>

      <button
        className={`nav-btn${activePage === "help" ? " active" : ""}`}
        onClick={onHelp}
      >
        <span className="nav-icon">■</span>
        <span className="nav-text">Help &amp; Support</span>
      </button>

      <button className="nav-btn" onClick={onLogout}>
        <span className="nav-icon">■</span>
        <span className="nav-text">Logout</span>
      </button>
    </aside>
  );
}

function DonationCard({ donation, onAccept, onComplete, busy }) {
  return (
    <div className="donation-card">
      <div className="restaurant-name">■ {donation.restaurant}</div>

      <div className="donation-info">
        <div className="info-box">
          <div className="info-label">Food Name</div>
          <div className="info-value">{donation.food}</div>
        </div>

        <div className="info-box">
          <div className="info-label">Qty</div>
          <div className="info-value">{donation.qty}</div>
        </div>

        <div className="info-box">
          <div className="info-label">Address</div>
          <div className="info-value">{donation.address}</div>
        </div>

        <div className="info-box">
          <div className="info-label">Date</div>
          <div className="info-value">{formatDate(donation.date)}</div>
        </div>

        <div className="info-box">
          <div className="info-label">Status</div>
          <div className="info-value">
            <span
              className={`status ${
                donation.status.toLowerCase() === "accepted" ||
                donation.status.toLowerCase() === "completed"
                  ? "accepted"
                  : "pending"
              }`}
            >
              {donation.status}
            </span>
          </div>
        </div>
      </div>

      {donation.status === "Pending" && (
        <button className="accept-btn" onClick={() => onAccept(donation.id)} disabled={busy}>
          {busy ? "Accepting..." : "Accept Donation"}
        </button>
      )}

      {donation.status === "Accepted" && donation.acceptedByMe && (
        <button className="accept-btn" onClick={() => onComplete(donation.id)} disabled={busy}>
          {busy ? "Updating..." : "Mark as Collected"}
        </button>
      )}
    </div>
  );
}

function DashboardPage({ donations, loading, error, onAccept, onComplete, busyId }) {
  return (
    <section className="page show">
      <div className="topbar">
        <div className="page-title">
          <h1>Dashboard</h1>
          <p>Manage food donations from donor restaurants</p>
        </div>
      </div>

      {error && <p className="donation-error">{error}</p>}
      {loading && <p>Loading donations...</p>}
      {!loading && donations.length === 0 && <p>No donations available right now.</p>}

      {donations.map((donation) => (
        <DonationCard
          key={donation.id}
          donation={donation}
          onAccept={onAccept}
          onComplete={onComplete}
          busy={busyId === donation.id}
        />
      ))}
    </section>
  );
}

function HelpPage({ onBack, onAiChat, onTeamChat }) {
  return (
    <section className="page show">
      <div className="help-wrapper">
        <button className="back-dashboard" onClick={onBack}>
          ← Back to Dashboard
        </button>

        <h1 className="help-title">Help &amp; Support</h1>
        <p className="help-subtitle">How can we help you today?</p>

        <div className="support-card ai" onClick={onAiChat}>
          <div className="support-icon ai-icon">AI</div>
          <div>
            <h2>Chat with AI</h2>
            <p>Get instant help from our AI assistant.</p>
          </div>
        </div>

        <div className="support-card team" onClick={onTeamChat}>
          <div className="support-icon team-icon">T</div>
          <div>
            <h2>Chat with Team</h2>
            <p>Talk directly with the HungerLink support team.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function NgoDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activePage, setActivePage] = useState("dashboard");
  const [toast, setToast] = useState({ visible: false, message: "" });
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);

  const showToast = useCallback((message) => {
    setToast({ visible: true, message });
  }, []);

  const loadDonations = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api.get("/ngo/donations");
      setDonations(
        data.donations.map((row) => ({
          ...normalize(row),
          acceptedByMe: row.accepted_by_ngo_id === user?.id,
        }))
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadDonations();
  }, [loadDonations]);

  useEffect(() => {
    if (!toast.visible) return undefined;
    const timer = window.setTimeout(() => setToast({ visible: false, message: "" }), 2200);
    return () => window.clearTimeout(timer);
  }, [toast.visible]);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") setActivePage("dashboard");
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  const handleAccept = async (id) => {
    setBusyId(id);
    try {
      await api.post(`/ngo/donations/${id}/accept`, {});
      showToast("Donation accepted");
      await loadDonations();
    } catch (err) {
      showToast(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const handleComplete = async (id) => {
    setBusyId(id);
    try {
      await api.post(`/ngo/donations/${id}/complete`, {});
      showToast("Marked as collected");
      await loadDonations();
    } catch (err) {
      showToast(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const handleProfile = () => {
    navigate("/ngo-admin-profile");
  };

  const handleLogout = () => {
    const answer = window.confirm("Are you sure you want to logout?");
    if (answer) {
      logout();
      navigate("/login", { replace: true });
    }
  };

  return (
    <>
      <Header onProfileClick={handleProfile} />

      <Sidebar
        collapsed={sidebarCollapsed}
        activePage={activePage}
        onHelp={() => setActivePage("help")}
        onSettings={() => showToast("Settings selected")}
        onLogout={handleLogout}
        onToggle={() => setSidebarCollapsed((value) => !value)}
      />

      <main className={`main${sidebarCollapsed ? " expanded" : ""}`}>
        {activePage === "dashboard" ? (
          <DashboardPage
            donations={donations}
            loading={loading}
            error={error}
            onAccept={handleAccept}
            onComplete={handleComplete}
            busyId={busyId}
          />
        ) : (
          <HelpPage
            onBack={() => setActivePage("dashboard")}
            onAiChat={() => showToast("Chat with AI selected")}
            onTeamChat={() => showToast("Chat with Team selected")}
          />
        )}
      </main>

      <div className={`toast${toast.visible ? " show" : ""}`}>{toast.message}</div>
    </>
  );
}
