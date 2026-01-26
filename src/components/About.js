import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from './LanguageContext';
import '../styles/About.css';

const pic = process.env.PUBLIC_URL + '/grid1.png';
const pic2 = process.env.PUBLIC_URL + '/grid2.png';
const pic3 = process.env.PUBLIC_URL + '/grid3.png';
const pic4 = process.env.PUBLIC_URL + '/grid5.png';

function About() {
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
    <div className="about-grid-wrapper" id="about">
      {/* 
        CUBE 1: LEFT SIDE (Tall, 100vh)
        Contains Title, Image, and Button 
      */}
      <div className="about-left-panel">
        <div className="about-left-bg" style={{ backgroundImage: `url(${pic})` }}></div>
        <div className="about-left-overlay"></div>
        <div className="about-left-content">
          <h2 className="about-title-large">{t('aboutUsTitle')}</h2>
          <button onClick={handleBookNow} className="about-book-btn">
            Book Now
          </button>
        </div>
      </div>

      {/* RIGHT SIDE CONTAINER */}
      <div className="about-right-panel">
        {/* TOP ROW (50% Height) */}
        <div className="about-row">
          {/* CUBE 2: Top Left (30% Width) */}
          <div className="about-cube width-30 dark-theme">
            <div className="cube-content">
              <p>{t('aboutParagraph1')}</p>
            </div>
          </div>

          {/* CUBE 3: Top Right (70% Width) */}
          <div 
            className="about-cube width-70 light-theme"
            style={{
              backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(${pic3})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            <div className="cube-content">
              <h3>Our Mission</h3>
              <p>{t('aboutParagraph2')}</p>
            </div>
          </div>
        </div>

        {/* BOTTOM ROW (50% Height) */}
        <div className="about-row">
          {/* CUBE 4: Bottom Left (70% Width) */}
          <div 
            className="about-cube width-70 light-theme"
            style={{
              backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(${pic4})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            <div className="cube-content">
              <h3>Our Vision</h3>
              <p>{t('aboutParagraph3')}</p>
            </div>
          </div>

          {/* CUBE 5: Bottom Right (30% Width) */}
          <div className="about-cube width-30 accent-theme">
            <div className="cube-content">
              <p className="about-closing-text">{t('aboutClosing')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default About;