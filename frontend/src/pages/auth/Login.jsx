import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../../styles/auth.css";

const LOGO_SRC =
  "https://uploads.onecompiler.io/44xrmsgax/1786305177486/ChatGPT%20Image%20Aug%2010,%202026,%2012_33_44%20AM.png";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [accountType, setAccountType] = useState("");
  const [typeError, setTypeError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const selectLoginType = (type) => {
    setAccountType(type);
    setTypeError("");
  };

  const toggleLoginPassword = () => {
    setShowPassword((prev) => !prev);
  };

  const handleForgotPassword = (event) => {
    event.preventDefault();
    setMessage("Password reset isn't available yet - please contact support@hungerlink.com.");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");

    if (accountType === "") {
      setTypeError("Please select DONOR or NGO.");
      return;
    }

    setSubmitting(true);
    try {
      const user = await login({ accountType, email, password });
      navigate(user.role === "donor" ? "/donor" : "/ngo", { replace: true });
    } catch (err) {
      setMessage(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="form-page">
      <div className="form-card">
        <img src={LOGO_SRC} alt="Hungerlink Logo" className="form-logo" />

        <h1>Login</h1>
        <p className="form-subtitle">Welcome back to Hungerlink</p>

        <form onSubmit={handleSubmit}>
          <label>
            Account Type <span className="required">*</span>
          </label>

          <div className="account-row">
            <button
              type="button"
              className={`account-button${accountType === "Donor" ? " selected" : ""}`}
              onClick={() => selectLoginType("Donor")}
            >
              DONOR
            </button>

            <button
              type="button"
              className={`account-button${accountType === "NGO" ? " selected" : ""}`}
              onClick={() => selectLoginType("NGO")}
            >
              NGO
            </button>
          </div>

          <div className="error">{typeError}</div>

          <label htmlFor="loginEmail">Email Address</label>
          <input
            type="email"
            id="loginEmail"
            placeholder="Enter your email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />

          <label htmlFor="loginPassword">Password</label>
          <div className="password-container">
            <input
              type={showPassword ? "text" : "password"}
              id="loginPassword"
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
            <button
              type="button"
              className="eye-button"
              onClick={toggleLoginPassword}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? "🙈" : "👁"}
            </button>
          </div>

          <a href="#" className="forgot-password" onClick={handleForgotPassword}>
            Forgot Password?
          </a>

          <button type="submit" className="main-button" disabled={submitting}>
            {submitting ? "Logging in..." : "Login"}
          </button>

          <div className="message">{message}</div>
        </form>

        <div className="bottom-link">
          Don&apos;t have an account? <Link to="/register">Register</Link>
        </div>
      </div>
    </main>
  );
}
