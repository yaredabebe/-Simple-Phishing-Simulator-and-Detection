import React from 'react';
import { Link } from 'react-router-dom';
import './AwarenessPage.css';

const AwarenessPage = () => {
  return (
    <div className="awareness-container">
      <div className="awareness-header">
        <div className="security-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#d32f2f" width="48px" height="48px">
            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11V11.99z"/>
            <path d="M11 7h2v6h-2zm0 8h2v2h-2z"/>
          </svg>
        </div>
        <h1>Phishing Simulation Completed</h1>
        <p className="simulation-tag">Security Awareness Training</p>
      </div>

      <div className="awareness-content">
        <div className="alert-banner">
          <div className="alert-icon">⚠️</div>
          <div className="alert-message">
            You interacted with a simulated phishing page designed to test your security awareness.
          </div>
        </div>

        <div className="training-section">
          <h2>What Just Happened?</h2>
          <p>
            You entered credentials into a page that mimicked a legitimate banking login. 
            <strong> In a real attack, this could have compromised your account.</strong>
          </p>
          <div className="simulation-details">
            <h3>Red Flags in This Simulation:</h3>
            <ul className="red-flags-list">
              <li>
                <span className="flag-icon">🔍</span>
                <span className="flag-text">The URL didn't match our official banking domain</span>
              </li>
              <li>
                <span className="flag-icon">📧</span>
                <span className="flag-text">You likely arrived here from a simulated phishing email</span>
              </li>
              <li>
                <span className="flag-icon">⏱️</span>
                <span className="flag-text">The page may have created a false sense of urgency</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="training-section">
          <h2>How to Recognize Phishing Attempts</h2>
          <div className="tips-grid">
            <div className="tip-card">
              <div className="tip-icon">🔒</div>
              <h3>Check the URL</h3>
              <p>Always verify the website address before entering credentials. Look for misspellings or strange domains.</p>
            </div>
            <div className="tip-card">
              <div className="tip-icon">📩</div>
              <h3>Examine Emails</h3>
              <p>Check sender addresses and look for poor grammar or urgent requests for action.</p>
            </div>
            <div className="tip-card">
              <div className="tip-icon">⚠️</div>
              <h3>Watch for Urgency</h3>
              <p>Phishing often creates false urgency ("Your account will be locked!").</p>
            </div>
            <div className="tip-card">
              <div className="tip-icon">📱</div>
              <h3>Verify Requests</h3>
              <p>If unsure, contact the institution through official channels.</p>
            </div>
          </div>
        </div>

        <div className="training-section">
          <h2>What To Do If You Suspect Phishing</h2>
          <ol className="action-steps">
            <li><strong>Don't enter any information</strong> - Close the page immediately</li>
            <li><strong>Report it</strong> - Forward suspicious emails to your security team</li>
            <li><strong>Change passwords</strong> - If you entered real credentials, change them immediately</li>
            <li><strong>Enable 2FA</strong> - Add an extra layer of security to your accounts</li>
          </ol>
        </div>

        <div className="resources-section">
          <h2>Additional Resources</h2>
          <div className="resource-links">
            <a href="#security-policy" className="resource-link">Company Security Policy</a>
            <a href="#phishing-examples" className="resource-link">Examples of Phishing Attacks</a>
            <a href="#report-phishing" className="resource-link">How to Report Phishing</a>
          </div>
        </div>

        <div className="simulation-disclaimer">
          <p>
            <strong>Note:</strong> This was a simulated exercise. No actual credentials were collected or compromised.
            The purpose is to strengthen our collective security awareness.
          </p>
        </div>

        <Link to="/" className="return-button">
          <button className="back-button">
            Return to Safety
          </button>
        </Link>
      </div>
    </div>
  );
};

export default AwarenessPage;