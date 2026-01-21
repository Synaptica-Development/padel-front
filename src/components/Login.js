// Login.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from './LanguageContext';
import '../styles/Login.css';

const loginTranslations = {
  en: {
    welcome: 'Welcome Back',
    subtitle: 'Login to your account',
    phone: 'Phone Number',
    phonePlaceholder: '574065469',
    password: 'Password',
    passwordPlaceholder: 'Enter your password',
    login: 'Login',
    forgotPassword: 'Forgot Password?',
    noAccount: "Don't have an account?",
    register: 'Register Now',
    loginError: 'Invalid phone number or password',
    networkError: 'Connection error. Please try again.',
    loggingIn: 'Logging in...',
    loginSuccess: 'Login successful! Redirecting...',
    fillAllFields: 'Please fill all fields'
  },
  ka: {
    welcome: 'კეთილი იყოს თქვენი დაბრუნება',
    subtitle: 'შედით თქვენს ანგარიშში',
    phone: 'ტელეფონის ნომერი',
    phonePlaceholder: '574065469',
    password: 'პაროლი',
    passwordPlaceholder: 'შეიყვანეთ პაროლი',
    login: 'შესვლა',
    forgotPassword: 'დაგავიწყდა პაროლი?',
    noAccount: 'არ გაქვთ ანგარიში?',
    register: 'რეგისტრაცია',
    loginError: 'არასწორი ტელეფონის ნომერი ან პაროლი',
    networkError: 'კავშირის შეცდომა. გთხოვთ სცადოთ ხელახლა.',
    loggingIn: 'შესვლა...',
    loginSuccess: 'შესვლა წარმატებულია! გადამისამართება...',
    fillAllFields: 'გთხოვთ შეავსოთ ყველა ველი'
  }
};

const API_BASE_URL = 'http://api.padelrocha.synaptica.online';

function Login() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const t = loginTranslations[language];

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    // Validation
    if (!phoneNumber || !password) {
      setError(t.fillAllFields);
      return;
    }

    setIsLoading(true);

    try {
      console.log('Attempting login...');
      
      const response = await fetch(`${API_BASE_URL}/api/Auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'accept': '*/*',
          'X-Language': language // Send language preference
        },
        body: JSON.stringify({
          phonenumber: phoneNumber,
          password: password
        })
      });

      console.log('Login Response Status:', response.status);
      console.log('Login Response OK:', response.ok);

      if (!response.ok) {
        try {
          const errorData = await response.json();
          console.error('Login failed:', errorData);
          const errorMessage = errorData?.message || t.loginError;
          setError(errorMessage);
        } catch (e) {
          console.error('Login failed - no JSON response');
          setError(t.loginError);
        }
        setIsLoading(false);
        return;
      }

      // Parse successful response
      const data = await response.json();
      console.log('Login Response Data:', data);

      if (data?.token) {
        console.log('✅ Login successful - Token received');
        
        // Store the token and expiration with Bearer prefix
        const bearerToken = `Bearer ${data.token}`;
        localStorage.setItem('authToken', bearerToken);
        localStorage.setItem('tokenExpiration', data.expirationDate);
        
        console.log('Token stored successfully');
        
        // Validate token immediately (send just the token without Bearer for validation)
        const isValid = await validateToken(data.token);
        
        if (isValid) {
          console.log('✅ Token validated successfully');
          setSuccessMessage(t.loginSuccess);
          
          // Redirect to user dashboard after a short delay
          setTimeout(() => {
            navigate('/user');
          }, 1500);
        } else {
          console.error('❌ Token validation failed');
          setError('Token validation failed. Please try again.');
          localStorage.removeItem('authToken');
          localStorage.removeItem('tokenExpiration');
        }
      } else {
        console.error('❌ No token in response');
        setError(t.loginError);
      }
    } catch (err) {
      console.error('❌ Login failed - Network or unexpected error:', err);
      setError(t.networkError);
    } finally {
      setIsLoading(false);
    }
  };

  // Validate token function
  const validateToken = async (token) => {
    try {
      console.log('Validating token...');
      
      const response = await fetch(`${API_BASE_URL}/api/Auth/validate-token?token=${encodeURIComponent(token)}`, {
        method: 'GET',
        headers: {
          'accept': '*/*',
          'X-Language': language
        }
      });

      if (response.ok) {
        const isValid = await response.json();
        console.log('Token validation result:', isValid);
        return isValid === true;
      }
      
      return false;
    } catch (err) {
      console.error('Token validation error:', err);
      return false;
    }
  };

  return (
    <div className="login-container">
      {/* Login Card */}
      <div className="login-card">
        {/* Hero Section */}
        <div className="login-hero-section">
          <h1 className="login-title">{t.welcome}</h1>
          <p className="login-subtitle">{t.subtitle}</p>
        </div>

        {/* Form Section */}
        <form onSubmit={handleSubmit} className="login-form">
          {/* Success Message */}
          {successMessage && (
            <div style={{
              padding: '12px',
              marginBottom: '16px',
              backgroundColor: '#d4edda',
              border: '1px solid #c3e6cb',
              borderRadius: '8px',
              color: '#155724',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              {successMessage}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div style={{
              padding: '12px',
              marginBottom: '16px',
              backgroundColor: '#fee',
              border: '1px solid #fcc',
              borderRadius: '8px',
              color: '#c33',
              fontSize: '14px'
            }}>
              {error}
            </div>
          )}

          {/* Phone Number Input */}
          <div className="login-input-group">
            <label className="login-label">{t.phone}</label>
            <div className="login-input-wrapper">
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder={t.phonePlaceholder}
                className="login-input"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="login-input-group">
            <label className="login-label">{t.password}</label>
            <div className="login-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t.passwordPlaceholder}
                className="login-input"
                required
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="login-eye-button"
                disabled={isLoading}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          {/* Forgot Password Link */}
          <div className="login-forgot-password-container">
            <Link to="/password" className="login-forgot-password">
              {t.forgotPassword}
            </Link>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            className="login-submit-button"
            disabled={isLoading}
            style={{
              opacity: isLoading ? 0.7 : 1,
              cursor: isLoading ? 'not-allowed' : 'pointer'
            }}
          >
            {isLoading ? t.loggingIn : t.login}
          </button>

          {/* Register Link */}
          <div className="login-register-container">
            <span className="login-register-text">{t.noAccount}</span>
            {' '}
            <Link to="/register" className="login-register-link">
              {t.register}
            </Link>
          </div>
        </form>
      </div>

      {/* Decorative Elements */}
      <div className="login-decor-circle-1"></div>
      <div className="login-decor-circle-2"></div>
    </div>
  );
}

export default Login;