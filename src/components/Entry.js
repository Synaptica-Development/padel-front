import React, { useState } from 'react';
import '../styles/Entry.css';

function Entry() {
  // Placeholder data - replace with API data later
  const [userData] = useState({
    firstName: 'John',
    lastName: 'Doe',
    orderDate: '2026-01-15',
    orderTime: '14:30',
    tableNumber: '12',
    qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=ORDER-12345-2026'
  });

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  return (
    <div className="entry-container">
      {/* Header */}
      <div className="entry-header">
        <h2 className="entry-title">Entry Pass</h2>
        <p className="entry-subtitle">Show this QR code at the entrance</p>
      </div>

      {/* QR Code Card */}
      <div className="entry-card">
        {/* User Info Section */}
        <div className="entry-info-section">
          <div className="info-row">
            <span className="info-label">Name</span>
            <span className="info-value">{userData.firstName} {userData.lastName}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Date</span>
            <span className="info-value">{formatDate(userData.orderDate)}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Time</span>
            <span className="info-value">{userData.orderTime}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Table</span>
            <span className="info-value">#{userData.tableNumber}</span>
          </div>
        </div>

        {/* QR Code Section */}
        <div className="qr-code-section">
          <div className="qr-code-wrapper">
            <img 
              src={userData.qrCode} 
              alt="Entry QR Code" 
              className="qr-code-image"
            />
          </div>
          <p className="qr-instruction">Scan this code at the entrance</p>
        </div>

        {/* Status Badge */}
        <div className="status-badge active">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          <span>Active Reservation</span>
        </div>
      </div>

      {/* Additional Info */}
      <div className="entry-footer">
        <div className="footer-note">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
          <p>Please arrive 10 minutes before your reservation time</p>
        </div>
      </div>
    </div>
  );
}

export default Entry;