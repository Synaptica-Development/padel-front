import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from './LanguageContext';
import '../styles/Date.css';

const API_BASE_URL = 'http://api.padelrocha.synaptica.online';

function DatePicker({ selectedCourt, onBack, onContinue }) {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedStartTime, setSelectedStartTime] = useState(null);
  const [selectedEndTime, setSelectedEndTime] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 0, 1));
  const [timeSlots, setTimeSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCancelPopup, setShowCancelPopup] = useState(false);

  // Generate default time slots when date is selected
  useEffect(() => {
    if (selectedDate) {
      setTimeSlots(generateDefaultTimeSlots());
      setSelectedStartTime(null);
      setSelectedEndTime(null);
    }
  }, [selectedDate]);

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

  const handleTimeSlotClick = (slot) => {
    if (!slot.available) return;

    if (!selectedStartTime) {
      setSelectedStartTime(slot);
      setSelectedEndTime(null);
      return;
    }

    if (!selectedEndTime) {
      if (slot.id === selectedStartTime.id) {
        const endSlot = timeSlots.find(s => s.id === slot.id + 1);
        setSelectedEndTime(endSlot);
      } 
      else if (slot.id > selectedStartTime.id) {
        setSelectedEndTime(slot);
      }
      else {
        setSelectedStartTime(slot);
        setSelectedEndTime(null);
      }
      return;
    }

    setSelectedStartTime(slot);
    setSelectedEndTime(null);
  };

  const isSlotInRange = (slot) => {
    if (!selectedStartTime) return false;
    if (!selectedEndTime) return slot.id === selectedStartTime.id;
    return slot.id >= selectedStartTime.id && slot.id < selectedEndTime.id;
  };

  const getBookingDuration = () => {
    if (!selectedStartTime || !selectedEndTime) return 0;
    return selectedEndTime.id - selectedStartTime.id;
  };

  const handleBooking = async () => {
    if (!selectedDate || !selectedStartTime || !selectedEndTime) return;

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

      console.log('Booking request:', bookingData);

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
      console.log('Booking result:', result);

      if (result === true) {
        onContinue({
          court: selectedCourt,
          date: selectedDate,
          startTime: selectedStartTime,
          endTime: selectedEndTime,
          duration: getBookingDuration(),
          success: true
        });
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

  const handleCancelBooking = () => {
    console.log('Booking cancelled');
    setShowCancelPopup(false);
    
    // Reset selections
    setSelectedDate(null);
    setSelectedStartTime(null);
    setSelectedEndTime(null);
  };

  const calendarDays = generateCalendarDays();

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

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="date-container">
      <div className="date-header">
        <button className="back-btn" onClick={onBack}>
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back
        </button>
        <div className="date-title-section">
          <h2 className="date-title">Select Date & Time</h2>
          <p className="date-subtitle">{selectedCourt.name} - Choose your booking slot</p>
        </div>
        
        {/* Cancel Booking Button */}
        {selectedDate && selectedStartTime && selectedEndTime && (
          <button 
            className="back-btn" 
            onClick={() => setShowCancelPopup(true)}
            style={{ background: '#fee', borderColor: '#fdd', color: '#c33' }}
          >
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Cancel
          </button>
        )}
      </div>

      {error && (
        <div style={{ 
          padding: '12px', 
          marginBottom: '20px', 
          backgroundColor: '#fee', 
          color: '#c33', 
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          {error}
        </div>
      )}

      <div className="selection-grid">
        <div className="selection-section">
          <div className="calendar-header">
            <button 
              className="month-nav-btn" 
              onClick={handlePrevMonth}
              disabled={currentMonth <= new Date(new Date().getFullYear(), new Date().getMonth(), 1)}
            >
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <h3 className="month-title">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </h3>
            <button 
              className="month-nav-btn" 
              onClick={handleNextMonth}
              disabled={currentMonth.getFullYear() >= 2026 && currentMonth.getMonth() >= 11}
            >
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          <div className="calendar-wrapper">
            <div className="calendar-day-headers">
              {dayNames.map(day => (
                <div key={day} className="day-name">{day}</div>
              ))}
            </div>
            <div className="calendar-days">
              {calendarDays.map((dayObj, index) => {
                const isSelected = selectedDate && 
                  dayObj.date.toDateString() === selectedDate.date.toDateString();
                
                return (
                  <button
                    key={index}
                    className={`day-cell ${isSelected ? 'selected' : ''} ${dayObj.isPast ? 'past' : ''}`}
                    style={{ gridColumn: dayObj.gridColumn }}
                    onClick={() => handleDateSelect(dayObj)}
                    disabled={dayObj.isPast}
                  >
                    {dayObj.day}
                    {isSelected && (
                      <div className="selected-check">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {selectedDate && (
          <div className="selection-section time-section">
            <h3 className="section-title">
              Choose Time
              {selectedStartTime && selectedEndTime && (
                <span style={{ 
                  fontSize: '14px', 
                  fontWeight: 'normal', 
                  marginLeft: '10px',
                  color: '#696FC7'
                }}>
                  ({getBookingDuration()} hour{getBookingDuration() !== 1 ? 's' : ''})
                </span>
              )}
            </h3>
            <p style={{ 
              fontSize: '13px', 
              color: '#666', 
              marginBottom: '15px',
              marginTop: '-5px'
            }}>
              {!selectedStartTime 
                ? 'Click to select start time' 
                : !selectedEndTime 
                  ? 'Click same time for 1 hour, or click later time for multiple hours'
                  : `${selectedStartTime.time12} - ${selectedEndTime.time12}`
              }
            </p>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <p>Loading available slots...</p>
              </div>
            ) : (
              <div className="times-grid">
                {timeSlots.map((slot) => {
                  const inRange = isSlotInRange(slot);
                  const isStart = selectedStartTime?.id === slot.id;
                  const isEnd = selectedEndTime?.id === slot.id;
                  
                  return (
                    <div
                      key={slot.id}
                      className={`time-card ${inRange ? 'selected' : ''} ${!slot.available ? 'unavailable' : ''}`}
                      onClick={() => handleTimeSlotClick(slot)}
                      style={{
                        borderColor: isStart || isEnd ? '#696FC7' : undefined,
                        borderWidth: isStart || isEnd ? '2px' : undefined
                      }}
                    >
                      <span className="time-text">{slot.time12}</span>
                      {!slot.available && <span className="unavailable-badge">Booked</span>}
                      {isStart && (
                        <span style={{
                          fontSize: '10px',
                          color: '#696FC7',
                          fontWeight: '600',
                          marginTop: '2px'
                        }}>START</span>
                      )}
                      {isEnd && (
                        <span style={{
                          fontSize: '10px',
                          color: '#696FC7',
                          fontWeight: '600',
                          marginTop: '2px'
                        }}>END</span>
                      )}
                      {inRange && (
                        <div className="selected-check">
                          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {selectedDate && selectedStartTime && selectedEndTime && (
        <button 
          className="continue-date-btn" 
          onClick={handleBooking}
          disabled={bookingLoading}
        >
          {bookingLoading ? 'Booking...' : `Book ${getBookingDuration()} Hour${getBookingDuration() !== 1 ? 's' : ''} - Complete Booking`}
        </button>
      )}

      {/* Cancel Booking Popup */}
      {showCancelPopup && (
        <div className="cancel-popup-overlay" onClick={() => setShowCancelPopup(false)}>
          <div className="cancel-popup" onClick={(e) => e.stopPropagation()}>
            <div className="cancel-popup-header">
              <div className="cancel-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className="cancel-popup-title">Cancel Booking?</h3>
            </div>

            <div className="cancel-popup-content">
              <p className="cancel-popup-text">
                Are you sure you want to cancel this booking? This action cannot be undone.
              </p>

              <div className="cancel-booking-details">
                <div className="cancel-detail-row">
                  <span className="cancel-detail-label">Court:</span>
                  <span className="cancel-detail-value">{selectedCourt.name}</span>
                </div>
                <div className="cancel-detail-row">
                  <span className="cancel-detail-label">Date:</span>
                  <span className="cancel-detail-value">
                    {selectedDate?.date.toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}
                  </span>
                </div>
                <div className="cancel-detail-row">
                  <span className="cancel-detail-label">Time:</span>
                  <span className="cancel-detail-value">
                    {selectedStartTime?.time12} - {selectedEndTime?.time12}
                  </span>
                </div>
                <div className="cancel-detail-row">
                  <span className="cancel-detail-label">Duration:</span>
                  <span className="cancel-detail-value">
                    {getBookingDuration()} hour{getBookingDuration() !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </div>

            <div className="cancel-popup-actions">
              <button 
                className="cancel-btn-secondary" 
                onClick={() => setShowCancelPopup(false)}
              >
                Keep Booking
              </button>
              <button 
                className="cancel-btn-primary" 
                onClick={handleCancelBooking}
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DatePicker;