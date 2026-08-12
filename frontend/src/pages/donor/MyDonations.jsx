import { useState } from "react";
import { Link } from "react-router-dom";
import { useDonations } from "../../context/DonationsContext";

function formatDate(value) {
  if (!value) return value;
  const date = new Date(value);
  if (isNaN(date.getTime())) return value;
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function MyDonations() {
  const { donations, loading, error, removeDonation } = useDonations();
  const [selectedId, setSelectedId] = useState(null);
  const [removeError, setRemoveError] = useState("");

  const toggleRow = (id) => {
    setSelectedId((prev) => (prev === id ? null : id));
  };

  const handleRemove = async (event, id) => {
    event.stopPropagation();
    setRemoveError("");

    const confirmed = window.confirm("Remove this donation?");
    if (!confirmed) return;

    try {
      await removeDonation(id);
      setSelectedId(null);
    } catch (err) {
      setRemoveError(err.message);
    }
  };

  return (
    <>
      <div className="topbar">
        <div className="page-title">
          <h1>My Donations</h1>
          <p>View your submitted food donations</p>
        </div>
      </div>

      <div className="content-card">
        <div className="section-header">
          <div>
            <h2>My Donation Records</h2>
            <p>Your submitted food donations. Click a donation to remove it.</p>
          </div>

          <Link to="/donor" className="back-btn">
            ← Dashboard
          </Link>
        </div>

        {error && <div className="error">{error}</div>}
        {removeError && <div className="error">{removeError}</div>}

        {loading ? (
          <p>Loading donations...</p>
        ) : donations.length === 0 ? (
          <p>You haven&apos;t added any donations yet.</p>
        ) : (
          <div className="table-wrapper">
            <table className="donation-table">
              <thead>
                <tr>
                  <th>Restaurant / Hotel Name</th>
                  <th>Food Name</th>
                  <th>Quantity</th>
                  <th>Donation Date &amp; Time</th>
                  <th>Pickup Address</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {donations.map((donation) => {
                  const isSelected = selectedId === donation.id;
                  return (
                    <tr
                      key={donation.id}
                      onClick={() => toggleRow(donation.id)}
                      className={isSelected ? "row-selected" : ""}
                    >
                      <td>{donation.restaurantName}</td>
                      <td>{donation.foodName}</td>
                      <td>{donation.quantity}</td>
                      <td>{formatDate(donation.donationDate)}</td>
                      <td>{donation.pickupAddress}</td>
                      <td>
                        <span className={`status ${donation.status.toLowerCase()}`}>
                          {donation.status}
                        </span>
                      </td>
                      <td>
                        {isSelected ? (
                          <button
                            type="button"
                            className="remove-donation-btn"
                            onClick={(event) => handleRemove(event, donation.id)}
                          >
                            Remove
                          </button>
                        ) : (
                          <span className="row-hint">Click to remove</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
