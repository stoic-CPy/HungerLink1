import { Link } from "react-router-dom";
import { useDonations } from "../../context/DonationsContext";

export default function TotalDonations() {
  const { totalCount, completedCount, pendingCount } = useDonations();

  return (
    <>
      <div className="topbar">
        <div className="page-title">
          <h1>Total Donations</h1>
          <p>View your complete donation information</p>
        </div>
      </div>

      <div className="content-card total-donation-box">
        <div className="total-donation-icon">📊</div>

        <h2>Total Donations</h2>

        <p className="total-donation-description">
          View all food donations submitted from your donor account.
        </p>

        <div className="donation-summary">
          <div className="summary-card">
            <span>Total Donations</span>
            <strong>{totalCount}</strong>
          </div>

          <div className="summary-card">
            <span>Completed Donations</span>
            <strong>{completedCount}</strong>
          </div>

          <div className="summary-card">
            <span>Pending Donations</span>
            <strong>{pendingCount}</strong>
          </div>
        </div>

        <Link to="/donor/my-donations" className="view-donations-btn">
          View My Donations
        </Link>

        <br />
        <br />

        <Link to="/donor" className="back-btn">
          ← Back to Dashboard
        </Link>
      </div>
    </>
  );
}
