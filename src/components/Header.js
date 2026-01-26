import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from './LanguageContext';
import '../styles/Header.css';

const API_BASE_URL = 'http://api.padelrocha.synaptica.online';

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const { language, toggleLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const scrollAttempts = useRef(0);

  // Check if user is logged in and fetch profile
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        // Extract token without "Bearer " prefix for validation
        const tokenValue = token.replace('Bearer ', '');
        const isValid = await validateToken(tokenValue);
        
        if (isValid) {
          setIsLoggedIn(true);
          // Fetch user profile
          await fetchUserProfile(token);
        } else {
          // Token invalid, clear it
          localStorage.removeItem('authToken');
          localStorage.removeItem('tokenExpiration');
          setIsLoggedIn(false);
          setUserProfile(null);
        }
      } else {
        setIsLoggedIn(false);
        setUserProfile(null);
      }
    };

    checkAuth();
  }, [location.pathname]); // Re-check on route change

  // Fetch user profile
  const fetchUserProfile = async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/User/profile`, {
        method: 'GET',
        headers: {
          'accept': '*/*',
          'Authorization': token,
          'X-Language': language
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('User profile fetched in header:', data);
        setUserProfile(data);
      } else {
        console.error('Failed to fetch user profile');
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
    }
  };

  // Validate token function
  const validateToken = async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/Auth/validate-token?token=${encodeURIComponent(token)}`, {
        method: 'GET',
        headers: {
          'accept': '*/*',
          'X-Language': language
        }
      });

      if (response.ok) {
        const isValid = await response.json();
        return isValid === true;
      }
      return false;
    } catch (err) {
      console.error('Token validation error:', err);
      return false;
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    // Prevent body scroll when menu is open
    if (!isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
    document.body.style.overflow = 'unset';
  };

  // Handle scrolling after navigation
  useEffect(() => {
    scrollAttempts.current = 0;

    if (location.hash) {
      const scrollToHash = () => {
        const id = location.hash.replace('#', '');
        const element = document.getElementById(id);
        
        if (element) {
          // Element found, scroll to it
          setTimeout(() => {
            element.scrollIntoView({ 
              behavior: 'smooth',
              block: 'start'
            });
          }, 100);
          return true;
        }
        return false;
      };

      // Try multiple times with increasing delays
      const attemptScroll = () => {
        if (scrollToHash()) {
          return; // Success, stop trying
        }
        
        scrollAttempts.current++;
        if (scrollAttempts.current < 10) {
          // Keep trying every 200ms for up to 2 seconds
          setTimeout(attemptScroll, 200);
        }
      };

      // Start attempting
      attemptScroll();
    } else if (location.pathname === '/') {
      // If on home page with no hash, scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [location.pathname, location.hash]);

  const handleScrollToSection = (e, sectionId) => {
    e.preventDefault();
    closeMenu();

    // Check if we're on the home page
    if (location.pathname === '/') {
      // We're already on home page, just scroll
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
          });
        }
      }, 100);
    } else {
      // Navigate to home page with hash
      navigate(`/#${sectionId}`);
    }
  };

  const handleProfileClick = (e) => {
    e.preventDefault();
    closeMenu();
    navigate('/user');
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-logo">
          <Link to="/" className="logo-link" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <span className="logo-text">Padel Rocha</span>
          </Link>
        </div>

        <div className="header-divider-horizontal"></div>

        <nav className={`header-nav ${isMenuOpen ? 'active' : ''}`}>
          <div className="mobile-nav-header">
            <span className="mobile-nav-title">Menu</span>
            <button 
              className="mobile-nav-close"
              onClick={closeMenu}
              aria-label="Close Menu"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 21 21" fill="none">
                <path d="M2.625 10.5C2.1852 10.5 1.74618 10.4632 1.3125 10.3901C1.34103 7.99142 2.30658 5.69904 4.00281 4.00281C5.69904 2.30658 7.99142 1.34103 10.3901 1.3125C10.4632 1.74618 10.5 2.1852 10.5 2.625C10.5 6.96732 6.96732 10.5 2.625 10.5ZM10.6087 19.6875C10.5701 19.4549 10.541 19.2199 10.523 18.9829C10.5078 18.7827 10.5 18.5784 10.5 18.3762C10.5 14.0339 14.0327 10.5012 18.375 10.5012C18.8148 10.5013 19.2538 10.538 19.6875 10.6112C19.6586 13.0098 18.6928 15.3021 16.9963 16.9981C15.2999 18.6941 13.0074 19.6593 10.6087 19.6875Z" fill="#95392F"/>
                <path d="M9.12147 9.12146C9.97729 8.27033 10.6558 7.25791 11.1177 6.14279C11.5796 5.02767 11.8158 3.832 11.8125 2.625C11.8125 2.21348 11.7851 1.80241 11.7305 1.39453C13.724 1.6645 15.5739 2.58104 16.9964 4.00355C18.419 5.42607 19.3355 7.27599 19.6055 9.26953C19.1976 9.2149 18.7865 9.1875 18.375 9.1875C17.168 9.18422 15.9723 9.42037 14.8572 9.88229C13.7421 10.3442 12.7297 11.0227 11.8785 11.8785C11.0227 12.7297 10.3442 13.7421 9.88229 14.8572C9.42037 15.9723 9.18422 17.168 9.1875 18.375C9.1875 18.6104 9.19652 18.8479 9.21416 19.0813C9.22783 19.2568 9.24643 19.4317 9.26994 19.6059C7.27632 19.3358 5.42633 18.4192 4.00375 16.9967C2.58117 15.5741 1.66456 13.7241 1.39453 11.7305C1.80241 11.7851 2.21348 11.8125 2.625 11.8125C3.832 11.8158 5.02767 11.5796 6.14279 11.1177C7.25791 10.6558 8.27033 9.97729 9.12147 9.12146Z" fill="#95392F"/>
              </svg>
            </button>
          </div>

          <ul className="nav-list">
            <li className="nav-item">
              <a 
                href="/" 
                className="nav-link" 
                onClick={(e) => handleScrollToSection(e, 'landing')}
              >
                {t('home')}
              </a>
            </li>
            <li className="nav-item">
              <a 
                href="#about" 
                className="nav-link" 
                onClick={(e) => handleScrollToSection(e, 'about')}
              >
                {t('aboutUs')}
              </a>
            </li>
            <li className="nav-item">
              <a 
                href="#contact" 
                className="nav-link" 
                onClick={(e) => handleScrollToSection(e, 'contact')}
              >
                {t('contact')}
              </a>
            </li>
            {/* Profile link for mobile only */}
            <li className="nav-item mobile-profile-item">
              <a 
                href="#" 
                className="nav-link profile-nav-link" 
                onClick={handleProfileClick}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                Profile
              </a>
            </li>
          </ul>

          <div className="mobile-nav-footer">
            <button 
              className="language-toggle-mobile"
              onClick={toggleLanguage}
              aria-label="Toggle Language"
            >
              {language === 'en' ? 'ქართული (GE)' : 'English (EN)'}
            </button>
          </div>
        </nav>

        {isMenuOpen && <div className="mobile-overlay" onClick={closeMenu}></div>}

        <div className="header-actions">
          <button 
            className="language-toggle"
            onClick={toggleLanguage}
            aria-label="Toggle Language"
          >
            {language === 'en' ? 'GE' : 'EN'}
          </button>

          {isLoggedIn ? (
            <div className="user-profile-dropdown">
              <Link to="/user" className="profile-button" title="Profile">
                <div className="profile-avatar">
                  {userProfile?.profileImageUrl ? (
                    <img 
                      src={userProfile.profileImageUrl} 
                      alt="Profile" 
                      className="profile-avatar-img"
                      onError={(e) => {
                        console.error('Failed to load profile image in header:', userProfile.profileImageUrl);
                      }}
                    />
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  )}
                </div>
              </Link>
              <Link to="/book" className="book-now-btn">
                Book Now
              </Link>
            </div>
          ) : (
            <Link to="/login" className="book-now-btn">
              Login
            </Link>
          )}
        </div>

        <button 
          className={`mobile-menu-toggle ${isMenuOpen ? 'menu-open' : ''}`}
          onClick={toggleMenu}
          aria-label="Toggle Menu"
          aria-expanded={isMenuOpen}
        >
          {!isMenuOpen && (
            <span className="menu-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="21" height="21" viewBox="0 0 21 21" fill="none">
                <path d="M18.375 10.5C18.8148 10.5 19.2538 10.4632 19.6875 10.3901C19.659 7.99142 18.6934 5.69904 16.9972 4.00281C15.301 2.30658 13.0086 1.34103 10.6099 1.3125C10.5368 1.74618 10.5 2.1852 10.5 2.625C10.5 6.96732 14.0327 10.5 18.375 10.5ZM10.3913 19.6875C10.4299 19.4549 10.459 19.2199 10.477 18.9829C10.4922 18.7827 10.5 18.5784 10.5 18.3762C10.5 14.0339 6.96732 10.5012 2.625 10.5012C2.1852 10.5013 1.74618 10.538 1.3125 10.6112C1.34136 13.0098 2.30721 15.3021 4.00367 16.9981C5.70013 18.6941 7.99264 19.6593 10.3913 19.6875Z" fill="#95392F"/>
                <path d="M11.8785 9.12146C11.0227 8.27033 10.3442 7.25791 9.88229 6.14279C9.42037 5.02767 9.18422 3.832 9.1875 2.625C9.1875 2.21348 9.2149 1.80241 9.26953 1.39453C7.27599 1.6645 5.42607 2.58104 4.00355 4.00355C2.58104 5.42607 1.6645 7.27599 1.39453 9.26953C1.80241 9.2149 2.21348 9.1875 2.625 9.1875C3.832 9.18422 5.02767 9.42037 6.14279 9.88229C7.25791 10.3442 8.27033 11.0227 9.12146 11.8785C9.97729 12.7297 10.6558 13.7421 11.1177 14.8572C11.5796 15.9723 11.8158 17.168 11.8125 18.375C11.8125 18.6104 11.8035 18.8479 11.7858 19.0813C11.7722 19.2568 11.7536 19.4317 11.7301 19.6059C13.7237 19.3358 15.5737 18.4192 16.9963 16.9967C18.4188 15.5741 19.3354 13.7241 19.6055 11.7305C19.1976 11.7851 18.7865 11.8125 18.375 11.8125C17.168 11.8158 15.9723 11.5796 14.8572 11.1177C13.7421 10.6558 12.7297 9.97729 11.8785 9.12146Z" fill="#95392F"/>
              </svg>
            </span>
          )}
        </button>
      </div>
    </header>
  );
}

export default Header;