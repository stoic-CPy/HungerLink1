import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/client";
import "../../styles/ngoDashboard.css";

// Free, public India Post pincode lookup - no API key needed.
const PINCODE_LOOKUP_URL = "https://api.postalpincode.in/pincode/";

function normalize(row) {
  return {
    organizationName: row.organization_name,
    ownerName: row.owner_name,
    email: row.email,
    phone: row.phone,
    address: row.address,
    district: row.city,
    state: row.state,
    pincode: row.pincode,
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
  // "idle" | "loading" | "success" | "error"
  const [pincodeStatus, setPincodeStatus] = useState("idle");

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

  // Auto-fill District / State as soon as a valid 6-digit pincode is entered
  // while editing (same lookup used on the registration page).
  useEffect(() => {
    if (!isEditing || !draft) return;
    const pincode = draft.pincode;

    if (!/^[0-9]{6}$/.test(pincode || "")) {
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
          setDraft((prev) => ({
            ...prev,
            district: postOffice.District,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft?.pincode, isEditing]);

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const data = await api.put("/ngo/profile", { ...draft, city: draft.district });
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
                <span>Address Line 1</span>
                <strong>{profile.address}</strong>
              </div>
              <div className="detail">
                <span>District</span>
                <strong>{profile.district || "—"}</strong>
              </div>
              <div className="detail">
                <span>State</span>
                <strong>{profile.state || "—"}</strong>
              </div>
              <div className="detail">
                <span>Pincode</span>
                <strong>{profile.pincode || "—"}</strong>
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
                <span>Address Line 1</span>
                <input value={draft.address} onChange={handleChange("address")} />
              </div>
              <div className="detail">
                <span>District</span>
                <input
                  placeholder="Auto-filled from pincode"
                  value={draft.district || ""}
                  onChange={handleChange("district")}
                />
              </div>
              <div className="detail">
                <span>State</span>
                <input
                  placeholder="Auto-filled from pincode"
                  value={draft.state || ""}
                  onChange={handleChange("state")}
                />
              </div>
              <div className="detail">
                <span>Pincode</span>
                <input
                  maxLength={6}
                  pattern="[0-9]{6}"
                  inputMode="numeric"
                  value={draft.pincode || ""}
                  onChange={handleChange("pincode")}
                />
                {pincodeStatus === "loading" && (
                  <div className="pincode-status">Fetching district / state...</div>
                )}
                {pincodeStatus === "error" && (
                  <div className="pincode-status pincode-status-error">
                    Couldn&apos;t find that pincode. Please enter district / state manually.
                  </div>
                )}
                {pincodeStatus === "success" && (
                  <div className="pincode-status">District / state filled automatically.</div>
                )}
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
