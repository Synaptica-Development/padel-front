import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from './LanguageContext';
import '../styles/Landing.css';

const background = process.env.PUBLIC_URL + '/back.png';

function Landing() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleBookNow = (e) => {
    e.preventDefault();
    
    // Check if user is logged in
    const token = localStorage.getItem('authToken');
    
    if (token) {
      // User is logged in, go to book page
      navigate('/book');
    } else {
      // User is not logged in, go to login page
      navigate('/login');
    }
  };

  return (
    <div className='landing-body' style={{ backgroundImage: `url(${background})` }} id="landing">
      <div className='landing-overlay'></div>
      <div className='landing-content'>
        <h1 className='landing-title'>Padel Rocha</h1>
        <h2 className='landing-subtitle'>{t('feelTheMovement')}</h2>
        <p className='landing-description'>{t('landingDescription')}</p>
        <button onClick={handleBookNow} className='landing-book-btn'>
          {t('bookNow')}
        </button>
      </div>
    </div>
  );
}

export default Landing;