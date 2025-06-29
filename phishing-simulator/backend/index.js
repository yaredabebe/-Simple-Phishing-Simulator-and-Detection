
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const fs = require('fs');
const path = require('path');
const loginRouter = require('./routes/login');

const app = express();
const PORT = 3000;

// Get absolute path to logs directory
const logsDir = path.join(__dirname, 'logs'); // Changed from '../logs'

// Ensure logs directory exists with proper error handling
try {
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
    console.log(`Created logs directory at: ${logsDir}`);
  }
  
  // Test write permissions
  const testFile = path.join(logsDir, 'test.log');
  fs.writeFileSync(testFile, 'Test write operation\n');
  fs.appendFileSync(testFile, 'Test append operation\n');
  fs.unlinkSync(testFile);
  console.log('Verified write permissions to logs directory');
} catch (err) {
  console.error('FATAL: Could not initialize logs directory:', err);
  process.exit(1);
}

// Security middleware
app.use(helmet());
app.use(cors({
  origin: 'http://localhost:5173', // Your Vite frontend
  credentials: true,               // Required for cookies/sessions
  methods: ['GET', 'POST', 'PUT', 'DELETE'] // Allowed methods
}));


// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later'
});
app.use(limiter);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next(); 
});
// Routes
app.use('/api/login', loginRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  // Verify logging is working
  const logPath = path.join(logsDir, 'attempts.csv');
  const loggingWorks = fs.existsSync(logPath);
  
  res.status(200).json({ 
    status: 'healthy',
    logging: loggingWorks ? 'active' : 'inactive'
  });
});


// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Logs directory: ${logsDir}`);
  console.log(`Access health check at: http://localhost:${PORT}/api/health`);
});