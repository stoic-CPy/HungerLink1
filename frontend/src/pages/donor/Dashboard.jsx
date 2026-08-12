import { Link } from "react-router-dom";

export default function Dashboard() {
  return (
    <>
      <div className="topbar">
        <div className="page-title">
          <h1>Donor Dashboard</h1>
          <p>Welcome back, Donor Admin</p>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <div className="card-icon">📊</div>
          <h3>Total Donations</h3>
          <p>View your complete donation information and records.</p>
          <Link to="/donor/total-donations" className="dashboard-btn">
            Total Donations
          </Link>
        </div>

        <div className="dashboard-card">
          <div className="card-icon">🍱</div>
          <h3>Add Food</h3>
          <p>Add a new food donation with pickup information.</p>
          <Link to="/donor/add-food" className="dashboard-btn">
            Add Food
          </Link>
        </div>

        <div className="dashboard-card">
          <div className="card-icon">❤️</div>
          <h3>My Donations</h3>
          <p>View all food donations submitted by you.</p>
          <Link to="/donor/my-donations" className="dashboard-btn">
            My Donations
          </Link>
        </div>
      </div>
    </>
  );
}
