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
        </div>
      </div>
    </header>
  );
}

export default Header2;