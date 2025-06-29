const express = require('express');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const geoip = require('geoip-lite');

const router = express.Router();

// ✅ Consistent path to ../logs folder (outside /routes)
const logsDir = path.join(__dirname, '../logs');
const logPath = path.join(logsDir, 'attempts.csv');

// Helper: Get real client IP
const getClientIp = (req) => {
  return req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.ip;
};

// Helper: Get User Agent string
const getUserAgent = (req) => {
  return req.headers['user-agent'] || 'Unknown';
};

// ✅ Safe log attempt function with error handling
const logAttempt = (data) => {
  const timestamp = new Date().toISOString();
  const geo = geoip.lookup(data.ip) || {};

  const logEntry = {
    id: uuidv4(),
    timestamp,
    ip: data.ip,
    country: geo.country || 'Unknown',
    region: geo.region || 'Unknown',
    city: geo.city || 'Unknown',
    username: data.username || 'Not provided',
    passwordEntered: data.password ? 'YES' : 'NO',
    codeEntered: data.code ? 'YES' : 'NO',
    userAgent: data.userAgent,
    screenResolution: data.screenResolution || 'Unknown',
    referrer: data.referrer || 'Direct'
  };

  try {
    // Ensure logs directory exists
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
      console.log(`[INFO] Created logs directory at ${logsDir}`);
    }

    // If file doesn't exist, write headers first
    if (!fs.existsSync(logPath)) {
      const headers = Object.keys(logEntry).join(',');
      fs.writeFileSync(logPath, headers + '\n');
      console.log('[INFO] Created new log file with headers');
    }

    // Append log entry as CSV row
    const values = Object.values(logEntry).map(v => `"${v}"`).join(',');
    fs.appendFileSync(logPath, values + '\n');
    console.log(`[INFO] Logged phishing attempt for user: ${data.username || 'unknown'}`);
  } catch (err) {
    console.error('[ERROR] Failed to write to log file:', err);
    throw err; // Let caller handle it
  }
};

// ✅ Route: POST /api/login
router.post('/', (req, res) => {
  try {
    const { username, password, code, screenResolution } = req.body;
    const ip = getClientIp(req);
    const userAgent = getUserAgent(req);
    const referrer = req.headers.referer || 'Direct';

    // Debug: check received data
    console.log('[DEBUG] Login attempt received');
    console.log('[DEBUG] Body:', req.body);
    console.log('[DEBUG] IP:', ip);
    console.log('[DEBUG] /api/login route triggered');
    console.log('[DEBUG] Request body:', req.body);

    // Log the phishing attempt
    
    logAttempt({
      ip,
      username,
      password,
      code,
      userAgent,
      screenResolution,
      referrer
    });

    // Respond with redirect info
    res.status(200).json({
      success: true,
      redirect: '/awareness'
    });

  } catch (error) {
    console.error('[ERROR] Exception during login attempt:', error);
    res.status(500).json({
      success: false,
      error: 'Logging failed, but simulation continues.',
      redirect: '/awareness'
    });
  }
});

module.exports = router;
