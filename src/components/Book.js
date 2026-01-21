import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from './LanguageContext';
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
        // No token, redirect to login
        navigate('/login');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/Courts/courts`, {
        method: 'GET',
        headers: {
          'accept': '*/*',
          'Authorization': token, // Already has "Bearer " prefix
          'X-Language': language
        }
      });

      if (response.status === 401) {
        // Unauthorized - token expired or invalid
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
      
      // Transform API data to match our UI format
      const transformedCourts = data.map((court, index) => ({
        id: court.id,
        name: `Court ${court.name}`,
        status: 'available',
        apiData: court // Store original data for later use
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
      // Booking was successful, show confirmation or navigate
      alert('Booking successful!');
      // You can navigate to a confirmation page or reset the form
      setShowDatePicker(false);
      setSelectedCourt(null);
    }
  };

  if (showDatePicker) {
    // Pass the full court object, not just the ID
    const courtObject = courts.find(c => c.id === selectedCourt);
    
    return (
      <DatePicker
        selectedCourt={courtObject}
        onBack={handleBackToCourts}
        onContinue={handleDateContinue}
      />
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="book-container">
        <h2 className="book-title">Book Now</h2>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p>Loading courts...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="book-container">
        <h2 className="book-title">Book Now</h2>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p style={{ color: '#c33', marginBottom: '20px' }}>{error}</p>
          <button 
            onClick={fetchCourts}
            style={{
              padding: '10px 20px',
              backgroundColor: '#696FC7',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (courts.length === 0) {
    return (
      <div className="book-container">
        <h2 className="book-title">Book Now</h2>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p>No courts available at the moment.</p>
        </div>
      </div>
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
          Continue with {courts.find(c => c.id === selectedCourt)?.name}
        </button>
      )}
    </div>
  );
}

export default Book;