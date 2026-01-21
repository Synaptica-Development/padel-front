// Register.jsx
import React, { useState } from 'react';
import { useLanguage } from './LanguageContext';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Register.css';

const registerTranslations = {
  en: {
    createAccount: 'Create Account',
    subtitle: 'Join Padel Rocha today',
    firstName: 'First Name',
    firstNamePlaceholder: 'Enter your first name',
    lastName: 'Last Name',
    lastNamePlaceholder: 'Enter your last name',
    phone: 'Phone Number',
    phonePlaceholder: '574065469',
    password: 'Password',
    passwordPlaceholder: 'Must contain at least 1 special character',
    confirmPassword: 'Confirm Password',
    confirmPasswordPlaceholder: 'Re-enter your password',
    verificationCode: 'Verification Code',
    verificationCodePlaceholder: 'Enter code (use 1111 for testing)',
    sendCode: 'Send Code',
    register: 'Verify & Register',
    haveAccount: 'Already have an account?',
    login: 'Login Now',
    codeSent: 'Code sent to your phone!',
    passwordMismatch: 'Passwords do not match!',
    passwordRequirement: 'Password must contain at least one special character (e.g., !, @, #, $)',
    registering: 'Creating account...',
    sendingCode: 'Sending code...',
    registrationSuccess: 'Registration successful! Redirecting to login...',
    registrationError: 'Registration failed. Please try again.',
    fillAllFields: 'Please fill all fields',
    verificationError: 'Verification failed. Please check the code.',
    enterCodeFirst: 'Please enter the verification code',
    endpointNotFound: 'API endpoint not found. Please contact support.'
  },
  ka: {
    createAccount: 'ანგარიშის შექმნა',
    subtitle: 'შემოგვიერთდით დღესვე',
    firstName: 'სახელი',
    firstNamePlaceholder: 'შეიყვანეთ თქვენი სახელი',
    lastName: 'გვარი',
    lastNamePlaceholder: 'შეიყვანეთ თქვენი გვარი',
    phone: 'ტელეფონის ნომერი',
    phonePlaceholder: '574065469',
    password: 'პაროლი',
    passwordPlaceholder: 'უნდა შეიცავდეს სპეციალურ სიმბოლოს',
    confirmPassword: 'დაადასტურეთ პაროლი',
    confirmPasswordPlaceholder: 'გაიმეორეთ პაროლი',
    verificationCode: 'ვერიფიკაციის კოდი',
    verificationCodePlaceholder: 'შეიყვანეთ კოდი (ტესტისთვის 1111)',
    sendCode: 'კოდის გაგზავნა',
    register: 'ვერიფიკაცია და რეგისტრაცია',
    haveAccount: 'უკვე გაქვთ ანგარიში?',
    login: 'შესვლა',
    codeSent: 'კოდი გამოგზავნილია!',
    passwordMismatch: 'პაროლები არ ემთხვევა!',
    passwordRequirement: 'პაროლი უნდა შეიცავდეს მინიმუმ ერთ სპეციალურ სიმბოლოს',
    registering: 'ანგარიში იქმნება...',
    sendingCode: 'კოდი იგზავნება...',
    registrationSuccess: 'რეგისტრაცია წარმატებულია!',
    registrationError: 'რეგისტრაცია ვერ მოხერხდა. სცადეთ თავიდან.',
    fillAllFields: 'გთხოვთ შეავსოთ ყველა ველი',
    verificationError: 'ვერიფიკაცია ვერ მოხერხდა. შეამოწმეთ კოდი.',
    enterCodeFirst: 'გთხოვთ შეიყვანოთ ვერიფიკაციის კოდი',
    endpointNotFound: 'API ვერ მოიძებნა. დაუკავშირდით მხარდაჭერას.'
  }
};

const API_BASE_URL = 'http://api.padelrocha.synaptica.online';

