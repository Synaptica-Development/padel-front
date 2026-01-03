import React, { useState } from 'react';
import '../styles/Date.css';

function DatePicker({ selectedCourt, onBack, onContinue }) {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 0, 1));

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

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour <= 22; hour++) {
      const time24 = `${hour.toString().padStart(2, '0')}:00`;
      const time12 = hour > 12 ? `${hour - 12}:00 PM` : `${hour}:00 AM`;
      slots.push({
        id: hour,
        time24: time24,
        time12: time12,
        available: Math.random() > 0.3
      });
    }
    return slots;
  };

  const calendarDays = generateCalendarDays();
  const timeSlots = generateTimeSlots();

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

  const handleContinue = () => {
    if (selectedDate && selectedTime) {
      onContinue({
        court: selectedCourt,
        date: selectedDate,
        time: selectedTime
      });
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
          <p className="date-subtitle">Court {selectedCourt} - Choose your booking slot</p>
        </div>
      </div>

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
                    onClick={() => !dayObj.isPast && setSelectedDate(dayObj)}
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
            <h3 className="section-title">Choose Time</h3>
            <div className="times-grid">
              {timeSlots.map((slot) => (
                <div
                  key={slot.id}
                  className={`time-card ${selectedTime?.id === slot.id ? 'selected' : ''} ${!slot.available ? 'unavailable' : ''}`}
                  onClick={() => slot.available && setSelectedTime(slot)}
                >
                  <span className="time-text">{slot.time12}</span>
                  {!slot.available && <span className="unavailable-badge">Booked</span>}
                  {selectedTime?.id === slot.id && (
                    <div className="selected-check">
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {selectedDate && selectedTime && (
        <button className="continue-date-btn" onClick={handleContinue}>
          Continue to Payment
        </button>
      )}
    </div>
  );
}

export default DatePicker;