import React, { useEffect } from 'react';
import '../styles/Why.css';
import { useLanguage } from './LanguageContext';

const pad1 = process.env.PUBLIC_URL + '/pad1.png';
const pad2 = process.env.PUBLIC_URL + '/pad2.png';
const pad3 = process.env.PUBLIC_URL + '/pad3.png';
const pad4 = process.env.PUBLIC_URL + '/pad4.png';
const pad5 = process.env.PUBLIC_URL + '/pad5.png';

function Why() {
  const { t } = useLanguage();
  const images = [pad2, pad3, pad4, pad5];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="why-page">
      {/* Hero Section with First Reason */}
      <div className="why-hero-wrapper why-hero-extended">
        <div 
          className="why-hero-bg" 
          style={{ backgroundImage: `url(${pad1})` }}
        ></div>
        <div className="why-hero">
          <div className="why-hero-overlay"></div>
          <div className="why-hero-content">
            <h1 className="why-hero-title">{t('whyUsTitle')}</h1>
            
            {/* First Reason on Hero */}
            {t('whyReasons')[0] && (
              <div className="why-hero-first-reason">
                <h2 className="why-reason-title">{t('whyReasons')[0].title}</h2>
                <p className="why-reason-description">{t('whyReasons')[0].description}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Remaining Reason Sections */}
      <div className="why-reasons-wrapper">
        {t('whyReasons').slice(1).map((reason, index) => (
          <div key={index} className="why-reason-wrapper">
            <div 
              className="why-reason-bg"
              style={{ backgroundImage: `url(${images[index % images.length]})` }}
            ></div>
            <div 
              className={`why-reason-section ${index % 2 === 0 ? 'why-reason-left' : 'why-reason-right'}`}
            >
              <div className="why-reason-overlay"></div>
              <div className="why-reason-content">
                <h2 className="why-reason-title">{reason.title}</h2>
                <p className="why-reason-description">{reason.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Why;