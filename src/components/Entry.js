import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from './LanguageContext';
import '../styles/Entry.css';

const API_BASE_URL = 'http://api.padelrocha.synaptica.online';

function Entry() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [bookingData, setBookingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBookingDetails();
  }, [id]);

  const fetchBookingDetails = async () => {
    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('authToken');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/api/Courts/book-history?Page=1&PageSize=100`,
        {
          method: 'GET',
          headers: {
            'accept': '*/*',
            'Authorization': token,
            'X-Language': language
          }
        }
      );

      if (response.status === 401) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('tokenExpiration');
        navigate('/login');
        return;
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch booking details: ${response.status}`);
      }

      const data = await response.json();
      const booking = data.find(b => b.id === id);

      if (!booking) {
        setError('Booking not found');
        return;
      }

      setBookingData(booking);

    } catch (err) {
      console.error('Error fetching booking details:', err);
      setError('Failed to load booking details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDuration = (duration) => {
    const parts = duration.split(':');
    const hours = parseInt(parts[0]);
    const minutes = parseInt(parts[1]);
    
    if (hours === 0 && minutes === 0) return 'Invalid';
    if (hours === 0) return `${minutes} min`;
    if (minutes === 0) return `${hours} hour${hours !== 1 ? 's' : ''}`;
    return `${hours}h ${minutes}m`;
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'active';
      case 'completed':
        return 'completed';
      case 'cancelled':
        return 'cancelled';
      default:
        return '';
    }
  };

  if (loading) {
    return (
      <div className="entry-container">
        <div className="entry-loading">
          <div className="loading-spinner"></div>
          <p>Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (error || !bookingData) {
    return (
      <div className="entry-container">
        <div className="entry-error">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <h3>{error || 'Booking not found'}</h3>
          <button onClick={() => navigate('/user/history')} className="back-btn">
            Back to History
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="entry-container">
      {/* Back Button */}
      <button onClick={() => navigate('/user/history')} className="back-button">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        Back
      </button>

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
            <span className="info-label">Booking ID</span>
            <span className="info-value">{bookingData.id.slice(0, 13)}...</span>
          </div>
          <div className="info-row">
            <span className="info-label">Date</span>
            <span className="info-value">{formatDate(bookingData.from)}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Time</span>
            <span className="info-value">
              {formatTime(bookingData.from)} - {formatTime(bookingData.to)}
            </span>
          </div>
          <div className="info-row">
            <span className="info-label">Duration</span>
            <span className="info-value">{formatDuration(bookingData.duration)}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Court</span>
            <span className="info-value">Padel Court</span>
          </div>
        </div>

        {/* QR Code Section */}
        <div className="qr-code-section">
          <div className="qr-code-wrapper">
            <img 
              src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${bookingData.id}`}
              alt="Entry QR Code" 
              className="qr-code-image"
            />
          </div>
          <p className="qr-instruction">Scan this code at the entrance</p>
        </div>

        {/* Status Badge */}
        <div className={`status-badge ${getStatusColor(bookingData.status)}`}>
          {bookingData.status.toLowerCase() === 'active' && (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          )}
          {bookingData.status.toLowerCase() === 'completed' && (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          )}
          {bookingData.status.toLowerCase() === 'cancelled' && (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          )}
          <span>{bookingData.status} Reservation</span>
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