function Register() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [error, setError] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [encryptedKey, setEncryptedKey] = useState('');

  const t = registerTranslations[language];

  // Validate password has at least one special character
  const validatePassword = (pwd) => {
    const specialCharRegex = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;
    return specialCharRegex.test(pwd);
  };

  const handleSendCode = async () => {
    setError('');
    setMessage('');
    
    // Validation
    if (!firstName || !lastName || !phone || !password || !confirmPassword) {
      setError(t.fillAllFields);
      return;
    }

    if (password !== confirmPassword) {
      setError(t.passwordMismatch);
      return;
    }

    if (!validatePassword(password)) {
      setError(t.passwordRequirement);
      return;
    }
    
    setIsSendingCode(true);

    try {
      console.log('Step 1: Registering user...');
      
      // Step 1: Register user
      const registerResponse = await fetch(`${API_BASE_URL}/api/Auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'accept': '*/*'
        },
        body: JSON.stringify({
          name: firstName,
          lastname: lastName,
          phone: phone,
          password: password,
          confirmPassword: confirmPassword
        })
      });

      console.log('Register Response Status:', registerResponse.status);

      if (!registerResponse.ok) {
        try {
          const errorData = await registerResponse.json();
          console.error('Register failed:', errorData);
          
          // Show the actual error message from the server
          const errorMessage = errorData?.message || t.registrationError;
          setError(errorMessage);
        } catch (e) {
          const errorText = await registerResponse.text();
          console.error('Register failed:', errorText);
          setError(t.registrationError);
        }
        setIsSendingCode(false);
        return;
      }

      const registerData = await registerResponse.json();
      console.log('Register Response:', registerData);

      // Extract the key from response
      const key = registerData?.key;
      
      if (!key) {
        console.error('No key in register response:', registerData);
        setError('Registration key not received. Please try again.');
        setIsSendingCode(false);
        return;
      }

      setEncryptedKey(key);
      console.log('✅ Registration successful. Key received:', key);

      // Step 2: Send OTP using the key
      console.log('Step 2: Sending OTP...');
      
      const otpResponse = await fetch(`${API_BASE_URL}/api/Auth/send-otp?key=${encodeURIComponent(key)}`, {
        method: 'POST',
        headers: {
          'accept': '*/*',
        }
      });

      console.log('Send OTP Response Status:', otpResponse.status);

      if (!otpResponse.ok) {
        const errorText = await otpResponse.text();
        console.error('Send OTP failed:', errorText);
        setError('Failed to send OTP. Please try again.');
        setIsSendingCode(false);
        return;
      }

      const otpData = await otpResponse.json();
      console.log('Send OTP Response:', otpData);

      if (otpData === true) {
        console.log('✅ OTP sent successfully');
        setMessage(t.codeSent);
        setCodeSent(true);
        setTimeout(() => setMessage(''), 3000);
      } else {
        setError('Failed to send OTP. Please try again.');
      }
    } catch (err) {
      console.error('❌ Error in registration flow:', err);
      setError(t.registrationError);
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    
    if (!verificationCode) {
      setError(t.enterCodeFirst);
      return;
    }

    if (!encryptedKey) {
      setError('Missing verification key. Please resend the code.');
      return;
    }

    setIsLoading(true);

    try {
      console.log('Step 3: Verifying OTP...');
      console.log('Key:', encryptedKey);
      console.log('OTP:', verificationCode);

      // Step 3: Verify OTP
      const response = await fetch(`${API_BASE_URL}/api/Auth/verify-otp?key=${encodeURIComponent(encryptedKey)}&otp=${encodeURIComponent(verificationCode)}`, {
        method: 'POST',
        headers: {
          'accept': '*/*',
        }
      });

      console.log('Verify OTP Response Status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Verify OTP failed:', errorText);
        setError(t.verificationError);
        setIsLoading(false);
        return;
      }

      const data = await response.json();
      console.log('Verify OTP Response:', data);

      // Store token if provided
      if (data?.token) {
        console.log('✅ Verification successful - Token received');
        localStorage.setItem('token', data.token);
        localStorage.setItem('tokenExpiration', data.expirationDate);
      }
      
      setMessage(t.registrationSuccess);
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (err) {
      console.error('❌ Verification error:', err);
      setError(t.verificationError);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-container">
      {/* Register Card */}
      <div className="register-card">
        {/* Hero Section */}
        <div className="register-hero-section">
          <h1 className="register-title">{t.createAccount}</h1>
          <p className="register-subtitle">{t.subtitle}</p>
        </div>

        {/* Message Display */}
        {message && (
          <div className="register-message success">
            {message}
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="register-message error">
            {error}
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmitForm} className="register-form">
          {/* First Name Input */}
          <div className="register-input-group">
            <label className="register-label">{t.firstName}</label>
            <div className="register-input-wrapper">
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder={t.firstNamePlaceholder}
                className="register-input"
                required
                disabled={isLoading || codeSent}
              />
            </div>
          </div>

          {/* Last Name Input */}
          <div className="register-input-group">
            <label className="register-label">{t.lastName}</label>
            <div className="register-input-wrapper">
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder={t.lastNamePlaceholder}
                className="register-input"
                required
                disabled={isLoading || codeSent}
              />
            </div>
          </div>

          {/* Phone Number Input */}
          <div className="register-input-group">
            <label className="register-label">{t.phone}</label>
            <div className="register-input-wrapper">
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={t.phonePlaceholder}
                className="register-input"
                required
                disabled={isLoading || codeSent}
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="register-input-group">
            <label className="register-label">{t.password}</label>
            <div className="register-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t.passwordPlaceholder}
                className="register-input"
                required
                disabled={isLoading || codeSent}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="register-eye-button"
                disabled={isLoading || codeSent}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          {/* Confirm Password Input */}
          <div className="register-input-group">
            <label className="register-label">{t.confirmPassword}</label>
            <div className="register-input-wrapper">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={t.confirmPasswordPlaceholder}
                className="register-input"
                required
                disabled={isLoading || codeSent}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="register-eye-button"
                disabled={isLoading || codeSent}
              >
                {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          {/* Send Code Button */}
          {!codeSent && (
            <button 
              type="button"
              onClick={handleSendCode}
              className="register-submit-button"
              disabled={isSendingCode || isLoading}
            >
              {isSendingCode ? t.sendingCode : t.sendCode}
            </button>
          )}

          {/* Verification Code Input - Only show after code is sent */}
          {codeSent && (
            <>
              <div className="register-input-group">
                <label className="register-label">{t.verificationCode}</label>
                <div className="register-input-wrapper">
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder={t.verificationCodePlaceholder}
                    className="register-input"
                    maxLength="6"
                    disabled={isLoading}
                    autoFocus
                  />
                </div>
                <p className="register-code-info">
                  Code sent to {phone} (Use 1111 for testing)
                </p>
              </div>

              {/* Verify & Register Button */}
              <button 
                type="submit" 
                className="register-submit-button"
                disabled={isLoading || isSendingCode}
              >
                {isLoading ? t.registering : t.register}
              </button>
            </>
          )}

          {/* Login Link */}
          <div className="register-login-container">
            <span className="register-login-text">{t.haveAccount}</span>
            {' '}
            <Link to="/login" className="register-login-link">
              {t.login}
            </Link>
          </div>
        </form>
      </div>

      {/* Decorative Elements */}
      <div className="register-decor-circle-1"></div>
      <div className="register-decor-circle-2"></div>
    </div>
  );
}

export default Register;