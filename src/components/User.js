import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Book from './Book';
import Entry from './Entry';
import History from './History';
import '../styles/User.css';

const API_BASE_URL = 'http://api.padelrocha.synaptica.online';

function User() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('book-now');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserProfile();
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
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleNavClick = (section) => {
    setActiveSection(section);
    // Close sidebar on mobile after selection
    if (window.innerWidth <= 768) {
      setIsSidebarOpen(false);
    }
  };

  const getInitials = () => {
    if (!userData) return '?';
    const firstInitial = userData.name?.charAt(0).toUpperCase() || '';
    const lastInitial = userData.lastName?.charAt(0).toUpperCase() || '';
    return firstInitial + lastInitial;
  };

  return (
    <div className='user-body'>
      {/* Hamburger Menu Button */}
      <button 
        className={`hamburger-menu ${isSidebarOpen ? 'active' : ''}`}
        onClick={toggleSidebar}
        aria-label="Toggle menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div 
          className="sidebar-overlay" 
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div className={`user-sidebar-container ${isSidebarOpen ? 'open' : ''}`}>
        <div className="user-items">
          <div className="user-picture">
            {loading ? (
              <div className="user-picture-loading">Loading...</div>
            ) : (
              <div className="user-picture-initials">
                {getInitials()}
              </div>
            )}
          </div>
          <div className="user-name">
            <p>
              {loading 
                ? 'Loading...' 
                : `${userData?.name || ''} ${userData?.lastName || ''}`
              }
            </p>
          </div>
          <div className="user-email">
            <p>
              {loading 
                ? 'Loading...' 
                : userData?.email || userData?.phoneNumber || 'No contact info'
              }
            </p>
          </div>
        </div>
        <div className="user-menu">
          <div className="user-buttons">
            <a 
              href="#" 
              className={activeSection === 'book-now' ? 'active' : ''}
              onClick={(e) => {
                e.preventDefault();
                handleNavClick('book-now');
              }}
            >
              <p>Book Now</p>
            </a>
            <a 
              href="#" 
              className={activeSection === 'entry' ? 'active' : ''}
              onClick={(e) => {
                e.preventDefault();
                handleNavClick('entry');
              }}
            >
              <p>Entry</p>
            </a>
            <a 
              href="#" 
              className={activeSection === 'current-orders' ? 'active' : ''}
              onClick={(e) => {
                e.preventDefault();
                handleNavClick('current-orders');
              }}
            >
              <p>Current Orders</p>
            </a>
            <a 
              href="#" 
              className={activeSection === 'order-history' ? 'active' : ''}
              onClick={(e) => {
                e.preventDefault();
                handleNavClick('order-history');
              }}
            >
              <p>Order History</p>
            </a>
            <a 
              href="#" 
              className={activeSection === 'settings' ? 'active' : ''}
              onClick={(e) => {
                e.preventDefault();
                handleNavClick('settings');
              }}
            >
              <p>Settings</p>
            </a>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`user-booking-container ${isSidebarOpen ? 'sidebar-open' : ''}`}>
        {activeSection === 'book-now' && (
          <div className="tables active">
            <Book />
          </div>
        )}
        {activeSection === 'entry' && (
          <div className="entry-container active">
            <Entry />
          </div>
        )}
        {activeSection === 'current-orders' && (
          <div className="current-orders-container active">
            <h2>Current Orders</h2>
            {/* Add your current orders content here */}
          </div>
        )}
        {activeSection === 'order-history' && (
          <div className="order-history-container active">
            <History />
          </div>
        )}
        {activeSection === 'settings' && (
          <div className="settings-container active">
            <h2>Settings</h2>
            {/* Add your settings content here */}
          </div>
        )}
      </div>
    </div>
  );
}

export default User;