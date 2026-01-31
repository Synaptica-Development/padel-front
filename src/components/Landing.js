import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from './LanguageContext';
import '../styles/Landing.css';

const background = process.env.PUBLIC_URL + '/back.png';
const API_BASE_URL = 'http://api.padelrocha.synaptica.online';

function Landing() {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check if user is logged in
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        // Extract token without "Bearer " prefix for validation
        const tokenValue = token.replace('Bearer ', '');
        const isValid = await validateToken(tokenValue);
        
        if (isValid) {
          setIsLoggedIn(true);
        } else {
          // Token invalid, clear it
          localStorage.removeItem('authToken');
          localStorage.removeItem('tokenExpiration');
          setIsLoggedIn(false);
        }
      } else {
        setIsLoggedIn(false);
      }
    };

    checkAuth();
  }, []);

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

  const handleBookNow = (e) => {
    e.preventDefault();
    navigate('/book');
  };

  const handleLogin = (e) => {
    e.preventDefault();
    navigate('/login');
  };

  return (
    <div className='landing-body' style={{ backgroundImage: `url(${background})` }} id="landing">
      <div className='landing-overlay'></div>
      <div className='landing-content'>
        <h1 className='landing-title'>Padel Rocha</h1>
        <h2 className='landing-subtitle'>{t('feelTheMovement')}</h2>
        <p className='landing-description'>{t('landingDescription')}</p>
        
        {isLoggedIn ? (
          <button onClick={handleBookNow} className='landing-book-btn'>
            {t('bookNow')}
          </button>
        ) : (
          <button onClick={handleLogin} className='landing-book-btn'>
            Login
          </button>
        )}
      </div>
    </div>
  );
}

export default Landing;