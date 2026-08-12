import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api/client";

function normalize(row) {
  return {
    organizationName: row.organization_name,
    ownerName: row.owner_name,
    email: row.email,
    phone: row.phone,
    address: row.address,
    businessType: row.business_type,
  };
}

const emptyProfile = {
  organizationName: "",
  ownerName: "",
  email: "",
  phone: "",
  address: "",
  businessType: "Restaurant / Hotel",
};

export default function Profile() {
  const [profile, setProfile] = useState(emptyProfile);
  const [draft, setDraft] = useState(emptyProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api
      .get("/donor/profile")
      .then((data) => {
        const normalized = normalize(data.profile);
        setProfile(normalized);
        setDraft(normalized);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleDraftChange = (field) => (event) => {
    setDraft((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleEdit = () => {
    setDraft(profile);
    setIsEditing(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const data = await api.put("/donor/profile", draft);
      const normalized = normalize(data.profile);
      setProfile(normalized);
      setIsEditing(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setDraft(profile);
    setIsEditing(false);
  };

  if (loading) {
    return (
      <>
        <div className="topbar">
          <div className="page-title">
            <h1>Donor Profile</h1>
          </div>
        </div>
        <p>Loading profile...</p>
      </>
    );
  }

  return (
    <>
      <div className="topbar">
        <div className="page-title">
          <h1>Donor Profile</h1>
          <p>Manage your donor account information</p>
        </div>
      </div>

      <div className="profile-container">
        <div className={`profile-card${isEditing ? " editing" : ""}`}>
          <div className="profile-top">
            <div className="avatar">DA</div>
            <h2>{profile.ownerName || "Donor Admin"}</h2>
            <p>Restaurant / Hotel Donor Account</p>
          </div>

          {error && <div className="error">{error}</div>}

          <div className="detail">
            <span>Restaurant / Organization Name</span>
            <strong>{profile.organizationName}</strong>
            <input
              className="profile-input"
              type="text"
              value={draft.organizationName}
              onChange={handleDraftChange("organizationName")}
            />
          </div>

          <div className="detail">
            <span>Owner Name</span>
            <strong>{profile.ownerName}</strong>
            <input
              className="profile-input"
              type="text"
              value={draft.ownerName}
              onChange={handleDraftChange("ownerName")}
            />
          </div>

          <div className="detail">
            <span>Email Address</span>
            <strong>{profile.email}</strong>
          </div>

          <div className="detail">
            <span>Phone Number</span>
            <strong>{profile.phone}</strong>
            <input
              className="profile-input"
              type="tel"
              value={draft.phone}
              onChange={handleDraftChange("phone")}
            />
          </div>

          <div className="detail">
            <span>Address</span>
            <strong>{profile.address}</strong>
            <input
              className="profile-input"
              type="text"
              value={draft.address}
              onChange={handleDraftChange("address")}
            />
          </div>

          <div className="detail">
            <span>Business Type</span>
            <strong>{profile.businessType}</strong>
            <select
              className="profile-input"
              value={draft.businessType}
              onChange={handleDraftChange("businessType")}
            >
              <option>Restaurant / Hotel</option>
              <option>Restaurant</option>
              <option>Hotel</option>
              <option>Cafe</option>
            </select>
          </div>

          {!isEditing && (
            <button type="button" className="edit-btn" onClick={handleEdit}>
              Edit Profile
            </button>
          )}

          {isEditing && (
            <div className="edit-actions">
              <button type="button" className="save-btn" onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </button>
              <button type="button" className="cancel-btn" onClick={handleCancel}>
                Cancel
              </button>
            </div>
          )}

          <Link to="/donor" className="profile-back-btn">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </>
  );
}
