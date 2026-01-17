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
      const response = await fetch(`${API_BASE_URL}/Auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phonenumber: phoneNumber,
          password: password
        })
      });

      console.log('Login Response Status:', response.status);
      console.log('Login Response OK:', response.ok);

      const contentType = response.headers.get("content-type");
      let data = null;
      
      if (contentType && contentType.includes("application/json")) {
        try {
          data = await response.json();
          console.log('Login Response Data:', data);
        } catch (jsonError) {
          console.error('JSON parse error:', jsonError);
          // If response is ok but JSON parsing fails
          if (response.ok) {
            console.log('✅ Login successful (no JSON response)');
            setSuccessMessage(t.loginSuccess);
            setTimeout(() => {
              navigate('/');
            }, 1500);
            setIsLoading(false);
            return;
          }
          // If response is not ok and JSON parsing fails
          console.error('❌ Login failed - Invalid response format');
          setError(t.loginError + ' (Invalid response format)');
          setIsLoading(false);
          return;
        }
      }

      if (response.ok) {
        // Login successful
        console.log('✅ Login successful');
        
        // Store the token in localStorage
        if (data?.token) {
          localStorage.setItem('authToken', data.token);
          console.log('Token stored:', data.token);
        }
        
        // Store expiration date if provided
        if (data?.expirationDate) {
          localStorage.setItem('tokenExpiration', data.expirationDate);
          console.log('Token expiration:', data.expirationDate);
        }
        
        // Store any additional user data if provided
        if (data?.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
          console.log('User data stored:', data.user);
        }
        
        setSuccessMessage(t.loginSuccess);
        
        // Redirect to home page after a short delay
        setTimeout(() => {
          navigate('/');
        }, 1500);
      } else {
        // Login failed
        const errorMessage = data?.message || data?.error || `Error ${response.status}: ${response.statusText}`;
        console.error('❌ Login failed:', {
          status: response.status,
          statusText: response.statusText,
          errorMessage: errorMessage,
          fullResponse: data
        });
        setError(errorMessage || t.loginError);
      }
    } catch (err) {
      console.error('❌ Login failed - Network or unexpected error:', err);
      setError(t.networkError);
    } finally {
      setIsLoading(false);
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