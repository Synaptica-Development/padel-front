// ForgotPassword.jsx
import React, { useState, useEffect } from 'react';
import { useLanguage } from './LanguageContext';
import { Link } from 'react-router-dom';
import '../styles/Password.css';

const forgotPasswordTranslations = {
  en: {
    resetPassword: 'Reset Password',
    subtitle: 'We\'ll send you a verification code',
    phone: 'Phone Number',
    phonePlaceholder: '+995 XXX XX XX XX',
    verificationCode: 'Verification Code',
    verificationCodePlaceholder: 'Enter 6-digit code',
    newPassword: 'New Password',
    newPasswordPlaceholder: 'Enter new password',
    confirmPassword: 'Confirm Password',
    confirmPasswordPlaceholder: 'Re-enter new password',
    sendCode: 'Send Code',
    resendCode: 'Resend Code',
    verify: 'Verify & Reset',
    backToLogin: 'Back to Login',
    codeSent: 'Code sent to your phone!',
    codeResent: 'Code resent!',
    passwordReset: 'Password reset successful!',
    step1: 'Step 1: Phone Number',
    step2: 'Step 2: Verification',
    step3: 'Step 3: New Password',
    error: 'An error occurred. Please try again.',
    passwordMismatch: 'Passwords do not match!',
    verificationSuccess: 'Code verified successfully!'
  },
  ka: {
    resetPassword: 'პაროლის აღდგენა',
    subtitle: 'ვერიფიკაციის კოდს გამოგიგზავნით',
    phone: 'ტელეფონის ნომერი',
    phonePlaceholder: '+995 XXX XX XX XX',
    verificationCode: 'ვერიფიკაციის კოდი',
    verificationCodePlaceholder: 'შეიყვანეთ 6-ნიშნა კოდი',
    newPassword: 'ახალი პაროლი',
    newPasswordPlaceholder: 'შეიყვანეთ ახალი პაროლი',
    confirmPassword: 'დაადასტურეთ პაროლი',
    confirmPasswordPlaceholder: 'გაიმეორეთ ახალი პაროლი',
    sendCode: 'კოდის გაგზავნა',
    resendCode: 'კოდის ხელახლა გაგზავნა',
    verify: 'ვერიფიკაცია და აღდგენა',
    backToLogin: 'შესვლაზე დაბრუნება',
    codeSent: 'კოდი გამოგზავნილია!',
    codeResent: 'კოდი ხელახლა გამოგზავნილია!',
    passwordReset: 'პაროლი წარმატებით აღდგა!',
    step1: 'ნაბიჯი 1: ტელეფონის ნომერი',
    step2: 'ნაბიჯი 2: ვერიფიკაცია',
    step3: 'ნაბიჯი 3: ახალი პაროლი',
    error: 'შეცდომა მოხდა. გთხოვთ სცადოთ ხელახლა.',
    passwordMismatch: 'პაროლები არ ემთხვევა!',
    verificationSuccess: 'კოდი წარმატებით დადასტურდა!'
  }
};

