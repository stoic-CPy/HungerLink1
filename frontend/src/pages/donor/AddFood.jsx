import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDonations } from "../../context/DonationsContext";

const initialForm = {
  restaurantName: "",
  foodName: "",
  quantity: "",
  donationDate: "",
  pickupAddress: "",
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

    const { restaurantName, foodName, quantity, donationDate, pickupAddress } = form;

    if (
      restaurantName.trim() === "" ||
      foodName.trim() === "" ||
      quantity.trim() === "" ||
      donationDate === "" ||
      pickupAddress.trim() === ""
    ) {
      setError("Please fill all donation details.");
      return;
    }

    setSubmitting(true);
    try {
      await addDonation(form);
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
            <label htmlFor="restaurantName">Restaurant / Hotel Name</label>
            <input
              type="text"
              id="restaurantName"
              placeholder="Enter restaurant / hotel name"
              value={form.restaurantName}
              onChange={handleChange}
              required
            />
          </div>

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

          <div className="form-group">
            <label htmlFor="pickupAddress">Pickup Address</label>
            <textarea
              id="pickupAddress"
              placeholder="Enter complete pickup address"
              value={form.pickupAddress}
              onChange={handleChange}
              required
            />
          </div>

          {error && <div className="error">{error}</div>}

          <button type="submit" className="submit-btn" disabled={submitting}>
            {submitting ? "Submitting..." : "Submit Donation"}
          </button>
        </form>
      </div>
    </>
  );
}
