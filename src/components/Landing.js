import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from './LanguageContext';
import '../styles/Landing.css';

const background = process.env.PUBLIC_URL + '/back.png';

function Landing() {
  const { t } = useLanguage();

  return (
    <div className='landing-body' style={{ backgroundImage: `url(${background})` }} id="landing">
      <div className='landing-overlay'></div>
      <div className='landing-content'>
        <h1 className='landing-title'>Padel Rocha</h1>
        <h2 className='landing-subtitle'>{t('feelTheMovement')}</h2>
        <p className='landing-description'>{t('landingDescription')}</p>
        <Link to="/book" className='landing-book-btn'>
          {t('bookNow')}
        </Link>
      </div>
    </div>
  );
}

export default Landing;