function ForgotPassword() {
  const { language } = useLanguage();
  const [step, setStep] = useState(1); // 1: phone, 2: verification, 3: new password
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [sessionID, setSessionID] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const API_BASE_URL = 'http://api.padelrocha.synaptica.online';

  const t = forgotPasswordTranslations[language];

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSendCode = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');
    
    try {
      // Step 1: Call request-recover-password to get the key
      console.log('Step 1: Requesting recovery password...');
      const response1 = await fetch(
        `${API_BASE_URL}/api/Auth/request-recover-password?phoneNumber=${phoneNumber}`,
        {
          method: 'GET',
          headers: {
            'accept': '*/*'
          }
        }
      );

      if (!response1.ok) {
        throw new Error('Failed to request password recovery');
      }

      const data1 = await response1.json();
      const key = data1.key;
      
      console.log('Key received:', key);
      
      // Step 2: Call send-otp with the key to actually send the SMS
      console.log('Step 2: Sending OTP...');
      const response2 = await fetch(
        `${API_BASE_URL}/api/Auth/send-otp?key=${encodeURIComponent(key)}`,
        {
          method: 'POST',
          headers: {
            'accept': '*/*'
          }
        }
      );

      if (!response2.ok) {
        throw new Error('Failed to send OTP');
      }

      const otpSent = await response2.json();
      console.log('OTP sent:', otpSent);
      
      // Store the key for later use
      setSessionID(key);
      
      setMessage(t.codeSent);
      setTimeout(() => setMessage(''), 3000);
      setStep(2);
      
    } catch (err) {
      console.error('Error sending code:', err);
      setError(t.error);
      setTimeout(() => setError(''), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setIsLoading(true);
    setError('');
    setMessage('');
    
    try {
      // Step 1: Request new key
      console.log('Resend Step 1: Requesting new recovery key...');
      const response1 = await fetch(
        `${API_BASE_URL}/api/Auth/request-recover-password?phoneNumber=${phoneNumber}`,
        {
          method: 'GET',
          headers: {
            'accept': '*/*'
          }
        }
      );

      if (!response1.ok) {
        throw new Error('Failed to request password recovery');
      }

      const data1 = await response1.json();
      const key = data1.key;
      
      console.log('New key received:', key);
      
      // Step 2: Send OTP with new key
      console.log('Resend Step 2: Sending new OTP...');
      const response2 = await fetch(
        `${API_BASE_URL}/api/Auth/send-otp?key=${encodeURIComponent(key)}`,
        {
          method: 'POST',
          headers: {
            'accept': '*/*'
          }
        }
      );

      if (!response2.ok) {
        throw new Error('Failed to send OTP');
      }

      await response2.json();
      
      // Update the key
      setSessionID(key);
      
      setMessage(t.codeResent);
      setTimeout(() => setMessage(''), 3000);
      
    } catch (err) {
      console.error('Error resending code:', err);
      setError(t.error);
      setTimeout(() => setError(''), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');
    
    try {
      // Step 3: Verify the OTP code to get the JWT sessionID
      console.log('Step 3: Verifying OTP...');
      console.log('Key:', sessionID);
      console.log('OTP:', verificationCode);
      
      const response = await fetch(
        `${API_BASE_URL}/api/Auth/verify-otp?key=${encodeURIComponent(sessionID)}&otp=${verificationCode}`,
        {
          method: 'POST',
          headers: {
            'accept': '*/*'
          }
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Verification failed:', errorData);
        throw new Error(errorData.message || 'Invalid verification code');
      }

      const data = await response.json();
      console.log('Verification successful! JWT sessionID:', data.sessionID);
      
      // Store the JWT sessionID for password change
      setSessionID(data.sessionID);
      
      setMessage(t.verificationSuccess);
      setTimeout(() => setMessage(''), 3000);
      setStep(3);
      
    } catch (err) {
      console.error('Error verifying code:', err);
      setError(err.message || t.error);
      setTimeout(() => setError(''), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (newPassword !== confirmPassword) {
      setError(t.passwordMismatch);
      setTimeout(() => setError(''), 3000);
      return;
    }
    
    setIsLoading(true);
    setError('');
    setMessage('');
    
    try {
      // Step 4: Change password with the JWT sessionID
      console.log('Step 4: Changing password...');
      console.log('Using JWT sessionID:', sessionID);
      
      const response = await fetch(
        `${API_BASE_URL}/api/Auth/change-password`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'accept': '*/*'
          },
          body: JSON.stringify({
            sessionID: sessionID,
            newPassword: newPassword,
            reNewPassword: confirmPassword
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Password change failed:', errorData);
        throw new Error(errorData.message || 'Failed to reset password');
      }

      const data = await response.json();
      console.log('Password changed successfully:', data);

      setMessage(t.passwordReset);
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
      
    } catch (err) {
      console.error('Error resetting password:', err);
      setError(err.message || t.error);
      setTimeout(() => setError(''), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="forgot-password-container">
      {/* Card */}
      <div className="forgot-password-card">
        {/* Progress Indicator */}
        <div className="forgot-password-progress">
          <div className={`progress-step ${step >= 1 ? 'active' : ''}`}>
            <div className="progress-circle">1</div>
            <span className="progress-label">{t.step1}</span>
          </div>
          <div className="progress-line"></div>
          <div className={`progress-step ${step >= 2 ? 'active' : ''}`}>
            <div className="progress-circle">2</div>
            <span className="progress-label">{t.step2}</span>
          </div>
          <div className="progress-line"></div>
          <div className={`progress-step ${step >= 3 ? 'active' : ''}`}>
            <div className="progress-circle">3</div>
            <span className="progress-label">{t.step3}</span>
          </div>
        </div>

        {/* Hero Section */}
        <div className="forgot-password-hero-section">
          <h1 className="forgot-password-title">{t.resetPassword}</h1>
          <p className="forgot-password-subtitle">{t.subtitle}</p>
        </div>

        {/* Message Display */}
        {message && (
          <div className="forgot-password-message">
            {message}
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="forgot-password-message forgot-password-message-error">
            {error}
          </div>
        )}

        {/* Step 1: Phone Number */}
        {step === 1 && (
          <form onSubmit={handleSendCode} className="forgot-password-form">
            <div className="forgot-password-input-group">
              <label className="forgot-password-label">{t.phone}</label>
              <div className="forgot-password-input-wrapper">
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder={t.phonePlaceholder}
                  className="forgot-password-input"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="forgot-password-submit-button"
              disabled={isLoading}
            >
              {isLoading ? 'Sending...' : t.sendCode}
            </button>

            <div className="forgot-password-back-container">
              <Link to="/login" className="forgot-password-back-link">
                ← {t.backToLogin}
              </Link>
            </div>
          </form>
        )}

        {/* Step 2: Verification Code */}
        {step === 2 && (
          <form onSubmit={handleVerifyCode} className="forgot-password-form">
            <div className="forgot-password-input-group">
              <label className="forgot-password-label">{t.verificationCode}</label>
              <div className="forgot-password-input-wrapper">
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder={t.verificationCodePlaceholder}
                  className="forgot-password-input forgot-password-code-input"
                  maxLength="6"
                  required
                  disabled={isLoading}
                />
              </div>
              <p className="forgot-password-code-info">
                Code sent to {phoneNumber}
              </p>
            </div>

            <button 
              type="button" 
              onClick={handleResendCode}
              className="forgot-password-resend-button"
              disabled={isLoading}
            >
              {isLoading ? 'Resending...' : t.resendCode}
            </button>

            <button 
              type="submit" 
              className="forgot-password-submit-button"
              disabled={isLoading}
            >
              {t.verify}
            </button>

            <button 
              type="button"
              onClick={() => setStep(1)}
              className="forgot-password-back-button"
              disabled={isLoading}
            >
              ← Back
            </button>
          </form>
        )}

        {/* Step 3: New Password */}
        {step === 3 && (
          <form onSubmit={handleResetPassword} className="forgot-password-form">
            <div className="forgot-password-input-group">
              <label className="forgot-password-label">{t.newPassword}</label>
              <div className="forgot-password-input-wrapper">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder={t.newPasswordPlaceholder}
                  className="forgot-password-input"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="forgot-password-eye-button"
                  disabled={isLoading}
                >
                  {showNewPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            <div className="forgot-password-input-group">
              <label className="forgot-password-label">{t.confirmPassword}</label>
              <div className="forgot-password-input-wrapper">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t.confirmPasswordPlaceholder}
                  className="forgot-password-input"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="forgot-password-eye-button"
                  disabled={isLoading}
                >
                  {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              className="forgot-password-submit-button"
              disabled={isLoading}
            >
              {isLoading ? 'Resetting...' : t.verify}
            </button>

            <button 
              type="button"
              onClick={() => setStep(2)}
              className="forgot-password-back-button"
              disabled={isLoading}
            >
              ← Back
            </button>
          </form>
        )}
      </div>

      {/* Decorative Elements */}
      <div className="forgot-password-decor-circle-1"></div>
      <div className="forgot-password-decor-circle-2"></div>
    </div>
  );
}

export default ForgotPassword;