import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../../styles/auth.css";

const LOGO_SRC = "/hungerlink-logo.png"; // TODO: point this at your actual logo asset path

// Free, public India Post pincode lookup - no API key needed.
const PINCODE_LOOKUP_URL = "https://api.postalpincode.in/pincode/";

const initialForm = {
  restaurantName: "",
  ownerName: "",
  registerEmail: "",
  registerPassword: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
};

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [accountType, setAccountType] = useState("");
  const [typeError, setTypeError] = useState("");
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  // "idle" | "loading" | "success" | "error"
  const [pincodeStatus, setPincodeStatus] = useState("idle");

  const selectRegisterType = (type) => {
    setAccountType(type);
    setTypeError("");
  };

  const handleChange = (event) => {
    const { id, value } = event.target;
    setForm((prev) => ({ ...prev, [id]: value }));
  };

  // Auto-fill City / State as soon as a valid 6-digit pincode is entered.
  useEffect(() => {
    const pincode = form.pincode;

    if (!/^[0-9]{6}$/.test(pincode)) {
      setPincodeStatus("idle");
      return;
    }

    const controller = new AbortController();

    const timer = setTimeout(async () => {
      setPincodeStatus("loading");

      try {
        const response = await fetch(`${PINCODE_LOOKUP_URL}${pincode}`, {
          signal: controller.signal,
        });
        const data = await response.json();
        const result = data && data[0];
        const postOffice = result?.PostOffice?.[0];

        if (result?.Status === "Success" && postOffice) {
          setForm((prev) => ({
            ...prev,
            city: postOffice.District,
            state: postOffice.State,
          }));
          setPincodeStatus("success");
        } else {
          setPincodeStatus("error");
        }
      } catch (err) {
        if (err.name !== "AbortError") {
          setPincodeStatus("error");
        }
      }
    }, 500);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [form.pincode]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");

    if (accountType === "") {
      setTypeError("Please select DONOR or NGO.");
      return;
    }

    setSubmitting(true);
    try {
      const user = await register({ accountType, ...form });
      setMessage("Account created successfully as " + accountType + ".");
      navigate(user.role === "donor" ? "/donor" : "/ngo", { replace: true });
    } catch (err) {
      setMessage(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="form-page register-page">
      <div className="form-card register-card">
        <img src={LOGO_SRC} alt="Hungerlink Logo" className="form-logo" />

        <h1>Create Account</h1>
        <p className="form-subtitle">Join Hungerlink</p>

        <form onSubmit={handleSubmit}>
          <label>
            Account Type <span className="required">*</span>
          </label>

          <div className="account-row">
            <button
              type="button"
              className={`account-button${accountType === "Donor" ? " selected" : ""}`}
              onClick={() => selectRegisterType("Donor")}
            >
              DONOR
            </button>

            <button
              type="button"
              className={`account-button${accountType === "NGO" ? " selected" : ""}`}
              onClick={() => selectRegisterType("NGO")}
            >
              NGO
            </button>
          </div>

          <div className="error">{typeError}</div>

          <label htmlFor="restaurantName">
            {accountType === "NGO" ? "Organization Name" : "Restaurant / Organization Name"}
          </label>
          <input
            type="text"
            id="restaurantName"
            placeholder="Enter restaurant / organization name"
            value={form.restaurantName}
            onChange={handleChange}
            required
          />

          <label htmlFor="ownerName">Owner Name</label>
          <input
            type="text"
            id="ownerName"
            placeholder="Enter owner name"
            value={form.ownerName}
            onChange={handleChange}
            required
          />

          <label htmlFor="registerEmail">Email Address</label>
          <input
            type="email"
            id="registerEmail"
            placeholder="Enter your email"
            value={form.registerEmail}
            onChange={handleChange}
            required
          />

          <label htmlFor="registerPassword">Password</label>
          <input
            type="password"
            id="registerPassword"
            placeholder="Create password"
            value={form.registerPassword}
            onChange={handleChange}
            minLength={6}
            required
          />

          <label htmlFor="phone">Phone Number</label>
          <input
            type="tel"
            id="phone"
            placeholder="Enter phone number"
            maxLength={10}
            pattern="[0-9]{10}"
            inputMode="numeric"
            value={form.phone}
            onChange={handleChange}
            required
          />

          <label htmlFor="address">Address</label>
          <input
            type="text"
            id="address"
            placeholder="Enter address"
            value={form.address}
            onChange={handleChange}
            required
          />

          <label htmlFor="city">City</label>
          <input
            type="text"
            id="city"
            placeholder="Enter city (auto-filled from pincode)"
            value={form.city}
            onChange={handleChange}
            required
          />

          <label htmlFor="state">State</label>
          <input
            type="text"
            id="state"
            placeholder="Enter state (auto-filled from pincode)"
            value={form.state}
            onChange={handleChange}
            required
          />

          <label htmlFor="pincode">Pincode</label>
          <input
            type="text"
            id="pincode"
            placeholder="Enter pincode"
            maxLength={6}
            pattern="[0-9]{6}"
            inputMode="numeric"
            value={form.pincode}
            onChange={handleChange}
            required
          />
          {pincodeStatus === "loading" && (
            <div className="pincode-status">Fetching city / state...</div>
          )}
          {pincodeStatus === "error" && (
            <div className="pincode-status pincode-status-error">
              Couldn&apos;t find that pincode. Please enter city / state manually.
            </div>
          )}
          {pincodeStatus === "success" && (
            <div className="pincode-status">City / state filled automatically.</div>
          )}

          <button type="submit" className="main-button" disabled={submitting}>
            {submitting ? "Creating account..." : "Create Account"}
          </button>

          <div className="message">{message}</div>
        </form>

        <div className="bottom-link">
          Already have an account? <Link to="/login">Login</Link>
        </div>
      </div>
    </main>
  );
}
