import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Settings.css';

const API_BASE_URL = 'http://api.padelrocha.synaptica.online';

function Settings() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // OTP state
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [verificationKey, setVerificationKey] = useState('');
  const [otp, setOtp] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    lastName: '',
    email: '',
    phoneNumber: ''
  });

  const [originalData, setOriginalData] = useState({});

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('authToken');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/User/profile`, {
        method: 'GET',
        headers: {
          'accept': '*/*',
          'Authorization': token,
          'X-Language': 'en'
        }
      });

      if (response.status === 401) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('tokenExpiration');
        navigate('/login');
        return;
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch profile: ${response.status}`);
      }

      const data = await response.json();
      console.log('Profile data received:', data);
      
      const profileData = {
        name: data.name || '',
        lastName: data.lastName || '',
        email: data.email || '',
        phoneNumber: data.phoneNumber || ''
      };
      
      setFormData(profileData);
      setOriginalData(profileData);

    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim()) {
      setError('First name is required');
      return;
    }
    if (!formData.lastName.trim()) {
      setError('Last name is required');
      return;
    }
    if (formData.email && !isValidEmail(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const token = localStorage.getItem('authToken');
      if (!token) {
        navigate('/login');
        return;
      }

      const params = new URLSearchParams({
        name: formData.name.trim(),
        lastName: formData.lastName.trim()
      });

      // Only add email if it's not empty
      if (formData.email && formData.email.trim()) {
        params.append('email', formData.email.trim());
      }

      console.log('Sending update with params:', params.toString());

      const response = await fetch(
        `${API_BASE_URL}/api/User/change/profile?${params.toString()}`,
        {
          method: 'PUT',
          headers: {
            'accept': '*/*',
            'Authorization': token,
            'X-Language': 'en'
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
        const errorText = await response.text();
        console.error('Update failed:', response.status, errorText);
        throw new Error(`Failed to update profile: ${response.status}`);
      }

      const result = await response.json();
      console.log('Update successful:', result);

      // All profile changes require OTP verification if a key is returned
      if (result.key) {
        // Profile change requires OTP verification
        setVerificationKey(result.key);
        setShowOtpModal(true);
        setSaving(false);
        // Auto-send OTP
        sendOtp(result.key);
      } else {
        // No verification needed (shouldn't happen based on API docs)
        setSuccess('Profile updated successfully!');
        setOriginalData(formData);
        setTimeout(() => {
          fetchUserProfile();
        }, 1000);
        setSaving(false);
      }

    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile. Please try again.');
      setSaving(false);
    }
  };

  const sendOtp = async (key) => {
    try {
      setSendingOtp(true);
      const token = localStorage.getItem('authToken');

      const response = await fetch(
        `${API_BASE_URL}/api/Auth/send-otp?key=${encodeURIComponent(key)}`,
        {
          method: 'POST',
          headers: {
            'accept': '*/*',
            'Authorization': token,
            'X-Language': 'en'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to send OTP');
      }

      console.log('OTP sent successfully');
    } catch (err) {
      console.error('Error sending OTP:', err);
      setError('Failed to send verification code. Please try again.');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 4) {
      setError('Please enter a valid 4-digit code');
      return;
    }

    try {
      setVerifying(true);
      setError('');

      const token = localStorage.getItem('authToken');

      const response = await fetch(
        `${API_BASE_URL}/api/Auth/verify-otp?key=${encodeURIComponent(verificationKey)}&otp=${otp}`,
        {
          method: 'POST',
          headers: {
            'accept': '*/*',
            'Authorization': token,
            'X-Language': 'en'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Invalid verification code');
      }

      const verified = await response.json();
      
      if (verified) {
        setSuccess('Email verified and updated successfully!');
        setShowOtpModal(false);
        setOtp('');
        setVerificationKey('');
        setOriginalData(formData);
        
        // Refresh profile
        setTimeout(() => {
          fetchUserProfile();
        }, 1000);
      } else {
        setError('Invalid verification code. Please try again.');
      }

    } catch (err) {
      console.error('Error verifying OTP:', err);
      setError('Invalid verification code. Please try again.');
    } finally {
      setVerifying(false);
    }
  };

  const handleResendOtp = () => {
    setOtp('');
    setError('');
    sendOtp(verificationKey);
  };

  const handleCloseOtpModal = () => {
    setShowOtpModal(false);
    setOtp('');
    setVerificationKey('');
    setError('');
  };

  const handleReset = () => {
    setFormData(originalData);
    setError('');
    setSuccess('');
  };

  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const hasChanges = () => {
    return JSON.stringify(formData) !== JSON.stringify(originalData);
  };

  if (loading) {
    return (
      <div className="settings-container">
        <div className="settings-loading">
          <div className="loading-spinner"></div>
          <p>Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="settings-container">
      <div className="settings-header">
        <div className="settings-icon">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div className="settings-title-section">
          <h2 className="settings-title">Account Settings</h2>
          <p className="settings-subtitle">Manage your profile information</p>
        </div>
      </div>

      {error && (
        <div className="settings-message settings-error">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="settings-message settings-success">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22 11.08V12a10 10 0 11-5.93-9.14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M22 4L12 14.01l-3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>{success}</span>
        </div>
      )}

      <form className="settings-form" onSubmit={handleSubmit}>
        <div className="settings-section">
          <h3 className="section-title">Personal Information</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name" className="form-label">
                First Name <span className="required">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter your first name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="lastName" className="form-label">
                Last Name <span className="required">*</span>
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter your last name"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="form-input"
              placeholder="Enter your email address"
            />
            <p className="form-help-text">Changes to name and email require verification</p>
          </div>

          <div className="form-group">
            <label htmlFor="phoneNumber" className="form-label">
              Phone Number
            </label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              className="form-input"
              placeholder="Phone number"
              disabled
            />
            <p className="form-help-text">Phone number cannot be changed</p>
          </div>
        </div>

        <div className="settings-actions">
          <button
            type="button"
            className="btn-reset"
            onClick={handleReset}
            disabled={!hasChanges() || saving}
          >
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 12a9 9 0 019-9 9.75 9.75 0 016.74 2.74L21 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M21 3v5h-5M21 12a9 9 0 01-9 9 9.75 9.75 0 01-6.74-2.74L3 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M3 21v-5h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Reset Changes
          </button>

          <button
            type="submit"
            className="btn-save"
            disabled={!hasChanges() || saving}
          >
            {saving ? (
              <>
                <div className="btn-spinner"></div>
                Saving...
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M17 21v-8H7v8M7 3v5h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>

      {/* OTP Verification Modal */}
      {showOtpModal && (
        <div className="otp-overlay" onClick={handleCloseOtpModal}>
          <div className="otp-modal" onClick={(e) => e.stopPropagation()}>
            <button className="otp-close" onClick={handleCloseOtpModal}>
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>

            <div className="otp-header">
              <div className="otp-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 11a3 3 0 100-6 3 3 0 000 6zM17 21H1v-1a6 6 0 0112 0v1zM16 11h6M19 8v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className="otp-title">Verify Changes</h3>
              <p className="otp-subtitle">
                We've sent a verification code to verify your profile changes
                {formData.email && formData.email !== originalData.email && (
                  <>
                    <br/>to <strong>{formData.email}</strong>
                  </>
                )}
              </p>
            </div>

            <div className="otp-content">
              <label className="otp-label">Enter 4-digit code</label>
              <input
                type="text"
                className="otp-input"
                value={otp}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  if (value.length <= 4) {
                    setOtp(value);
                    setError('');
                  }
                }}
                placeholder="1234"
                maxLength="4"
                autoFocus
              />

              <button
                className="otp-verify-btn"
                onClick={handleVerifyOtp}
                disabled={verifying || otp.length !== 4}
              >
                {verifying ? (
                  <>
                    <div className="btn-spinner"></div>
                    Verifying...
                  </>
                ) : (
                  'Verify Email'
                )}
              </button>

              <button
                className="otp-resend-btn"
                onClick={handleResendOtp}
                disabled={sendingOtp}
              >
                {sendingOtp ? 'Sending...' : 'Resend Code'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Settings;