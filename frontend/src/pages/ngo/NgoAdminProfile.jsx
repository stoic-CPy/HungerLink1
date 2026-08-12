import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/client";
import "../../styles/ngoDashboard.css";

function normalize(row) {
  return {
    organizationName: row.organization_name,
    ownerName: row.owner_name,
    email: row.email,
    phone: row.phone,
    address: row.address,
    establishmentYear: row.establishment_year,
  };
}

export default function NgoAdminProfile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [draft, setDraft] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/ngo/profile")
      .then((data) => {
        const normalized = normalize(data.profile);
        setProfile(normalized);
        setDraft(normalized);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleBack = () => {
    if (window.opener && !window.opener.closed) {
      window.opener.focus();
      window.close();
      return;
    }
    navigate("/ngo");
  };

  const handleChange = (field) => (event) => {
    setDraft((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleEditProfile = () => {
    setDraft(profile);
    setIsEditing(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const data = await api.put("/ngo/profile", draft);
      setProfile(normalize(data.profile));
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

  if (loading || !profile) {
    return <div className="ngo-profile-page">Loading profile...</div>;
  }

  return (
    <div className="ngo-profile-page">
      <header className="profile-header">
        <div className="logo">
          <span className="hunger">Hunger</span>
          <span className="link">Link</span>
        </div>
      </header>

      <div className="profile-container">
        <button className="back" onClick={handleBack}>
          ← Back to Dashboard
        </button>

        <div className="profile-card">
          <div className="profile-top">
            <div className="avatar">NA</div>
            <h1>{profile.ownerName || "NGO Admin"}</h1>
            <p>Organisation Administrator</p>
          </div>

          {error && <div className="error">{error}</div>}

          {!isEditing ? (
            <>
              <div className="detail">
                <span>Organisation Name</span>
                <strong>{profile.organizationName}</strong>
              </div>
              <div className="detail">
                <span>Owner Name</span>
                <strong>{profile.ownerName}</strong>
              </div>
              <div className="detail">
                <span>Gmail / Email Address</span>
                <strong>{profile.email}</strong>
              </div>
              <div className="detail">
                <span>Phone Number</span>
                <strong>{profile.phone}</strong>
              </div>
              <div className="detail">
                <span>Address</span>
                <strong>{profile.address}</strong>
              </div>
              <div className="detail">
                <span>Establishment Year</span>
                <strong>{profile.establishmentYear || "—"}</strong>
              </div>

              <button className="edit-profile" onClick={handleEditProfile}>
                Edit Profile
              </button>
            </>
          ) : (
            <>
              <div className="detail">
                <span>Organisation Name</span>
                <input value={draft.organizationName} onChange={handleChange("organizationName")} />
              </div>
              <div className="detail">
                <span>Owner Name</span>
                <input value={draft.ownerName} onChange={handleChange("ownerName")} />
              </div>
              <div className="detail">
                <span>Phone Number</span>
                <input value={draft.phone} onChange={handleChange("phone")} />
              </div>
              <div className="detail">
                <span>Address</span>
                <input value={draft.address} onChange={handleChange("address")} />
              </div>
              <div className="detail">
                <span>Establishment Year</span>
                <input
                  value={draft.establishmentYear || ""}
                  onChange={handleChange("establishmentYear")}
                />
              </div>

              <button className="edit-profile" onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </button>
              <button className="edit-profile" onClick={handleCancel}>
                Cancel
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
