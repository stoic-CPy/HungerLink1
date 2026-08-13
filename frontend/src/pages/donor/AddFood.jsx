import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDonations } from "../../context/DonationsContext";

const initialForm = {
  foodName: "",
  quantity: "",
  donationDate: "",
};
export default function AddFood() {
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const { addDonation } = useDonations();
  const navigate = useNavigate();

  const handleChange = (event) => {
    const { id, value } = event.target;
    setForm((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

const { foodName, quantity, donationDate } = form;

    if (foodName.trim() === "" || quantity.trim() === "" || donationDate === "") {
      setError("Please fill all donation details.");
      return;
    }

    setSubmitting(true);
    try {
      const donationDateISO = new Date(`${donationDate}:00+05:30`).toISOString();
      await addDonation({ ...form, donationDate: donationDateISO });
      setForm(initialForm);
      navigate("/donor/my-donations");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="topbar">
        <div className="page-title">
          <h1>Add Food</h1>
          <p>Create a new food donation</p>
        </div>
      </div>

      <div className="content-card">
        <div className="section-header">
          <div>
            <h2>Food Donation Details</h2>
            <p>Enter complete donation information.</p>
          </div>

          <Link to="/donor" className="back-btn">
            ← Dashboard
          </Link>
        </div>

        <form onSubmit={handleSubmit}>
        <div className="form-group">
            <label htmlFor="foodName">Food Name</label>
            <input
              type="text"
              id="foodName"
              placeholder="Enter food name"
              value={form.foodName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="quantity">Quantity</label>
            <input
              type="text"
              id="quantity"
              placeholder="Example: 50 plates"
              value={form.quantity}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="donationDate">Donation Date &amp; Time</label>
            <input
              type="datetime-local"
              id="donationDate"
              value={form.donationDate}
              onChange={handleChange}
              required
            />
          </div>

        <p className="form-hint">
            Restaurant name and pickup address will be taken automatically from your saved profile.
          </p>

          {error && <div className="error">{error}</div>}

          <button type="submit" className="submit-btn" disabled={submitting}>
            {submitting ? "Submitting..." : "Submit Donation"}
          </button>
        </form>
      </div>
    </>
  );
}
