import React, { useState } from 'react';
import axios from 'axios';
import './BankLogin.css';

const BankLogin = () => {
  const [loginData, setLoginData] = useState({
    username: '',
    password: '',
    rememberMe: false
  });
  const [authStep, setAuthStep] = useState('credentials'); // 'credentials' or '2fa'
  const [securityCode, setSecurityCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setLoginData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // First authentication step
      const response = await axios.post('api/login', {
        username: loginData.username,
        password: loginData.password,
        deviceInfo: navigator.userAgent
      }, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
          'X-Client-Version': '1.0.0'
        }
      });

      if (response.data.requires2FA) {
        setAuthStep('2fa');
      } else {
        completeAuthentication(response.data);
      }
    } catch (err) {
      handleAuthError(err);
    } finally {
      setLoading(false);
    }
  };

  const handle2FA = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post('https://api.yourbank.com/auth/verify-2fa', {
        code: securityCode,
        sessionToken: localStorage.getItem('tempSession')
      }, {
        withCredentials: true
      });

      completeAuthentication(response.data);
    } catch (err) {
      handleAuthError(err);
    } finally {
      setLoading(false);
    }
  };

  const completeAuthentication = (authData) => {
    localStorage.setItem('authToken', authData.token);
    if (loginData.rememberMe) {
      localStorage.setItem('rememberedUser', loginData.username);
    }
    setSuccess(true);
   
    setTimeout(() => {
      window.location.href = '/awareness?lesson=2fa-bypass';
    }, 1500);
  };

  const handleAuthError = (error) => {
    const errorMessage = error.response?.data?.message || 
                       error.message || 
                       'Authentication failed. Please try again.';
    setError(errorMessage);
    
    // Log detailed error for debugging
    console.error('Auth Error:', {
      status: error.response?.status,
      data: error.response?.data,
      config: error.config
    });
  };

  const handlePasswordReset = () => {
    // Implement password reset flow
    console.log('Initiating password reset');
  };

  return (
    <div className="bank-login-container">
      <div className="bank-header">
        <div className="bank-logo">
          {/* <img src="/logo.png" alt="Global Trust Bank" /> */}
          <h1>CB Trust Bank</h1>
        </div>
        {/* <div className="security-badge">
          <span className="secure-connection">
            <i className="fas fa-lock"></i> Secure Connection
          </span>
        </div> */}
      </div>

      <div className="login-card">
        {!success ? (
          <>
            <h2>Online Banking Login</h2>
            
            {authStep === 'credentials' ? (
              <form onSubmit={handleLogin} className="login-form">
                {error && <div className="alert alert-danger">{error}</div>}

                <div className="form-group">
                  <label htmlFor="username">Username</label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={loginData.username}
                    onChange={handleInputChange}
                    required
                    autoComplete="username"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="password">Password</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={loginData.password}
                    onChange={handleInputChange}
                    required
                    autoComplete="current-password"
                  />
                </div>

                <div className="form-options">
                  <div className="remember-me">
                    <input
                      type="checkbox"
                      id="rememberMe"
                      name="rememberMe"
                      checked={loginData.rememberMe}
                      onChange={handleInputChange}
                    />
                    <label htmlFor="rememberMe">Remember my username</label>
                  </div>
                  <button 
                    type="button" 
                    className="forgot-password"
                    onClick={handlePasswordReset}
                  >
                    Forgot Password?
                  </button>
                </div>

                <button 
                  type="submit" 
                  className="login-button"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner"></span> Signing In...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handle2FA} className="auth-form">
                <h3>Two-Factor Authentication</h3>
                <p>Enter the 6-digit code sent to your registered device</p>
                
                {error && <div className="alert alert-danger">{error}</div>}

                <div className="form-group">
                  <label htmlFor="securityCode">Security Code</label>
                  <input
                    type="text"
                    id="securityCode"
                    name="securityCode"
                    value={securityCode}
                    onChange={(e) => setSecurityCode(e.target.value)}
                    required
                    maxLength="6"
                    pattern="\d{6}"
                  />
                </div>

                <div className="form-actions">
                  <button 
                    type="button" 
                    className="secondary-button"
                    onClick={() => setAuthStep('credentials')}
                  >
                    Back
                  </button>
                  <button 
                    type="submit" 
                    className="login-button"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner"></span> Verifying...
                      </>
                    ) : (
                      'Verify'
                    )}
                  </button>
                </div>
              </form>
            )}

            <div className="security-tips">
              <h4>Security Tips:</h4>
              <ul>
                <li>Never share your login credentials</li>
                <li>Always log out after your session</li>
                <li>Ensure you're on our official website</li>
              </ul>
            </div>
          </>
        ) : (
          <div className="login-success">
            <div className="success-icon">
              <i className="fas fa-check-circle"></i>
            </div>
            <h3>Login Successful</h3>
            <p>Redirecting to your account...</p>
          </div>
        )}
      </div>

      <div className="bank-footer">
        <div className="footer-links">
          <a href="/security">Security Center</a>
          <a href="/privacy">Privacy Policy</a>
          <a href="/terms">Terms of Use</a>
          <a href="/contact">Contact Us</a>
        </div>
        <div className="copyright">
          © {new Date().getFullYear()} CB Trust Bank. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default BankLogin;