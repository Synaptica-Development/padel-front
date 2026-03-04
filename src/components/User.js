import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header2 from './Header2';
import History from './History';
import Entry from './Entry';
import Settings from './Settings';
import '../styles/User.css';

const API_BASE_URL = 'http://api.padelrocha.synaptica.online';

function User({ section }) {
  const navigate = useNavigate();
  const params = useParams();
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const activeSection = section || 'order-history';

  useEffect(() => {
    fetchUserProfile();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/User/profile`, {
        method: 'GET',
        headers: {
          'accept': '*/*',
          'Authorization': token,
          'X-Language': 'en'
        }
      });

      if (response.status === 401) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('tokenExpiration');
        navigate('/login');
        return;
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch user profile: ${response.status}`);
      }

      const data = await response.json();
      setUserData(data);
    } catch (err) {
      console.error('Error fetching user profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleSidebar = () => {
    if (window.innerWidth <= 768) {
      setIsSidebarOpen(!isSidebarOpen);
    }
  };

  const handleNavClick = (section) => {
    if (section === 'order-history') {
      navigate('/user/history');
    } else if (section === 'settings') {
      navigate('/user/settings');
    }
    if (window.innerWidth <= 768) {
      setIsSidebarOpen(false);
    }
  };

  const handleLogout = () => setShowLogoutModal(true);

  const confirmLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('tokenExpiration');
    navigate('/');
  };

  const cancelLogout = () => setShowLogoutModal(false);

  const getInitials = () => {
    if (!userData) return '?';
    const firstInitial = userData.name?.charAt(0).toUpperCase() || '';
    const lastInitial = userData.lastName?.charAt(0).toUpperCase() || '';
    return firstInitial + lastInitial;
  };

  return (
    <>
      <Header2 />
      <div className='user-body'>
        <button
          className={`hamburger-menu ${isSidebarOpen ? 'active' : ''}`}
          onClick={toggleSidebar}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {isSidebarOpen && window.innerWidth <= 768 && (
          <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>
        )}

        <div className={`user-sidebar-container ${isSidebarOpen ? 'open' : ''}`}>
          <div className="user-items">
            <div className="user-picture">
              {loading ? (
                <div className="user-picture-loading">Loading...</div>
              ) : userData?.profileImageUrl ? (
                <img src={userData.profileImageUrl} alt="Profile" className="user-picture-img" />
              ) : (
                <div className="user-picture-placeholder">{getInitials()}</div>
              )}
            </div>
            <div className="user-name">
              <p>{loading ? 'Loading...' : `${userData?.name || ''} ${userData?.lastName || ''}`}</p>
            </div>
            <div className="user-email">
              <p>{loading ? 'Loading...' : userData?.email || userData?.phoneNumber || 'No contact info'}</p>
            </div>

            {/* Balance & Refund info */}
            {!loading && userData && (
              <div className="user-stats">
                <div className="user-stat-item">
                  <span className="user-stat-label">Balance</span>
                  <span className="user-stat-value">₾{userData.balance?.toFixed(2) ?? '0.00'}</span>
                </div>
                <div className="user-stat-divider" />
                <div className="user-stat-item">
                  <span className="user-stat-label">Refunds left</span>
                  <span className={`user-stat-value ${userData.refundRetryQuantity === 0 ? 'user-stat-zero' : ''}`}>
                    {userData.refundRetryQuantity ?? 0}
                    <span className="user-stat-sub"> / 12</span>
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="user-menu">
            <div className="user-buttons">
              <a
                href="/"
                className="mobile-only-btn"
                onClick={(e) => { e.preventDefault(); navigate('/'); }}
              >
                <p>Home</p>
              </a>
              <a
                href="#"
                className={activeSection === 'order-history' ? 'active' : ''}
                onClick={(e) => { e.preventDefault(); handleNavClick('order-history'); }}
              >
                <p>Order History</p>
              </a>
              <a
                href="#"
                className={activeSection === 'settings' ? 'active' : ''}
                onClick={(e) => { e.preventDefault(); handleNavClick('settings'); }}
              >
                <p>Profile</p>
              </a>
              <a
                href="#"
                className="logout-btn"
                onClick={(e) => { e.preventDefault(); handleLogout(); }}
              >
                <p>Logout</p>
              </a>
            </div>
          </div>
        </div>

        <div className={`user-booking-container ${isSidebarOpen ? 'sidebar-open' : ''}`}>
          {activeSection === 'order-history' && (
            <div className="order-history-container active"><History /></div>
          )}
          {activeSection === 'entry' && (
            <div className="order-history-container active"><Entry /></div>
          )}
          {activeSection === 'settings' && (
            <div className="settings-wrapper active"><Settings /></div>
          )}
        </div>
      </div>

      {showLogoutModal && (
        <div className="logout-overlay" onClick={cancelLogout}>
          <div className="logout-modal" onClick={(e) => e.stopPropagation()}>
            <div className="logout-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
            </div>
            <h3 className="logout-title">Logout</h3>
            <p className="logout-message">Are you sure you want to log out?</p>
            <div className="logout-actions">
              <button className="logout-cancel-btn" onClick={cancelLogout}>Cancel</button>
              <button className="logout-confirm-btn" onClick={confirmLogout}>Logout</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default User;