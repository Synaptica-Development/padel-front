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
    registrationSuccess: 'Registration successful!',
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

const API_BASE_URL = 'http://16.171.12.216:5000/api';

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
      // Step 1: Register and get key
      const registerResponse = await fetch(`${API_BASE_URL}/Auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: firstName,
          lastname: lastName,
          phone: phone,
          password: password,
          confirmPassword: confirmPassword
        })
      });

      const contentType = registerResponse.headers.get("content-type");
      let registerData = null;
      
      if (contentType && contentType.includes("application/json")) {
        registerData = await registerResponse.json();
      }

      if (!registerResponse.ok) {
        setError(registerData?.message || t.registrationError);
        setIsSendingCode(false);
        return;
      }

      // Extract the key from response
      const key = registerData?.key;
      
      if (!key) {
        console.error('No key in register response:', registerData);
        setError('Registration key not received. Please try again.');
        setIsSendingCode(false);
        return;
      }

      setEncryptedKey(key);
      console.log('Encrypted key received:', key);

      // Step 2: Automatically send OTP using the key
      const otpResponse = await fetch(`${API_BASE_URL}/Auth/send-otp?key=${encodeURIComponent(key)}`, {
        method: 'POST',
        headers: {
          'accept': '*/*',
        }
      });

      if (otpResponse.ok) {
        setMessage(t.codeSent);
        setCodeSent(true);
        setTimeout(() => setMessage(''), 3000);
      } else {
        setError('Failed to send OTP. Please try again.');
      }
    } catch (err) {
      console.error('Send code error:', err);
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
      setError(t.fillAllFields);
      return;
    }

    if (!encryptedKey) {
      setError('Missing verification key. Please resend the code.');
      return;
    }

    setIsLoading(true);

    try {
      // Step 3: Verify OTP
      const response = await fetch(`${API_BASE_URL}/Auth/verify-otp?key=${encodeURIComponent(encryptedKey)}&otp=${encodeURIComponent(verificationCode)}`, {
        method: 'POST',
        headers: {
          'accept': '*/*',
        }
      });

      console.log('Verify OTP Response Status:', response.status);
      console.log('Verify OTP Response OK:', response.ok);

      // Handle 404 specifically
      if (response.status === 404) {
        console.error('Endpoint not found. Check if the API path is correct.');
        setError(t.endpointNotFound + ' (Endpoint: /Auth/verify-otp)');
        setIsLoading(false);
        return;
      }

      const contentType = response.headers.get("content-type");
      let data = null;
      
      if (contentType && contentType.includes("application/json")) {
        try {
          data = await response.json();
          console.log('Verify OTP Response Data:', data);
        } catch (jsonError) {
          console.error('JSON parse error:', jsonError);
          // If response status is 2xx but JSON parsing fails
          if (response.ok) {
            console.log('✅ Registration successful (no JSON response)');
            setMessage(t.registrationSuccess);
            setTimeout(() => {
              navigate('/login');
            }, 2000);
            setIsLoading(false);
            return;
          }
          // If response is not ok and JSON parsing fails
          console.error('❌ Registration failed - Invalid response format');
          setError(t.verificationError + ' (Invalid response format)');
          setIsLoading(false);
          return;
        }
      }

      // Check if response is successful (status 200-299)
      if (response.ok) {
        // Store token if provided
        if (data?.token) {
          console.log('✅ Registration successful - Token received:', data.token);
          // You can store this token in localStorage if needed
          // localStorage.setItem('token', data.token);
        } else {
          console.log('✅ Registration successful - No token in response');
        }
        
        setMessage(t.registrationSuccess);
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        // Response is not ok (status 400, 401, 500, etc.)
        const errorMessage = data?.message || data?.error || `Error ${response.status}: ${response.statusText}`;
        console.error('❌ Registration failed:', {
          status: response.status,
          statusText: response.statusText,
          errorMessage: errorMessage,
          fullResponse: data
        });
        setError(t.verificationError + ` (${errorMessage})`);
      }
    } catch (err) {
      console.error('❌ Registration failed - Network or unexpected error:', err);
      setError(t.verificationError + ' (Network error)');
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
                  Code sent to {phone}
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