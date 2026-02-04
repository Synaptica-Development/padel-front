import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from './LanguageContext';
import Header from './Header';
import '../styles/Book.css';

const API_BASE_URL = 'http://api.padelrocha.synaptica.online';

function Book() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  
  // Step tracking
  const [currentStep, setCurrentStep] = useState(1); // 1: Date, 2: Court, 3: Time
  
  // Date selection
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 0, 1));
  
  // Court selection
  const [courts, setCourts] = useState([]);
  const [selectedCourt, setSelectedCourt] = useState(null);
  const [courtsLoading, setCourtsLoading] = useState(false);
  
  // Time selection
  const [timeSlots, setTimeSlots] = useState([]);
  const [selectedStartTime, setSelectedStartTime] = useState(null);
  const [selectedEndTime, setSelectedEndTime] = useState(null);
  const [timeSlotsLoading, setTimeSlotsLoading] = useState(false);
  
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

  // Fetch time slots when moving to step 3
  useEffect(() => {
    if (currentStep === 3 && selectedCourt && selectedDate) {
      fetchAvailableTimeSlots();
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
      
      const transformedCourts = data.map((court) => ({
        id: court.id,
        name: `Court ${court.name}`,
        status: 'available',
        apiData: court
      }));

      setCourts(transformedCourts);
      
    } catch (err) {
      console.error('Error fetching courts:', err);
      setError('Failed to load courts. Please try again.');
    } finally {
      setCourtsLoading(false);
    }
  };

  const fetchAvailableTimeSlots = async () => {
    try {
      setTimeSlotsLoading(true);
      setError('');

      const token = localStorage.getItem('authToken');
      if (!token) {
        navigate('/login');
        return;
      }

      const dateStr = selectedDate.date.toISOString().split('T')[0];

      const response = await fetch(
        `${API_BASE_URL}/api/Courts/available-hours?courtID=${selectedCourt.id}&date=${dateStr}`,
        {
          method: 'GET',
          headers: {
            'accept': '*/*',
            'Authorization': token,
            'X-Language': language
          }
        }
      );

      if (response.status === 401) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('tokenExpiration');
        navigate('/login');
        return;
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch available hours: ${response.status}`);
      }

      const availableHours = await response.json();

      const allSlots = generateDefaultTimeSlots();
      const slotsWithAvailability = allSlots.map(slot => ({
        ...slot,
        available: availableHours.includes(slot.id)
      }));

      setTimeSlots(slotsWithAvailability);

    } catch (err) {
      console.error('Error fetching available hours:', err);
      setError('Failed to load available time slots.');
      setTimeSlots(generateDefaultTimeSlots());
    } finally {
      setTimeSlotsLoading(false);
    }
  };

  const generateDefaultTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour <= 23; hour++) {
      const time24 = `${hour.toString().padStart(2, '0')}:00`;
      const time12 = hour > 12 ? `${hour - 12}:00 PM` : hour === 12 ? `12:00 PM` : `${hour}:00 AM`;
      slots.push({
        id: hour,
        time24: time24,
        time12: time12,
        available: true
      });
    }
    return slots;
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
    if (newMonth.getFullYear() <= 2026) {
      setCurrentMonth(newMonth);
    }
  };

  const handleDateSelect = (dayObj) => {
    if (!dayObj.isPast) {
      setSelectedDate(dayObj);
    }
  };

  const handleTimeSlotClick = (slot) => {
    if (!slot.available) return;

    if (!selectedStartTime) {
      setSelectedStartTime(slot);
      const endSlot = timeSlots.find(s => s.id === slot.id + 1);
      setSelectedEndTime(endSlot || null);
      return;
    }

    if (!selectedEndTime) {
      const endSlot = timeSlots.find(s => s.id === slot.id + 1);
      setSelectedEndTime(endSlot);
      return;
    }

    if (slot.id === selectedEndTime.id) {
      const newEndSlot = timeSlots.find(s => s.id === slot.id + 1);
      if (newEndSlot) {
        setSelectedEndTime(newEndSlot);
      }
      return;
    }

    if (slot.id === selectedStartTime.id) {
      const endSlot = timeSlots.find(s => s.id === slot.id + 1);
      setSelectedEndTime(endSlot);
      return;
    }

    if (slot.id > selectedStartTime.id) {
      setSelectedEndTime(slot);
      return;
    }

    setSelectedStartTime(slot);
    const endSlot = timeSlots.find(s => s.id === slot.id + 1);
    setSelectedEndTime(endSlot);
  };

  const isSlotInRange = (slot) => {
    if (!selectedStartTime || !selectedEndTime) return false;
    return slot.id >= selectedStartTime.id && slot.id < selectedEndTime.id;
  };

  const getBookingDuration = () => {
    if (!selectedStartTime || !selectedEndTime) return 0;
    return selectedEndTime.id - selectedStartTime.id;
  };

  const handleStepContinue = () => {
    if (currentStep === 1 && selectedDate) {
      setCurrentStep(2);
    } else if (currentStep === 2 && selectedCourt) {
      setCurrentStep(3);
    } else if (currentStep === 3 && selectedStartTime && selectedEndTime) {
      handleBooking();
    }
  };

  const handleStepBack = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
      setSelectedCourt(null);
    } else if (currentStep === 3) {
      setCurrentStep(2);
      setSelectedStartTime(null);
      setSelectedEndTime(null);
    }
  };

  const handleBooking = async () => {
    if (!selectedDate || !selectedCourt || !selectedStartTime || !selectedEndTime) return;

    try {
      setBookingLoading(true);
      setError('');

      const token = localStorage.getItem('authToken');
      if (!token) {
        navigate('/login');
        return;
      }

      const startDateTime = new Date(selectedDate.date);
      startDateTime.setHours(selectedStartTime.id, 0, 0, 0);
      
      const endDateTime = new Date(selectedDate.date);
      endDateTime.setHours(selectedEndTime.id, 0, 0, 0);

      const bookingData = {
        courtID: selectedCourt.id,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString()
      };

      const response = await fetch(`${API_BASE_URL}/api/Courts/book`, {
        method: 'PUT',
        headers: {
          'accept': '*/*',
          'Authorization': token,
          'X-Language': language,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bookingData)
      });

      if (response.status === 401) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('tokenExpiration');
        navigate('/login');
        return;
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Booking error:', errorText);
        throw new Error(`Booking failed: ${response.status}`);
      }

      const result = await response.json();

      if (result === true) {
        setBookingDetails({
          court: selectedCourt,
          date: selectedDate,
          startTime: selectedStartTime,
          endTime: selectedEndTime,
          duration: getBookingDuration(),
          success: true
        });
        setShowSuccessPopup(true);
      } else {
        throw new Error('Booking was not successful');
      }

    } catch (err) {
      console.error('Error booking court:', err);
      setError('Failed to book the court. Please try again.');
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
    if (currentStep === 2) return 'Select Court';
    return 'Select Time';
  };

  const getStepSubtitle = () => {
    if (currentStep === 1) return 'Choose your preferred date';
    if (currentStep === 2) return selectedDate ? selectedDate.date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    }) : 'Choose your court';
    return `${selectedCourt?.name} • ${selectedDate?.date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric'
    })}`;
  };

  const canContinue = () => {
    if (currentStep === 1) return selectedDate !== null;
    if (currentStep === 2) return selectedCourt !== null;
    return selectedStartTime !== null && selectedEndTime !== null;
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
                <path d="M19 12H5M5 12l7 7M5 12l7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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
                  <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : '1'}
            </div>
            <span className="step-label">Date</span>
          </div>
          <div className={`progress-line ${currentStep >= 2 ? 'active' : ''}`}></div>
          <div className={`progress-step ${currentStep >= 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}>
            <div className="step-circle">
              {currentStep > 2 ? (
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : '2'}
            </div>
            <span className="step-label">Court</span>
          </div>
          <div className={`progress-line ${currentStep >= 3 ? 'active' : ''}`}></div>
          <div className={`progress-step ${currentStep >= 3 ? 'active' : ''}`}>
            <div className="step-circle">3</div>
            <span className="step-label">Time</span>
          </div>
        </div>

        {error && (
          <div className="error-banner">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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
                    <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                
                <h2 className="month-title">
                  {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </h2>
                
                <button 
                  className="month-nav-btn" 
                  onClick={handleNextMonth}
                  disabled={currentMonth.getFullYear() >= 2026 && currentMonth.getMonth() >= 11}
                >
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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

        {/* Step 2: Court Selection */}
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
              <div className="courts-grid">
                {courts.map((court, index) => (
                  <div
                    key={court.id}
                    className={`court-card ${selectedCourt?.id === court.id ? 'selected' : ''}`}
                    onClick={() => setSelectedCourt(court)}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="court-card-inner">
                      <div className="court-number">{court.name.replace('Court ', '')}</div>
                      
                      <div className="court-info">
                        <h3 className="court-name">{court.name}</h3>
                        <span className="court-status">
                          <span className="status-dot"></span>
                          Available
                        </span>
                      </div>

                      {selectedCourt?.id === court.id && (
                        <div className="selected-indicator">
                          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 3: Time Selection */}
        {currentStep === 3 && (
          <div className="step-content">
            {selectedStartTime && selectedEndTime && (
              <div className="time-summary">
                <div className="time-summary-content">
                  <div className="time-display">
                    <span className="time-value">{selectedStartTime.time12}</span>
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M13 7l5 5-5 5M6 12h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span className="time-value">{selectedEndTime.time12}</span>
                  </div>
                  <span className="duration-badge">
                    {getBookingDuration()} {getBookingDuration() === 1 ? 'hour' : 'hours'}
                  </span>
                </div>
              </div>
            )}

            {timeSlotsLoading ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p className="loading-text">Loading time slots</p>
              </div>
            ) : (
              <div className="time-slots-grid">
                {timeSlots.map((slot) => {
                  const inRange = isSlotInRange(slot);
                  const isStart = selectedStartTime?.id === slot.id;
                  const isEnd = selectedEndTime?.id === slot.id;
                  
                  return (
                    <button
                      key={slot.id}
                      className={`time-slot ${inRange ? 'in-range' : ''} ${!slot.available ? 'unavailable' : ''} ${isEnd ? 'is-end' : ''}`}
                      onClick={() => handleTimeSlotClick(slot)}
                      disabled={!slot.available}
                    >
                      <span className="slot-time">{slot.time12}</span>
                      {!slot.available && <span className="slot-status">Booked</span>}
                      {isStart && <span className="slot-marker">Start</span>}
                      {isEnd && <span className="slot-marker end-marker">End</span>}
                      {inRange && (
                        <div className="range-indicator"></div>
                      )}
                    </button>
                  );
                })}
              </div>
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
                    {currentStep === 3 ? 'Complete Booking' : 'Continue'}
                  </span>
                  <svg className="continue-arrow" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {currentStep === 3 ? (
                      <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    ) : (
                      <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <path d="M8 12l3 3 5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
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
                <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default Book;