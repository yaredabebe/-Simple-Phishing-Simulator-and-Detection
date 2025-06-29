import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './FakeLogin.css';
import axios from 'axios';
const FakeLogin = () => {

  const [step, setStep] = useState(1);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(120);
  const [showRedFlags, setShowRedFlags] = useState(false);
  const [show2FABypass, setShow2FABypass] = useState(false);
  const [isHoveringSecurity, setIsHoveringSecurity] = useState(false);
  const navigate = useNavigate();
const [backendConnected, setBackendConnected] = useState(false);

 useEffect(() => {
    if (step === 1) return;
    const timer = timeLeft > 0 && setInterval(() => setTimeLeft(timeLeft - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, step]);

  useEffect(() => {
  const checkBackend = async () => {
    try {
      await axios.get('/api/healthcheck');
      setBackendConnected(true);
    } catch (error) {
      setBackendConnected(false);
      console.error('Backend not available:', error);
    }
  };
  checkBackend();
}, []);
  const handleStepOne = (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please enter both username and password');
      return;
    }
    setError('');
    setStep(2);
  };
const handleStepTwo = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    if (code === 'BYPASS2FA') {
      setShow2FABypass(true);
      setLoading(false);
      return;
    }

    const response = await axios.post('http://localhost:3000/api/login', {
      username,
      password,
      code,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
    }, {
      withCredentials: true,  
      headers: {
        'Content-Type': 'application/json'
      }
    });

    navigate(response.data.redirect || '/awareness');
  } catch (err) {
    // Enhanced error logging
    console.error('Full error:', err);
    console.error('Response data:', err.response?.data);
    setError(err.response?.data?.message || 'Verification failed. Please try again.');
  } finally {
    setLoading(false);
  }
};

  const revealRedFlags = () => {
    setShowRedFlags(true);
  };

  const simulateLockout = () => {
    setError('Account locked: Too many failed attempts. Contact support.');
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate('/awareness?reason=lockout');
    }, 2000);
  };


  return (
    <div className="bank-login-container">
     
      <div className="bank-header">
        <div className="bank-logo">
          <i className="fas fa-university"></i> Global Trust Bank
        </div>
        <div className="bank-slogan">Your security is our priority</div>
      </div>
      
     
      <div className="login-card">
       
        <div className={`urgent-alert ${step === 2 ? 'blink' : ''}`}>
          <i className="fas fa-exclamation-triangle"></i>
          <span>ACTION REQUIRED: Suspicious login attempt detected</span>
        </div>

        {/* 2FA Bypass Educational Demo */}
        {show2FABypass ? (
          <div className="bypass-demo">
            <h3><i className="fas fa-user-shield"></i> 2FA Bypass Demonstration</h3>
            <div className="attack-flow">
              <div className="flow-step">
                <div className="step-number">1</div>
                <p>You entered credentials on fake page</p>
              </div>
              <div className="flow-arrow">→</div>
              <div className="flow-step">
                <div className="step-number">2</div>
                <p>Hackers used them in real-time on real site</p>
              </div>
              <div className="flow-arrow">→</div>
              <div className="flow-step">
                <div className="step-number">3</div>
                <p>Your 2FA code authenticated THEIR session</p>
              </div>
            </div>
            
            <div className="protection-tips">
              <h4><i className="fas fa-shield-alt"></i> How to Really Protect Yourself:</h4>
              <ul>
                <li><strong>Use hardware security keys</strong> (YubiKey, Titan)</li>
                <li><strong>Verify all 2FA requests</strong> - Did you initiate this login?</li>
                <li><strong>Check login locations</strong> - Unknown devices?</li>
                <li><strong>Never approve unexpected 2FA prompts</strong></li>
              </ul>
            </div>
            
            <button 
              className="continue-btn"
              onClick={() => navigate('/awareness?lesson=2fa-bypass')}
            >
              Continue to Full Training <i className="fas fa-arrow-right"></i>
            </button>
          </div>
        ) : (
          <>
            {/* Security notice with hover effect */}
            <div 
              className="security-notice"
              onMouseEnter={() => setIsHoveringSecurity(true)}
              onMouseLeave={() => setIsHoveringSecurity(false)}
            >
              <i className="fas fa-lock"></i>
              <span>Secure connection {isHoveringSecurity && '(Simulated)'}</span>
            </div>

            {/* Step 1: Credential Collection */}
            {step === 1 && (
              <form onSubmit={handleStepOne} className="login-form">
                <h2><i className="fas fa-sign-in-alt"></i> Online Banking Login</h2>
                
                <div className="input-group">
                  <label htmlFor="username">
                    <i className="fas fa-user"></i> Username
                  </label>
                  <input
                    id="username"
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoComplete="username"
                    required
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="password">
                    <i className="fas fa-key"></i> Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                  />
                  <div className="forgot-password">
                    <a href="#forgot" onClick={(e) => {
                      e.preventDefault();
                      simulateLockout();
                    }}>
                      <i className="fas fa-question-circle"></i> Forgot Password?
                    </a>
                  </div>
                </div>

                {error && <div className="error-message">
                  <i className="fas fa-exclamation-circle"></i> {error}
                </div>}

                <button type="submit" className="login-button">
                  {loading ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i> Verifying...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-arrow-right"></i> Continue
                    </>
                  )}
                </button>

                {/* Educational Red Flags Button */}
                <div className="red-flags-section">
                  <button 
                    type="button" 
                    className="analyze-btn"
                    onClick={revealRedFlags}
                  >
                    <i className="fas fa-search"></i> Show Me the Red Flags
                  </button>

                  {showRedFlags && (
                    <div className="red-flags-list">
                      <h4><i className="fas fa-flag"></i> Phishing Indicators:</h4>
                      <ul>
                        <li>
                          <i className="fas fa-times-circle red-flag-icon"></i>
                          <strong>URL mismatch:</strong> This isn't our real domain
                        </li>
                        <li>
                          <i className="fas fa-times-circle red-flag-icon"></i>
                          <strong>False urgency:</strong> "ACTION REQUIRED" alerts
                        </li>
                        <li>
                          <i className="fas fa-times-circle red-flag-icon"></i>
                          <strong>No proper SSL:</strong> Padlock is simulated
                        </li>
                        <li>
                          <i className="fas fa-times-circle red-flag-icon"></i>
                          <strong>Generic branding:</strong> Lacks your real bank's details
                        </li>
                      </ul>
                    </div>
                  )}
                </div>

                {/* Security Tips */}
                <div className="security-tips">
                  <h4><i className="fas fa-shield-alt"></i> Real Security Practices:</h4>
                  <ul>
                    <li>
                      <i className="fas fa-check-circle green-flag-icon"></i>
                      <strong>Bookmark official sites:</strong> Never Google for login pages
                    </li>
                    <li>
                      <i className="fas fa-check-circle green-flag-icon"></i>
                      <strong>Check for HTTPS:</strong> Look for <code>https://</code> and padlock
                    </li>
                    <li>
                      <i className="fas fa-check-circle green-flag-icon"></i>
                      <strong>Use password managers:</strong> They won't autofill fake sites
                    </li>
                  </ul>
                </div>
              </form>
            )}

            {/* Step 2: 2FA Collection */}
            {step === 2 && (
              <form onSubmit={handleStepTwo} className="login-form">
                <div className="two-factor-auth">
                  <h2><i className="fas fa-mobile-alt"></i> Two-Factor Authentication</h2>
                  
                  <div className="timer-warning">
                    <i className="fas fa-clock"></i>
                    <span>Time remaining: {Math.floor(timeLeft/60)}:{String(timeLeft%60).padStart(2, '0')}</span>
                  </div>
                  
                  <p>For your security, we've sent a 6-digit code to your registered device.</p>
                  
                  <div className="input-group">
                    <label htmlFor="code">
                      <i className="fas fa-sms"></i> Verification Code
                    </label>
                    <input
                      id="code"
                      type="text"
                      placeholder="Enter 6-digit code"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      required
                    />
                  </div>

                  <div className="resend-options">
                    <a href="#resend" onClick={(e) => e.preventDefault()}>
                      <i className="fas fa-redo"></i> Resend Code
                    </a>
                    <a href="#different" onClick={(e) => e.preventDefault()}>
                      <i className="fas fa-phone-alt"></i> Call Me Instead
                    </a>
                  </div>

                  {/* Special note for security training */}
                  <div className="training-note">
                    <p>
                      <i className="fas fa-graduation-cap"></i> <strong>Training Tip:</strong> Try entering 
                      <code>BYPASS2FA</code> to see how attackers circumvent two-factor authentication.
                    </p>
                  </div>

                  {error && <div className="error-message">
                    <i className="fas fa-exclamation-circle"></i> {error}
                  </div>}

                  <button 
                    type="submit" 
                    className="verify-button"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <i className="fas fa-spinner fa-spin"></i> Verifying...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-check-circle"></i> Complete Login
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </>
        )}

       
        <div className="training-disclaimer">
          <p>
            <i className="fas fa-info-circle"></i> <strong>This is a security training exercise.</strong>{' '}
            No real credentials are collected or stored. This simulation is part of our phishing awareness program.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="bank-footer">
        <div className="footer-links">
          <a href="#security"><i className="fas fa-shield-alt"></i> Security</a>
          <a href="#privacy"><i className="fas fa-user-secret"></i> Privacy</a>
          <a href="#terms"><i className="fas fa-file-alt"></i> Terms</a>
          <a href="#help"><i className="fas fa-question-circle"></i> Help</a>
        </div>
        <div className="copyright">
          <i className="far fa-copyright"></i> 2023 Global Trust Bank. All Rights Reserved.
        </div>
      </div>
    </div>
  );
};

export default FakeLogin;