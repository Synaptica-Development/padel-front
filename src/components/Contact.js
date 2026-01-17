import React from 'react'
import { useLanguage } from './LanguageContext'
import { MapContainer, TileLayer, Marker } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import '../styles/Contact.css'


const arrow = process.env.PUBLIC_URL+'/arrow-down.png'
const contactPic = process.env.PUBLIC_URL+'/contact.png'
const phone = process.env.PUBLIC_URL+'/phone.png'
const email = process.env.PUBLIC_URL+'/email.png'
const map = process.env.PUBLIC_URL+'/map.png'

const contactTranslations = {
  en: {
    getInTouch: 'Get In Touch',
    email: 'Email',
    phone: 'Phone',
    address: 'Address',
    addressText: 'Dimitri Amilakhvari Street, Tskneti, Tbilisi'
  },
  ka: {
    getInTouch: 'დაგვიკავშირდით',
    email: 'მეილი',
    phone: 'ტელეფონი',
    address: 'მისამართი',
    addressText: 'დიმიტრი ამილახვრის ქუჩა, წყნეთი, თბილისი'
  }
}

function Contact() {
  const { language } = useLanguage()
  
  // Exact coordinates for Dimitri Amilakhvari Street, Tskneti
  const locationCoords = [41.69485, 44.70381]
  
  const scrollDown = () => {
    window.scrollBy({
      top: window.innerHeight * 0.6,
      behavior: 'smooth'
    })
  }

  const handleEmailClick = () => {
    window.location.href = 'mailto:n.a.pushkina@hotmail.com'
  }

  const handlePhoneClick = () => {
    window.location.href = 'tel:+995599004455'
  }

  const handleAddressClick = () => {
    window.open(`https://www.google.com/maps?q=${locationCoords[0]},${locationCoords[1]}`, '_blank')
  }

  // Custom marker icon
  const customIcon = new L.Icon({
    iconUrl: map,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
  })

  return (
    <div className='contact-container' id='contact'>
      <style>{`
        .contact-map-container .leaflet-tile {
          filter: grayscale(100%) contrast(1) brightness(0.8);
        }
      `}</style>

      <div className="contact-hero"
        style={{ 
          backgroundImage: `linear-gradient(
            135deg,
            rgba(149, 57, 47, 0.388) 0%,
            rgba(149, 57, 47, 0.393) 50%,
            rgba(149, 57, 47, 0.558) 100%
          ), url(${contactPic})`,
          backgroundPosition: 'center',
          backgroundSize: 'cover' 
        }}>
        <h3>{contactTranslations[language].getInTouch}</h3>
        <div className="arrow-down" onClick={scrollDown}>
          <img src={arrow} alt="Arrow Down" className='arrow-img' />
        </div>
      </div>

      <div className="contact-items-container">
        <div className="contact-item" onClick={handleEmailClick}>
          <div className="contact-icon">
            <img src={email} alt="Email Icon" />
          </div>
          <div className="ball-content">
            <h4>{contactTranslations[language].email}</h4>
            <p>n.a.pushkina@hotmail.com</p>
          </div>
        </div>

        <div className="contact-item" onClick={handlePhoneClick}>
          <div className="contact-icon">
            <img src={phone} alt="Phone Icon" />
          </div>
          <div className="ball-content">
            <h4>{contactTranslations[language].phone}</h4>
            <p>+995 599 004 455</p>
          </div>
        </div>

        <div className="contact-item" onClick={handleAddressClick}>
          <div className="contact-icon">
            <img src={map} alt="Address Icon" />
          </div>
          <div className="ball-content">
            <h4>{contactTranslations[language].address}</h4>
            <p>{contactTranslations[language].addressText}</p>
          </div>
        </div>
      </div>

      <div className="contact-map-section">
        <MapContainer
          center={locationCoords}
          zoom={20}
          scrollWheelZoom={false}
          className="contact-map-container"
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          <Marker position={locationCoords} icon={customIcon} />
        </MapContainer>
      </div>
    </div>
  )
}

export default Contact