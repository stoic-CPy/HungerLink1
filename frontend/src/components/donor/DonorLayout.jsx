import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../../styles/donorDashboard.css";

function navClass({ isActive }) {
  return `nav-btn${isActive ? " active" : ""}`;
}

function logoutNavClass({ isActive }) {
  return `nav-btn logout-btn${isActive ? " active" : ""}`;
}

export default function DonorLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useAuth();

  const toggleSidebar = () => setCollapsed((prev) => !prev);

  const closeSidebarOnOutsideClick = () => {
    if (!collapsed) setCollapsed(true);
  };

  return (
    <>
      <header className="brand-header">
        <div className="brand-header-left">
          <button
            type="button"
            className="sidebar-toggle-btn"
            aria-label="Toggle sidebar"
            aria-expanded={!collapsed}
            onClick={toggleSidebar}
          >
            <span />
            <span />
            <span />
          </button>

          <div className="brand">
            <span className="hunger">Hunger</span>
            <span className="link">Link</span>
          </div>
        </div>

        <NavLink to="/donor/profile" className="header-profile">
          <span>{user?.email || "Donor Admin"}</span>
          <div className="header-avatar">DA</div>
        </NavLink>
      </header>

      <aside className={`sidebar${collapsed ? " collapsed" : ""}`}>
        <div className="system-label">DONOR PANEL</div>

        <NavLink to="/donor" end className={navClass}>
          Dashboard
        </NavLink>

        <NavLink to="/donor/settings" className={navClass}>
          Settings
        </NavLink>

        <NavLink to="/donor/help" className={navClass}>
          Help &amp; Support
        </NavLink>

        <NavLink to="/donor/logout" className={logoutNavClass}>
          Logout
        </NavLink>
      </aside>

      <main
        className={`main${collapsed ? " sidebar-collapsed" : ""}`}
        onClick={closeSidebarOnOutsideClick}
      >
        {children}
      </main>
    </>
  );
}
