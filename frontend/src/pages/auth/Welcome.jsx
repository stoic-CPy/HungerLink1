import { useNavigate } from "react-router-dom";
import "../../styles/auth.css";

const LOGO_SRC =
  "https://uploads.onecompiler.io/44xrmsgax/1786305177486/ChatGPT%20Image%20Aug%2010,%202026,%2012_33_44%20AM.png";

export default function Welcome() {
  const navigate = useNavigate();

  const openLogin = () => {
    navigate("/login");
  };

  return (
    <main className="welcome-page">
      <div className="welcome-container">
        <img src={LOGO_SRC} alt="Hungerlink Logo" className="form-logo" />

        <h1 className="welcome-title">Welcome to Hungerlink</h1>

        <p className="tagline">Reduce Waste. Share Hope.</p>

        <div className="continue-box" onClick={openLogin}>
          <h2>Tap Anywhere to Continue</h2>
          <p>Go to Login</p>
        </div>

        <section className="details-section">
          <h2 className="details-title">Details</h2>

          <h3 className="detail-subtitle">About</h3>

          <p>
            Hungerlink is a smart food donation platform designed to connect
            restaurants, hotels, organizations and food donors with NGOs.
          </p>

          <p>
            Many restaurants, hotels and organizations have extra food that
            is still safe to eat but may otherwise be wasted. Hungerlink
            provides a digital platform where donors can share information
            about available food and NGOs can coordinate its collection and
            distribution.
          </p>

          <p>
            The platform helps reduce food waste and supports people who
            need food. It creates a direct connection between food donors
            and NGOs and makes food donation simple and organized.
          </p>

          <h3 className="detail-subtitle">Business Idea</h3>

          <h4 className="business-subtitle">1. Register</h4>

          <p>
            Restaurants, hotels, organizations and NGOs can register on the
            Hungerlink platform by creating their account.
          </p>

          <p>
            During registration, users provide their basic information,
            contact details, location and account type. Users can register
            as either a Donor or an NGO.
          </p>

          <h4 className="business-subtitle">2. Donate Food</h4>

          <p>
            After registration, restaurants, hotels and other donors can
            provide information about surplus food available for donation.
          </p>

          <p>
            The donor can provide details such as food name, quantity, food
            type, pickup location and availability time.
          </p>

          <h4 className="business-subtitle">3. NGO Claims Food</h4>

          <p>
            Registered NGOs can view available food donations posted by
            donors.
          </p>

          <p>
            When an NGO finds suitable food, it can claim the donation
            through the Hungerlink platform and coordinate with the donor
            for collection.
          </p>

          <p>
            After collecting the food, the NGO can distribute it to people
            and communities who need it.
          </p>
        </section>
      </div>
    </main>
  );
}
