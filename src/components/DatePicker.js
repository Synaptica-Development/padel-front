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
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [timeSlots, setTimeSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCancelPopup, setShowCancelPopup] = useState(false);

  useEffect(() => {
    if (selectedDate) {
      fetchAvailableTimeSlots();
      setSelectedStartTime(null);
      setSelectedEndTime(null);
    }
  }, [selectedDate]);

  const fetchAvailableTimeSlots = async () => {
    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('authToken');
      if (!token) {
        navigate('/login');
        return;
      }

      // Format date as YYYY-MM-DD
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
      console.log('Available hours:', availableHours);

      // Generate slots and mark unavailable ones
      const allSlots = generateDefaultTimeSlots();
      const slotsWithAvailability = allSlots.map(slot => {
        // Check if this hour is in the available hours array
        const isAvailable = availableHours.includes(slot.id);
        return {
          ...slot,
          available: isAvailable
        };
      });

      setTimeSlots(slotsWithAvailability);

    } catch (err) {
      console.error('Error fetching available hours:', err);
      setError('Failed to load available time slots.');
      // Fallback to default slots if API fails
      setTimeSlots(generateDefaultTimeSlots());
    } finally {
      setLoading(false);
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

  const handleTimeSlotClick = (slot) => {
    if (!slot.available) return;

    if (!selectedStartTime) {
      // First click - select start time and automatically set end time to +1 hour
      setSelectedStartTime(slot);
      const endSlot = timeSlots.find(s => s.id === slot.id + 1);
      setSelectedEndTime(endSlot || null);
      return;
    }

    if (!selectedEndTime) {
      // This shouldn't happen since we auto-set end time, but just in case
      const endSlot = timeSlots.find(s => s.id === slot.id + 1);
      setSelectedEndTime(endSlot);
      return;
    }

    // If clicking the current end time, extend by 1 hour
    if (slot.id === selectedEndTime.id) {
      const newEndSlot = timeSlots.find(s => s.id === slot.id + 1);
      if (newEndSlot) {
        setSelectedEndTime(newEndSlot);
      }
      return;
    }

    // If clicking the same start time, reset to 1 hour
    if (slot.id === selectedStartTime.id) {
      const endSlot = timeSlots.find(s => s.id === slot.id + 1);
      setSelectedEndTime(endSlot);
      return;
    }

    // If clicking a time after the start time, set it as the new end time
    if (slot.id > selectedStartTime.id) {
      setSelectedEndTime(slot);
      return;
    }

    // If clicking a time before the start time, set it as the new start time
    // and set end time to +1 hour from the new start
    setSelectedStartTime(slot);
    const endSlot = timeSlots.find(s => s.id === slot.id + 1);
    setSelectedEndTime(endSlot);
  };

  const isSlotInRange = (slot) => {
    if (!selectedStartTime) return false;
    if (!selectedEndTime) return false;
    // A slot is in range if it's >= start and < end
    // This means if start is 1:00 and end is 2:00, only 1:00 is in range (books the 1:00-2:00 hour)
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
    // Allow navigation up to 1 year in the future
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

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="date-container">
      <div className="date-header">
        <button className="back-btn" onClick={onBack}>
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5M5 12l7 7M5 12l7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <div className="header-content">
          <h1 className="date-title">Book Your Slot</h1>
          <p className="date-subtitle">{selectedCourt.name}</p>
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

      <div className="booking-layout">
        {/* Calendar Section */}
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

        {/* Time Selection Section */}
        {selectedDate && (
          <div className="time-section">
            <div className="time-header">
              <h2 className="time-title">Select Time</h2>
              <p className="time-subtitle">
                {selectedDate.date.toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'short',
                  day: 'numeric'
                })}
                {selectedStartTime && selectedEndTime && (
                  <span style={{ display: 'block', marginTop: '0.25rem', color: '#95392f', fontWeight: 600 }}>
                    Booking from {selectedStartTime.time12} to {selectedEndTime.time12}
                  </span>
                )}
              </p>
            </div>

            {selectedStartTime && selectedEndTime && (
              <div className="time-summary">
                <div className="time-summary-content">
                  <div className="time-display">
                    <span className="time-value">{selectedStartTime.time12}</span>
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M13 7l5 5-5 5M6 12h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="time-value">{selectedEndTime.time12}</span>
                  </div>
                  <span className="duration-badge">
                    {getBookingDuration()} {getBookingDuration() === 1 ? 'hour' : 'hours'}
                  </span>
                </div>
              </div>
            )}

            {loading ? (
              <div className="loading-time">
                <div className="spinner"></div>
                <p>Loading slots...</p>
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
      </div>

      {/* Book Button */}
      {selectedDate && selectedStartTime && selectedEndTime && (
        <div className="action-footer">
          <button
            className="book-btn"
            onClick={handleBooking}
            disabled={bookingLoading}
          >
            {bookingLoading ? (
              <>
                <div className="button-spinner"></div>
                <span>Processing...</span>
              </>
            ) : (
              <>
                <span>Complete Booking</span>
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </>
            )}
          </button>

          <button
            className="reset-btn"
            onClick={() => setShowCancelPopup(true)}
          >
            Reset Selection
          </button>
        </div>
      )}

      {/* Cancel Popup */}
      {showCancelPopup && (
        <div className="popup-overlay" onClick={() => setShowCancelPopup(false)}>
          <div className="popup-content" onClick={(e) => e.stopPropagation()}>
            <div className="popup-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            <h3 className="popup-title">Reset Selection?</h3>
            <p className="popup-description">
              This will clear your selected date and time. You'll need to choose again.
            </p>

            <div className="booking-summary">
              <div className="summary-row">
                <span className="summary-label">Court</span>
                <span className="summary-value">{selectedCourt.name}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Date</span>
                <span className="summary-value">
                  {selectedDate?.date.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Time</span>
                <span className="summary-value">
                  {selectedStartTime?.time12} - {selectedEndTime?.time12}
                </span>
              </div>
              <div className="summary-row highlight">
                <span className="summary-label">Duration</span>
                <span className="summary-value">
                  {getBookingDuration()} {getBookingDuration() === 1 ? 'hour' : 'hours'}
                </span>
              </div>
            </div>

            <div className="popup-actions">
              <button
                className="popup-btn secondary"
                onClick={() => setShowCancelPopup(false)}
              >
                Keep Selection
              </button>
              <button
                className="popup-btn primary"
                onClick={handleCancelBooking}
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DatePicker;