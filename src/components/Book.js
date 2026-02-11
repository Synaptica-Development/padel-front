import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from './LanguageContext';
import Header from './Header';
import Court from './Court';
import '../styles/Book.css';

const API_BASE_URL = 'http://api.padelrocha.synaptica.online';

function Book() {
  const navigate = useNavigate();
  const { language } = useLanguage();

  // Step tracking
  const [currentStep, setCurrentStep] = useState(1);

  // Date selection
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Court selection
  const [courts, setCourts] = useState([]);
  const [selectedCourt, setSelectedCourt] = useState(null);
  const [courtsLoading, setCourtsLoading] = useState(false);

  // Booking data from Court component
  const [bookingData, setBookingData] = useState(null);

  // General states
  const [error, setError] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [bookingDetails, setBookingDetails] = useState(null);

  // Fetch courts when moving to step 2
  useEffect(() => {
    if (currentStep === 2 && courts.length === 0) {
      fetchCourts();
    }
  }, [currentStep]);

  const fetchCourts = async () => {
    try {
      setCourtsLoading(true);
      setError('');

      const token = localStorage.getItem('authToken');

      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/Courts/courts`, {
        method: 'GET',
        headers: {
          'accept': '*/*',
          'Authorization': token,
          'X-Language': language
        }
      });

      if (response.status === 401) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('tokenExpiration');
        navigate('/login');
        return;
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch courts: ${response.status}`);
      }

      const data = await response.json();

      const transformedCourts = data
        .map((court, index) => ({
          id: court.id,
          name: `Court ${index + 1}`,
          displayOrder: index + 1,
          status: 'available',
          apiData: court
        }))
        .sort((a, b) => a.displayOrder - b.displayOrder);

      setCourts(transformedCourts);

    } catch (err) {
      console.error('Error fetching courts:', err);
      setError('Failed to load courts. Please try again.');
    } finally {
      setCourtsLoading(false);
    }
  };

  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();

    const days = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dayOfWeek = date.getDay();
      days.push({
        date: date,
        day: day,
        month: month,
        year: year,
        gridColumn: dayOfWeek + 1,
        isPast: date < new Date(new Date().setHours(0, 0, 0, 0))
      });
    }

    return days;
  };

  const handlePrevMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() - 1);
    const now = new Date();
    if (newMonth >= new Date(now.getFullYear(), now.getMonth(), 1)) {
      setCurrentMonth(newMonth);
    }
  };

  const handleNextMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() + 1);
    const maxDate = new Date();
    maxDate.setFullYear(maxDate.getFullYear() + 1);
    if (newMonth <= maxDate) {
      setCurrentMonth(newMonth);
    }
  };

  const handleDateSelect = (dayObj) => {
    if (!dayObj.isPast) {
      setSelectedDate(dayObj);
    }
  };

  const handleCourtSelect = (court) => {
    setSelectedCourt(court);
    setBookingData(null); // Reset booking data when changing courts
  };

  const handleBookingReady = (data) => {
    setBookingData(data);
  };

  const handleStepContinue = () => {
    if (currentStep === 1 && selectedDate) {
      setCurrentStep(2);
    } else if (currentStep === 2 && bookingData) {
      handleBooking();
    }
  };

  const handleStepBack = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
      setSelectedCourt(null);
      setBookingData(null);
    }
  };

  const handleBooking = async () => {
    if (!selectedDate || !bookingData) return;

    try {
      setBookingLoading(true);
      setError('');

      const token = localStorage.getItem('authToken');
      if (!token) {
        navigate('/login');
        return;
      }

      // FINAL AVAILABILITY CHECK
      console.log('🔄 Final availability check before booking...');
      const dateStr = selectedDate.date.toISOString().split('T')[0];
      const checkResponse = await fetch(
        `${API_BASE_URL}/api/Courts/aviable-hours?Day=${dateStr}&CourtID=${bookingData.court.id}`,
        {
          method: 'GET',
          headers: {
            'accept': '*/*',
            'Authorization': token,
            'X-Language': language
          }
        }
      );

      if (checkResponse.ok) {
        const latestAvailability = await checkResponse.json();

        for (let hour = bookingData.startTime.id; hour < bookingData.endTime.id; hour++) {
          const hourData = latestAvailability.find(h => h.hour === hour);
          if (hourData && hourData.isBooked) {
            setError(`Time slot ${hour}:00 is no longer available. Please select another time.`);
            setBookingLoading(false);
            return;
          }
        }
        console.log('✅ All selected hours are still available');
      }

      const startDateTime = new Date(selectedDate.date);
      startDateTime.setHours(bookingData.startTime.id, 0, 0, 0);

      const endDateTime = new Date(selectedDate.date);
      endDateTime.setHours(bookingData.endTime.id, 0, 0, 0);

      const bookingPayload = {
        courtID: bookingData.court.id,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString()
      };

      console.log('📤 Sending booking request:', bookingPayload);

      const response = await fetch(`${API_BASE_URL}/api/Courts/book`, {
        method: 'PUT',
        headers: {
          'accept': '*/*',
          'Authorization': token,
          'X-Language': language,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bookingPayload)
      });

      if (response.status === 401) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('tokenExpiration');
        navigate('/login');
        return;
      }

      if (!response.ok) {
        let errorMessage = 'Booking failed';
        try {
          const errorData = await response.json();
          console.error('Booking error:', errorData);

          if (errorData.message) {
            errorMessage = errorData.message;
          }

          if (response.status === 500 && errorData.message?.includes('entity changes')) {
            errorMessage = 'This time slot was just booked by someone else. Please select another time.';
          }
        } catch (e) {
          const errorText = await response.text();
          console.error('Booking error text:', errorText);
        }

        throw new Error(errorMessage);
      }

      const result = await response.json();

      if (result === true) {
        setBookingDetails({
          court: bookingData.court,
          date: selectedDate,
          startTime: bookingData.startTime,
          endTime: bookingData.endTime,
          duration: bookingData.duration,
          success: true
        });
        setShowSuccessPopup(true);
      } else {
        throw new Error('Booking was not successful');
      }

    } catch (err) {
      console.error('Error booking court:', err);
      setError(err.message || 'Failed to book the court. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleSuccessPopupClose = () => {
    setShowSuccessPopup(false);
    navigate('/user/history');
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const calendarDays = generateCalendarDays();

  const getStepTitle = () => {
    if (currentStep === 1) return 'Select Date';
    return 'Select Court & Time';
  };

  const getStepSubtitle = () => {
    if (currentStep === 1) return 'Choose your preferred date';
    return selectedDate ? selectedDate.date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }) : 'Choose your court and time';
  };

  const canContinue = () => {
    if (currentStep === 1) return selectedDate !== null;
    return bookingData !== null;
  };

  return (
    <>
      <Header />
      <div className="book-container">
        {/* Header with Back Button */}
        <div className="book-header">
          {currentStep > 1 && (
            <button className="back-btn" onClick={handleStepBack}>
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 12H5M5 12l7 7M5 12l7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}

          <div className="header-content-wrapper">
            <h1 className="book-title">{getStepTitle()}</h1>
            <p className="book-subtitle">{getStepSubtitle()}</p>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="progress-indicator">
          <div className={`progress-step ${currentStep >= 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}>
            <div className="step-circle">
              {currentStep > 1 ? (
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : '1'}
            </div>
            <span className="step-label">Date</span>
          </div>
          <div className={`progress-line ${currentStep >= 2 ? 'active' : ''}`}></div>
          <div className={`progress-step ${currentStep >= 2 ? 'active' : ''}`}>
            <div className="step-circle">2</div>
            <span className="step-label">Court & Time</span>
          </div>
        </div>

        {error && (
          <div className="error-banner">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {error}
          </div>
        )}

        {/* Step 1: Date Selection */}
        {currentStep === 1 && (
          <div className="step-content">
            <div className="calendar-section">
              <div className="calendar-header">
                <button
                  className="month-nav-btn"
                  onClick={handlePrevMonth}
                  disabled={currentMonth <= new Date(new Date().getFullYear(), new Date().getMonth(), 1)}
                >
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>

                <h2 className="month-title">
                  {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </h2>

                <button
                  className="month-nav-btn"
                  onClick={handleNextMonth}
                  disabled={(() => {
                    const maxDate = new Date();
                    maxDate.setFullYear(maxDate.getFullYear() + 1);
                    return currentMonth >= new Date(maxDate.getFullYear(), maxDate.getMonth(), 1);
                  })()}
                >
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>

              <div className="calendar-grid">
                <div className="calendar-weekdays">
                  {dayNames.map((day, index) => (
                    <div key={`weekday-${index}`} className="weekday-label">{day.charAt(0)}</div>
                  ))}
                </div>

                <div className="calendar-days">
                  {calendarDays.map((dayObj, index) => {
                    const isSelected = selectedDate &&
                      dayObj.date.toDateString() === selectedDate.date.toDateString();

                    return (
                      <button
                        key={index}
                        className={`day-button ${isSelected ? 'selected' : ''} ${dayObj.isPast ? 'past' : ''}`}
                        style={{ gridColumn: dayObj.gridColumn }}
                        onClick={() => handleDateSelect(dayObj)}
                        disabled={dayObj.isPast}
                      >
                        <span className="day-number">{dayObj.day}</span>
                        {isSelected && (
                          <div className="selection-ring"></div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Court & Time Selection */}
        {currentStep === 2 && (
          <div className="step-content">
            {courtsLoading ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p className="loading-text">Loading courts</p>
              </div>
            ) : courts.length === 0 ? (
              <div className="empty-state">
                <p className="empty-text">No courts available</p>
              </div>
            ) : (
              <Court
                courts={courts}
                selectedCourt={selectedCourt}
                onCourtSelect={handleCourtSelect}
                selectedDate={selectedDate}
                onBookingReady={handleBookingReady}
              />
            )}
          </div>
        )}

        {/* Continue Button */}
        {canContinue() && (
          <div className="action-wrapper">
            <button
              className="continue-btn"
              onClick={handleStepContinue}
              disabled={bookingLoading}
            >
              {bookingLoading ? (
                <>
                  <div className="button-spinner"></div>
                  <span className="continue-text">Processing...</span>
                </>
              ) : (
                <>
                  <span className="continue-text">
                    {currentStep === 2 ? 'Complete Booking' : 'Continue'}
                  </span>
                  <svg className="continue-arrow" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {currentStep === 2 ? (
                      <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    ) : (
                      <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    )}
                  </svg>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Success Popup */}
      {showSuccessPopup && bookingDetails && (
        <div className="success-popup-overlay" onClick={handleSuccessPopupClose}>
          <div className="success-popup" onClick={(e) => e.stopPropagation()}>
            <div className="success-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                <path d="M8 12l3 3 5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            <h2 className="success-title">Booking Successful!</h2>
            <p className="success-message">
              Your court has been booked successfully. See you on the court!
            </p>

            <div className="success-details">
              <div className="success-detail-row">
                <span className="success-label">Court</span>
                <span className="success-value">{bookingDetails.court?.name}</span>
              </div>
              <div className="success-detail-row">
                <span className="success-label">Date</span>
                <span className="success-value">
                  {bookingDetails.date?.date.toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
              </div>
              <div className="success-detail-row">
                <span className="success-label">Time</span>
                <span className="success-value">
                  {bookingDetails.startTime?.time12} - {bookingDetails.endTime?.time12}
                </span>
              </div>
              <div className="success-detail-row highlight">
                <span className="success-label">Duration</span>
                <span className="success-value">
                  {bookingDetails.duration} {bookingDetails.duration === 1 ? 'hour' : 'hours'}
                </span>
              </div>
            </div>

            <button className="success-ok-btn" onClick={handleSuccessPopupClose}>
              <span>View Booking</span>
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default Book;