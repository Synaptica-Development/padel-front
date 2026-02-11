import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from './LanguageContext';
import '../styles/History.css';

const API_BASE_URL = 'http://api.padelrocha.synaptica.online';

function History() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(16);
  const [hasMore, setHasMore] = useState(true);
  const [filter, setFilter] = useState('All'); // 'All', 'OnlyActive', 'OnlyExpired', 'OnlyCanceled'

  // Map display filter to API filter
  const filterMap = {
    'All': 'All',
    'Active': 'OnlyActive',
    'Expired': 'OnlyExpired',
    'Cancelled': 'OnlyCanceled'
  };

  useEffect(() => {
    fetchBookingHistory();
  }, [page, filter]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const fetchBookingHistory = async () => {
    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('authToken');
      if (!token) {
        navigate('/login');
        return;
      }

      // Use the correct API filter value
      const apiFilter = filterMap[filter];

      const response = await fetch(
        `${API_BASE_URL}/api/Courts/book-history?Page=${page}&PageSize=${pageSize}&Filter=${apiFilter}`,
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
        throw new Error(`Failed to fetch booking history: ${response.status}`);
      }

      const data = await response.json();
      console.log('Booking history:', data);

      if (page === 1) {
        setBookings(data);
      } else {
        setBookings(prev => [...prev, ...data]);
      }

      setHasMore(data.length === pageSize);

    } catch (err) {
      console.error('Error fetching booking history:', err);
      setError('Failed to load booking history. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setPage(1);
    setBookings([]);
  };

  const handleBookingClick = (bookingId) => {
    navigate(`/user/entry/${bookingId}`);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
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
        return '#4CAF50';
      case 'expired':
        return '#FF9800';
      case 'cancelled':
      case 'canceled':
        return '#f44336';
      case 'completed':
        return '#2196F3';
      default:
        return '#666';
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
    }
  };

  if (loading && page === 1) {
    return (
      <div className="history-container">
        <h2 className="history-title">Booking History</h2>
        <div className="history-loading">
          <div className="loading-spinner"></div>
          <p>Loading your bookings...</p>
        </div>
      </div>
    );
  }

  if (error && bookings.length === 0) {
    return (
      <div className="history-container">
        <h2 className="history-title">Booking History</h2>
        <div className="history-error">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <p>{error}</p>
          <button onClick={() => { setPage(1); fetchBookingHistory(); }}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="history-container">
        <h2 className="history-title">Booking History</h2>

        {/* Filter Tabs */}
        <div className="filter-tabs">
          <button
            className={`filter-tab ${filter === 'All' ? 'active' : ''}`}
            onClick={() => handleFilterChange('All')}
          >
            <span className="filter-tab-text">All</span>
          </button>
          <button
            className={`filter-tab ${filter === 'Active' ? 'active' : ''}`}
            onClick={() => handleFilterChange('Active')}
          >
            <span className="filter-tab-text">Active</span>
          </button>
          <button
            className={`filter-tab ${filter === 'Expired' ? 'active' : ''}`}
            onClick={() => handleFilterChange('Expired')}
          >
            <span className="filter-tab-text">Expired</span>
          </button>
          <button
            className={`filter-tab ${filter === 'Cancelled' ? 'active' : ''}`}
            onClick={() => handleFilterChange('Cancelled')}
          >
            <span className="filter-tab-text">Cancelled</span>
          </button>
        </div>

        <div className="history-empty">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
            <line x1="12" y1="4" x2="12" y2="20" stroke="currentColor" strokeWidth="2" />
            <circle cx="12" cy="12" r="1.5" fill="currentColor" />
          </svg>
          <h3>No {filter !== 'All' ? filter : ''} Bookings</h3>
          <p>
            {filter === 'All'
              ? 'Your booking history will appear here once you make a reservation.'
              : `You don't have any ${filter.toLowerCase()} bookings at the moment.`
            }
          </p>
          <button onClick={() => navigate('/book')}>
            Book a Court
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="history-container">
      <div className="history-header">
        <h2 className="history-title">Booking History</h2>
        <p className="history-subtitle">
          {bookings.length} booking{bookings.length !== 1 ? 's' : ''} found
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs">
        <button
          className={`filter-tab ${filter === 'All' ? 'active' : ''}`}
          onClick={() => handleFilterChange('All')}
        >
          <span className="filter-tab-text">All</span>
        </button>
        <button
          className={`filter-tab ${filter === 'Active' ? 'active' : ''}`}
          onClick={() => handleFilterChange('Active')}
        >
          <span className="filter-tab-text">Active</span>
        </button>
        <button
          className={`filter-tab ${filter === 'Expired' ? 'active' : ''}`}
          onClick={() => handleFilterChange('Expired')}
        >
          <span className="filter-tab-text">Expired</span>
        </button>
        <button
          className={`filter-tab ${filter === 'Cancelled' ? 'active' : ''}`}
          onClick={() => handleFilterChange('Cancelled')}
        >
          <span className="filter-tab-text">Cancelled</span>
        </button>
      </div>

      <div className="bookings-grid">
        {bookings.map((booking) => (
          <div
            key={booking.id}
            className="booking-card"
            onClick={() => handleBookingClick(booking.id)}
          >
            <div className="booking-card-header">
              <div className="booking-court-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
                  <line x1="12" y1="4" x2="12" y2="20" stroke="currentColor" strokeWidth="2" />
                  <circle cx="12" cy="12" r="1.5" fill="currentColor" />
                </svg>
              </div>
              <div className="booking-court-info">
                <h3 className="booking-court-name">Court</h3>
                <span
                  className="booking-status"
                  style={{ backgroundColor: getStatusColor(booking.status) }}
                >
                  {booking.status}
                </span>
              </div>
            </div>

            <div className="booking-details">
              <div className="booking-detail-item">
                <div className="booking-detail-icon">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
                    <line x1="3" y1="9" x2="21" y2="9" stroke="currentColor" strokeWidth="2" />
                    <line x1="9" y1="1" x2="9" y2="5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <line x1="15" y1="1" x2="15" y2="5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
                <div className="booking-detail-content">
                  <span className="booking-detail-label">Date</span>
                  <span className="booking-detail-value">{formatDate(booking.from)}</span>
                </div>
              </div>

              <div className="booking-detail-item">
                <div className="booking-detail-icon">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                    <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
                <div className="booking-detail-content">
                  <span className="booking-detail-label">Time</span>
                  <span className="booking-detail-value">
                    {formatTime(booking.from)} - {formatTime(booking.to)}
                  </span>
                </div>
              </div>

              <div className="booking-detail-item">
                <div className="booking-detail-icon">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div className="booking-detail-content">
                  <span className="booking-detail-label">Duration</span>
                  <span className="booking-detail-value">{formatDuration(booking.duration)}</span>
                </div>
              </div>
            </div>

            <div className="booking-id">
              <span>ID: {booking.id.slice(0, 8)}...</span>
            </div>
          </div>
        ))}
      </div>

      {hasMore && (
        <div className="load-more-section">
          <button
            className="load-more-btn"
            onClick={loadMore}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}
    </div>
  );
}

export default History;