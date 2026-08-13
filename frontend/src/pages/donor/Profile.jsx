import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api/client";

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
    businessType: row.business_type,
  };
}

const emptyProfile = {
  organizationName: "",
  ownerName: "",
  email: "",
  phone: "",
  address: "",
  district: "",
  state: "",
  pincode: "",
  businessType: "Restaurant / Hotel",
};

export default function Profile() {
  const [profile, setProfile] = useState(emptyProfile);
  const [draft, setDraft] = useState(emptyProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  // "idle" | "loading" | "success" | "error"
  const [pincodeStatus, setPincodeStatus] = useState("idle");

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

  // Auto-fill District / State as soon as a valid 6-digit pincode is entered
  // while editing (same lookup used on the registration page).
  useEffect(() => {
    if (!isEditing) return;
    const pincode = draft.pincode;

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
  }, [draft.pincode, isEditing]);

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const data = await api.put("/donor/profile", {
        ...draft,
        city: draft.district,
      });
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
            <span>Address Line 1</span>
            <strong>{profile.address}</strong>
            <input
              className="profile-input"
              type="text"
              value={draft.address}
              onChange={handleDraftChange("address")}
            />
          </div>

          <div className="detail">
            <span>District</span>
            <strong>{profile.district}</strong>
            <input
              className="profile-input"
              type="text"
              placeholder="Auto-filled from pincode"
              value={draft.district}
              onChange={handleDraftChange("district")}
            />
          </div>

          <div className="detail">
            <span>State</span>
            <strong>{profile.state}</strong>
            <input
              className="profile-input"
              type="text"
              placeholder="Auto-filled from pincode"
              value={draft.state}
              onChange={handleDraftChange("state")}
            />
          </div>

          <div className="detail">
            <span>Pincode</span>
            <strong>{profile.pincode}</strong>
            <input
              className="profile-input"
              type="text"
              maxLength={6}
              pattern="[0-9]{6}"
              inputMode="numeric"
              value={draft.pincode}
              onChange={handleDraftChange("pincode")}
            />
            {isEditing && pincodeStatus === "loading" && (
              <div className="pincode-status">Fetching district / state...</div>
            )}
            {isEditing && pincodeStatus === "error" && (
              <div className="pincode-status pincode-status-error">
                Couldn&apos;t find that pincode. Please enter district / state manually.
              </div>
            )}
            {isEditing && pincodeStatus === "success" && (
              <div className="pincode-status">District / state filled automatically.</div>
            )}
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
