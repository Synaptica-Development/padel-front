import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from './LanguageContext';
import Header from './Header';
import DatePicker from './DatePicker';
import '../styles/Book.css';

const API_BASE_URL = 'http://api.padelrocha.synaptica.online';

function Book() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [selectedCourt, setSelectedCourt] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [courts, setCourts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [bookingDetails, setBookingDetails] = useState(null);

  // Fetch courts from API on component mount
  useEffect(() => {
    fetchCourts();
  }, []);

  const fetchCourts = async () => {
    try {
      setLoading(true);
      setError('');

      // Get Bearer token from localStorage
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/Courts/courts`, {
        method: 'GET',
        headers: {
          'accept': '*/*',
          'Authorization': token,
          'X-Language': language
        }
      });

      if (response.status === 401) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('tokenExpiration');
        navigate('/login');
        return;
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch courts: ${response.status}`);
      }

      const data = await response.json();
      console.log('Courts fetched:', data);
      
      const transformedCourts = data.map((court, index) => ({
        id: court.id,
        name: `Court ${court.name}`,
        status: 'available',
        apiData: court
      }));

      setCourts(transformedCourts);
      
    } catch (err) {
      console.error('Error fetching courts:', err);
      setError('Failed to load courts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
    
    if (bookingData.success) {
      // Store booking details and show success popup
      setBookingDetails(bookingData);
      setShowSuccessPopup(true);
    }
  };

  const handleSuccessPopupClose = () => {
    setShowSuccessPopup(false);
    // Redirect to user history page
    navigate('/user/history');
  };

  if (showDatePicker) {
    const courtObject = courts.find(c => c.id === selectedCourt);
    
    return (
      <>
        <Header />
        <DatePicker
          selectedCourt={courtObject}
          onBack={handleBackToCourts}
          onContinue={handleDateContinue}
        />
        
        {/* Success Popup - Shows on top of DatePicker */}
        {showSuccessPopup && bookingDetails && (
          <div className="success-popup-overlay" onClick={handleSuccessPopupClose}>
            <div className="success-popup" onClick={(e) => e.stopPropagation()}>
              <div className="success-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                  <path d="M8 12l3 3 5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              
              <h2 className="success-title">Booking Successful!</h2>
              <p className="success-message">
                Your court has been booked successfully. See you on the court!
              </p>

              <div className="success-details">
                <div className="success-detail-row">
                  <span className="success-label">Court</span>
                  <span className="success-value">{bookingDetails.court?.name}</span>
                </div>
                <div className="success-detail-row">
                  <span className="success-label">Date</span>
                  <span className="success-value">
                    {bookingDetails.date?.date.toLocaleDateString('en-US', { 
                      weekday: 'long',
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}
                  </span>
                </div>
                <div className="success-detail-row">
                  <span className="success-label">Time</span>
                  <span className="success-value">
                    {bookingDetails.startTime?.time12} - {bookingDetails.endTime?.time12}
                  </span>
                </div>
                <div className="success-detail-row highlight">
                  <span className="success-label">Duration</span>
                  <span className="success-value">
                    {bookingDetails.duration} {bookingDetails.duration === 1 ? 'hour' : 'hours'}
                  </span>
                </div>
              </div>

              <button className="success-ok-btn" onClick={handleSuccessPopupClose}>
                <span>View Booking</span>
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Loading state
  if (loading) {
    return (
      <>
        <Header />
        <div className="book-container">
          <div className="loading-state">
            <div className="spinner"></div>
            <p className="loading-text">Loading courts</p>
          </div>
        </div>
      </>
    );
  }

  // Error state
  if (error) {
    return (
      <>
        <Header />
        <div className="book-container">
          <div className="error-state">
            <p className="error-text">{error}</p>
            <button className="retry-btn" onClick={fetchCourts}>
              Retry
            </button>
          </div>
        </div>
      </>
    );
  }

  // Empty state
  if (courts.length === 0) {
    return (
      <>
        <Header />
        <div className="book-container">
          <div className="empty-state">
            <p className="empty-text">No courts available</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="book-container">
        <div className="book-header">
          <h1 className="book-title">Select Court</h1>
          <p className="book-subtitle">Choose your preferred padel court</p>
        </div>

        <div className="courts-wrapper">
          <div className="courts-grid">
            {courts.map((court, index) => (
              <div
                key={court.id}
                className={`court-card ${selectedCourt === court.id ? 'selected' : ''}`}
                onClick={() => setSelectedCourt(court.id)}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="court-card-inner">
                  <div className="court-number">{court.name.replace('Court ', '')}</div>
                  
                  <div className="court-info">
                    <h3 className="court-name">{court.name}</h3>
                    <span className="court-status">
                      <span className="status-dot"></span>
                      Available
                    </span>
                  </div>

                  {selectedCourt === court.id && (
                    <div className="selected-indicator">
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {selectedCourt && (
          <div className="action-wrapper">
            <button className="continue-btn" onClick={handleContinue}>
              <span className="continue-text">Continue</span>
              <svg className="continue-arrow" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Success Popup */}
      {showSuccessPopup && bookingDetails && (
        <div className="success-popup-overlay" onClick={handleSuccessPopupClose}>
          <div className="success-popup" onClick={(e) => e.stopPropagation()}>
            <div className="success-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <path d="M8 12l3 3 5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            
            <h2 className="success-title">Booking Successful!</h2>
            <p className="success-message">
              Your court has been booked successfully. See you on the court!
            </p>

            <div className="success-details">
              <div className="success-detail-row">
                <span className="success-label">Court</span>
                <span className="success-value">{bookingDetails.court?.name}</span>
              </div>
              <div className="success-detail-row">
                <span className="success-label">Date</span>
                <span className="success-value">
                  {bookingDetails.date?.date.toLocaleDateString('en-US', { 
                    weekday: 'long',
                    month: 'short', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}
                </span>
              </div>
              <div className="success-detail-row">
                <span className="success-label">Time</span>
                <span className="success-value">
                  {bookingDetails.startTime?.time12} - {bookingDetails.endTime?.time12}
                </span>
              </div>
              <div className="success-detail-row highlight">
                <span className="success-label">Duration</span>
                <span className="success-value">
                  {bookingDetails.duration} {bookingDetails.duration === 1 ? 'hour' : 'hours'}
                </span>
              </div>
            </div>

            <button className="success-ok-btn" onClick={handleSuccessPopupClose}>
              <span>View Booking</span>
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default Book;