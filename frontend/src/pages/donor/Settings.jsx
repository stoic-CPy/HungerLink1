import { useState } from "react";

export default function Settings() {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [donationReminders, setDonationReminders] = useState(true);
  const [accountVisibility, setAccountVisibility] = useState(false);

  return (
    <>
      <div className="topbar">
        <div className="page-title">
          <h1>Settings</h1>
          <p>Manage your donor account settings</p>
        </div>
      </div>

      <div className="content-card">
        <div className="settings-list">
          <div className="setting-item">
            <div>
              <h3>Email Notifications</h3>
              <p>Receive donation updates.</p>
            </div>
            <input
              type="checkbox"
              checked={emailNotifications}
              onChange={(event) => setEmailNotifications(event.target.checked)}
            />
          </div>

          <div className="setting-item">
            <div>
              <h3>Donation Reminders</h3>
              <p>Receive pickup reminders.</p>
            </div>
            <input
              type="checkbox"
              checked={donationReminders}
              onChange={(event) => setDonationReminders(event.target.checked)}
            />
          </div>

          <div className="setting-item">
            <div>
              <h3>Account Visibility</h3>
              <p>Allow NGOs to view your donor profile.</p>
            </div>
            <input
              type="checkbox"
              checked={accountVisibility}
              onChange={(event) => setAccountVisibility(event.target.checked)}
            />
          </div>
        </div>
      </div>
    </>
  );
}
