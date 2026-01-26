import React from 'react'
import { useLanguage } from './LanguageContext'
import { useNavigate, useLocation } from 'react-router-dom'
import '../styles/Footer.css'

const footerTranslations = {
  en: {
    home: 'Home',
    about: 'About Us',
    contact: 'Contact',
    bookNow: 'Book Now',
    email: 'Email',
    phone: 'Phone',
    address: 'Address',
    addressText: 'Dimitri Amilakhvari Street, Tskneti, Tbilisi',
    tagline: 'Feel the movement',
    rights: '© 2024 Padel Rocha. All rights reserved.'
  },
  ka: {
    home: 'მთავარი',
    about: 'ჩვენ შესახებ',
    contact: 'კონტაქტი',
    bookNow: 'დაჯავშნა',
    email: 'მეილი',
    phone: 'ტელეფონი',
    address: 'მისამართი',
    addressText: 'დიმიტრი ამილახვრის ქუჩა, წყნეთი, თბილისი',
    tagline: 'იგრძენი მოძრაობა',
    rights: '© 2024 Padel Rocha. ყველა უფლება დაცულია.'
  }
}

function Footer() {
  const { language } = useLanguage()
  const navigate = useNavigate()
  const location = useLocation()
  const t = footerTranslations[language]

  const handleScrollToSection = (e, sectionId) => {
    e.preventDefault()
    
    // Check if we're on the home page
    if (location.pathname === '/') {
      // We're already on home page, just scroll
      const element = document.getElementById(sectionId)
      if (element) {
        element.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        })
      }
    } else {
      // Navigate to home page with hash
      navigate(`/#${sectionId}`)
    }
  }

  const handleBookNow = () => {
    // Check if user is logged in
    const token = localStorage.getItem('authToken')
    
    if (token) {
      // User is logged in, go to book page
      navigate('/book')
    } else {
      // User is not logged in, go to login page
      navigate('/login')
    }
  }

  return (
    <footer className="footer-container">
      <div className="footer-content">
        <div className="footer-brand">
          <h2 className="footer-logo">PADEL ROCHA</h2>
          <p className="footer-tagline">"{t.tagline}"</p>
        </div>

        <div className="footer-links">
          <a href="#landing" onClick={(e) => handleScrollToSection(e, 'landing')}>
            {t.home}
          </a>
          <a href="#about" onClick={(e) => handleScrollToSection(e, 'about')}>
            {t.about}
          </a>
          <a href="#contact" onClick={(e) => handleScrollToSection(e, 'contact')}>
            {t.contact}
          </a>
        </div>

        <div className="footer-contact">
          <div className="footer-contact-item">
            <h4>{t.email}</h4>
            <a href="mailto:n.a.pushkina@hotmail.com">n.a.pushkina@hotmail.com</a>
          </div>
          <div className="footer-contact-item">
            <h4>{t.phone}</h4>
            <a href="tel:+995599004455">+995 599 004 455</a>
          </div>
          <div className="footer-contact-item">
            <h4>{t.address}</h4>
            <a href="https://www.google.com/maps?q=41.69485,44.70381" target="_blank" rel="noopener noreferrer">
              {t.addressText}
            </a>
          </div>
        </div>

        <div className="footer-cta">
          <button className="footer-book-btn" onClick={handleBookNow}>
            <span>{t.bookNow}</span>
          </button>
        </div>
      </div>

      <div className="footer-bottom">
        <p>{t.rights}</p>
      </div>
    </footer>
  )
}

export default Footer