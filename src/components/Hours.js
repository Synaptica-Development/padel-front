import React from 'react';
import '../styles/Book.css';

function Hours({
    timeSlots,
    timeSlotsLoading,
    selectedStartTime,
    selectedEndTime,
    onTimeSlotClick,
    onRefreshSlots,
    isSlotInRange,
    getBookingDuration,
    getTotalPrice // New prop for calculating total price
}) {
    return (
        <div className="inline-time-selection">
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
                        <div className="booking-details-badges">
                            <span className="duration-badge">
                                {getBookingDuration()} {getBookingDuration() === 1 ? 'hour' : 'hours'}
                            </span>
                            <span className="price-badge">
                                ₾{getTotalPrice()}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {timeSlotsLoading ? (
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p className="loading-text">Loading time slots</p>
                </div>
            ) : (
                <>
                    <div className="time-slots-header">
                        <p className="time-slots-info">
                            Click hours to select your booking time (minimum 1 hour)
                        </p>
                        <button
                            className="refresh-slots-btn"
                            onClick={onRefreshSlots}
                            title="Refresh availability"
                        >
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M1 4v6h6M23 20v-6h-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                    </div>
                    <div className="time-slots-grid">
                        {timeSlots.map((slot) => {
                            const inRange = isSlotInRange(slot);
                            const isStart = selectedStartTime?.id === slot.id;
                            const isIncluded = inRange || isStart;

                            return (
                                <button
                                    key={slot.id}
                                    className={`time-slot ${isIncluded ? 'in-range' : ''} ${!slot.available ? 'unavailable' : ''}`}
                                    onClick={() => onTimeSlotClick(slot)}
                                    disabled={!slot.available}
                                >
                                    <span className="slot-time">{slot.time12}</span>
                                    {slot.available && slot.price > 0 && (
                                        <span className="slot-price">₾{slot.price}</span>
                                    )}
                                    {!slot.available && <span className="slot-status">Booked</span>}
                                    {slot.available && isIncluded && (
                                        <div className="range-indicator"></div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
}

export default Hours;