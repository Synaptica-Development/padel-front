import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from './LanguageContext';
import '../styles/Header2.css';

const API_BASE_URL = 'http://api.padelrocha.synaptica.online';

function Header2({ onMenuToggle }) {
  const [userProfile, setUserProfile] = useState(null);
  const { language, toggleLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const scrollAttempts = useRef(0);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  // Handle scrolling after navigation
  useEffect(() => {
    scrollAttempts.current = 0;

    if (location.hash) {
      const scrollToHash = () => {
        const id = location.hash.replace('#', '');
        const element = document.getElementById(id);
        
        if (element) {
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

      const attemptScroll = () => {
        if (scrollToHash()) {
          return;
        }
        
        scrollAttempts.current++;
        if (scrollAttempts.current < 10) {
          setTimeout(attemptScroll, 200);
        }
      };

      attemptScroll();
    } else if (location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [location.pathname, location.hash]);

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
          'X-Language': language
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUserProfile(data);
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
    }
  };

  const handleScrollToSection = (e, sectionId) => {
    e.preventDefault();

    if (location.pathname === '/') {
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
      navigate(`/#${sectionId}`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('tokenExpiration');
    navigate('/');
  };

  return (
    <header className="header2">
      <div className="header2-container">
        {/* Logo */}
        <div className="header2-logo">
          <Link to="/" className="header2-logo-link" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <span className="header2-logo-text">Padel Rocha</span>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="header2-nav">
          <ul className="header2-nav-list">
            <li className="header2-nav-item">
              <a 
                href="/" 
                className="header2-nav-link" 
                onClick={(e) => handleScrollToSection(e, 'landing')}
              >
                {t('home')}
              </a>
            </li>
            <li className="header2-nav-item">
              <a 
                href="#about" 
                className="header2-nav-link" 
                onClick={(e) => handleScrollToSection(e, 'about')}
              >
                {t('aboutUs')}
              </a>
            </li>
            <li className="header2-nav-item">
              <a 
                href="#contact" 
                className="header2-nav-link" 
                onClick={(e) => handleScrollToSection(e, 'contact')}
              >
                {t('contact')}
              </a>
            </li>
          </ul>
        </nav>

        {/* Desktop Actions */}
        <div className="header2-actions">
          <button 
            className="header2-language-toggle"
            onClick={toggleLanguage}
            aria-label="Toggle Language"
          >
            {language === 'en' ? 'GE' : 'EN'}
          </button>

          <Link to="/book" className="header2-book-btn">
            Book Now
          </Link>

          <div className="header2-profile">
            <Link to="/user" className="header2-profile-button" title="Profile">
              <div className="header2-profile-avatar">
                {userProfile?.profileImageUrl ? (
                  <img 
                    src={userProfile.profileImageUrl} 
                    alt="Profile" 
                    className="header2-profile-img"
                  />
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                )}
              </div>
            </Link>
          </div>

          <button 
            className="header2-logout-btn"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header2;