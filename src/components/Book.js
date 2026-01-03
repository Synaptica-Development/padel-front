import React, { useState } from 'react';
import DatePicker from './DatePicker';
import '../styles/Book.css';

function Book() {
  const [selectedCourt, setSelectedCourt] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const courts = [
    { id: 1, name: 'Court 1', status: 'available' },
    { id: 2, name: 'Court 2', status: 'available' },
    { id: 3, name: 'Court 3', status: 'available' },
    { id: 4, name: 'Court 4', status: 'available' }
  ];

  const handleContinue = () => {
    if (selectedCourt) {
      setShowDatePicker(true);
    }
  };

  const handleBackToCourts = () => {
    setShowDatePicker(false);
  };

  const handleDateContinue = (bookingData) => {
    console.log('Booking data:', bookingData);
    // Handle final booking submission here
    // You can navigate to payment or confirmation page
  };

  if (showDatePicker) {
    return (
      <DatePicker
        selectedCourt={selectedCourt}
        onBack={handleBackToCourts}
        onContinue={handleDateContinue}
      />
    );
  }

  return (
    <div className="book-container">
      <h2 className="book-title">Book Now</h2>
      <p className="book-subtitle">Select your preferred padel court</p>
      <div className="courts-grid">
        {courts.map((court) => (
          <div
            key={court.id}
            className={`court-card ${selectedCourt === court.id ? 'selected' : ''}`}
            onClick={() => setSelectedCourt(court.id)}
          >
            <div className="court-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="2"/>
                <line x1="12" y1="4" x2="12" y2="20" stroke="currentColor" strokeWidth="2"/>
                <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
              </svg>
            </div>
            <h3 className="court-name">{court.name}</h3>
            <span className="court-status">{court.status}</span>
            {selectedCourt === court.id && (
              <div className="selected-indicator">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>
      {selectedCourt && (
        <button className="continue-booking-btn" onClick={handleContinue}>
          Continue with Court {selectedCourt}
        </button>
      )}
    </div>
  );
}

export default Book;