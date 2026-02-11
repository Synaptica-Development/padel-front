import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from './LanguageContext';
import '../styles/Book.css';

const API_BASE_URL = 'http://api.padelrocha.synaptica.online';

function Court({
    courts,
    selectedCourt,
    onCourtSelect,
    selectedDate,
    onBookingReady // Callback when booking is ready
}) {
    const navigate = useNavigate();
    const { language } = useLanguage();

    // Time selection states
    const [timeSlots, setTimeSlots] = useState([]);
    const [selectedStartTime, setSelectedStartTime] = useState(null);
    const [selectedEndTime, setSelectedEndTime] = useState(null);
    const [timeSlotsLoading, setTimeSlotsLoading] = useState(false);
    const [error, setError] = useState('');

    // Fetch time slots when a court is selected
    useEffect(() => {
        if (selectedCourt && selectedDate) {
            fetchAvailableTimeSlots();
        }
    }, [selectedCourt, selectedDate]);

    // Notify parent when booking is ready
    useEffect(() => {
        if (selectedStartTime && selectedEndTime && selectedCourt) {
            onBookingReady({
                court: selectedCourt,
                startTime: selectedStartTime,
                endTime: selectedEndTime,
                duration: getBookingDuration(),
                totalPrice: getTotalPrice()
            });
        } else {
            onBookingReady(null);
        }
    }, [selectedStartTime, selectedEndTime, selectedCourt]);

    const fetchAvailableTimeSlots = async () => {
        try {
            setTimeSlotsLoading(true);
            setError('');

            // Reset time selection when fetching new slots
            setSelectedStartTime(null);
            setSelectedEndTime(null);

            const token = localStorage.getItem('authToken');
            if (!token) {
                navigate('/login');
                return;
            }

            const dateStr = selectedDate.date.toISOString().split('T')[0];

            console.log('========================================');
            console.log('📅 FETCHING AVAILABILITY FOR:');
            console.log('  Date (YYYY-MM-DD):', dateStr);
            console.log('  Court ID:', selectedCourt.id);
            console.log('  Court Name:', selectedCourt.name);
            console.log('========================================');

            const apiUrl = `${API_BASE_URL}/api/Courts/aviable-hours?Day=${dateStr}&CourtID=${selectedCourt.id}`;

            const response = await fetch(apiUrl, {
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
                throw new Error(`Failed to fetch available hours: ${response.status}`);
            }

            const availableHoursData = await response.json();

            console.log('📥 API RESPONSE:', availableHoursData);

            // Create availability and price maps
            const hourAvailabilityMap = {};
            const hourPriceMap = {};
            availableHoursData.forEach(slot => {
                hourAvailabilityMap[slot.hour] = slot.isBooked === false;
                hourPriceMap[slot.hour] = slot.price || 0;
            });

            const bookedHours = availableHoursData
                .filter(slot => slot.isBooked === true)
                .map(slot => slot.hour);

            const availableHours = availableHoursData
                .filter(slot => slot.isBooked === false)
                .map(slot => slot.hour);

            console.log('📊 AVAILABILITY SUMMARY:');
            console.log('  ❌ BOOKED hours:', bookedHours.length > 0 ? bookedHours : 'None');
            console.log('  ✅ AVAILABLE hours:', availableHours);

            const displaySlots = generateTimeSlots(hourAvailabilityMap, hourPriceMap);
            setTimeSlots(displaySlots);

        } catch (err) {
            console.error('Error fetching available hours:', err);
            setError('Failed to load available time slots.');
            setTimeSlots(generateTimeSlots({}, {}));
        } finally {
            setTimeSlotsLoading(false);
        }
    };

    const generateTimeSlots = (hourAvailabilityMap, hourPriceMap) => {
        const slots = [];
        for (let hour = 0; hour <= 23; hour++) {
            const time24 = `${hour.toString().padStart(2, '0')}:00`;

            let time12;
            if (hour === 0) {
                time12 = '12:00 AM';
            } else if (hour < 12) {
                time12 = `${hour}:00 AM`;
            } else if (hour === 12) {
                time12 = '12:00 PM';
            } else {
                time12 = `${hour - 12}:00 PM`;
            }

            slots.push({
                id: hour,
                time24: time24,
                time12: time12,
                available: hourAvailabilityMap[hour] === true,
                price: hourPriceMap[hour] || 0
            });
        }
        return slots;
    };

    const handleTimeSlotClick = (slot) => {
        if (!slot.available) return;

        // No selection yet - this becomes the start AND auto-select next hour
        if (!selectedStartTime) {
            setSelectedStartTime(slot);
            // Automatically set end time to next hour (minimum 1 hour booking)
            const nextSlot = timeSlots.find(s => s.id === slot.id + 1);
            if (nextSlot) {
                setSelectedEndTime(nextSlot);
            } else {
                // If at last hour (23:00), create virtual end slot at 24:00
                setSelectedEndTime({ ...slot, id: slot.id + 1, time12: '12:00 AM', time24: '00:00' });
            }
            return;
        }

        // If clicking on the start time - deselect everything
        if (slot.id === selectedStartTime.id) {
            setSelectedStartTime(null);
            setSelectedEndTime(null);
            return;
        }

        // Start is selected and end is selected
        if (selectedStartTime && selectedEndTime) {
            const lastIncludedSlotId = selectedEndTime.id - 1;

            // If clicking on the last included slot - remove it (move back one hour)
            if (slot.id === lastIncludedSlotId) {
                const newEndSlot = timeSlots.find(s => s.id === selectedEndTime.id - 1);
                if (newEndSlot && newEndSlot.id > selectedStartTime.id) {
                    setSelectedEndTime(newEndSlot);
                } else {
                    // Minimum 1 hour, so keep at least 1 hour
                    setSelectedEndTime(timeSlots.find(s => s.id === selectedStartTime.id + 1));
                }
                return;
            }

            // If clicking after the current end - extend the range
            if (slot.id >= selectedEndTime.id) {
                const slotsToCheck = timeSlots.filter(s => s.id >= selectedEndTime.id && s.id <= slot.id);
                const allAvailable = slotsToCheck.every(s => s.available);

                if (allAvailable) {
                    const actualEndSlot = timeSlots.find(s => s.id === slot.id + 1);
                    if (actualEndSlot) {
                        setSelectedEndTime(actualEndSlot);
                    } else {
                        setSelectedEndTime({ ...slot, id: slot.id + 1 });
                    }
                }
                return;
            }

            // If clicking within the range (but not the last slot) - do nothing
            if (slot.id > selectedStartTime.id && slot.id < lastIncludedSlotId) {
                return;
            }

            // If clicking before start - restart from this slot with auto 1-hour
            if (slot.id < selectedStartTime.id) {
                setSelectedStartTime(slot);
                const nextSlot = timeSlots.find(s => s.id === slot.id + 1);
                if (nextSlot) {
                    setSelectedEndTime(nextSlot);
                } else {
                    setSelectedEndTime({ ...slot, id: slot.id + 1 });
                }
                return;
            }
        }
    };

    const isSlotInRange = (slot) => {
        if (!selectedStartTime || !selectedEndTime) return false;
        const inRange = slot.id >= selectedStartTime.id && slot.id < selectedEndTime.id;
        return inRange && slot.available;
    };

    const getBookingDuration = () => {
        if (!selectedStartTime || !selectedEndTime) return 0;
        return selectedEndTime.id - selectedStartTime.id;
    };

    // Calculate total price for selected time range
    const getTotalPrice = () => {
        if (!selectedStartTime || !selectedEndTime) return 0;

        let totalPrice = 0;
        for (let i = selectedStartTime.id; i < selectedEndTime.id; i++) {
            const slot = timeSlots.find(s => s.id === i);
            if (slot) {
                totalPrice += slot.price;
            }
        }
        return totalPrice;
    };

    return (
        <div className="courts-grid">
            {courts.map((court, index) => (
                <React.Fragment key={court.id}>
                    <div
                        className={`court-card ${selectedCourt?.id === court.id ? 'selected' : ''}`}
                        onClick={() => onCourtSelect(court)}
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
                                        <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Time slots appear below selected court */}
                    {selectedCourt?.id === court.id && (
                        <div className="inline-time-selection">
                            {error && (
                                <div className="error-message">
                                    {error}
                                </div>
                            )}

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
                                            Click hours to select your booking time
                                        </p>
                                        <button
                                            className="refresh-slots-btn"
                                            onClick={fetchAvailableTimeSlots}
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
                                                    onClick={() => handleTimeSlotClick(slot)}
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
                    )}
                </React.Fragment>
            ))}
        </div>
    );
}

export default Court;