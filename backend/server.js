const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '.env'), quiet: true });

const express = require('express');
const http = require('http');
const fs = require('fs');
const cors = require('cors');
const helmet = require('helmet');
const hpp = require('hpp');
const rateLimit = require('express-rate-limit');
const socketIO = require('socket.io');
const bcrypt = require('bcrypt');

const { initializeDatabaseWithRetry, testConnection, closePool } = require('./config/database');
const upload = require('./middleware/upload');
const errorHandler = require('./middleware/errorHandler');
const User = require('./models/User');

const authRoutes = require('./routes/auth');
const doctorsRoutes = require('./routes/doctors');
const appointmentRoutes = require('./routes/appointments');
const userRoutes = require('./routes/users');
const consultationRoutes = require('./routes/consultations');
const suggestionsRoutes = require('./routes/suggestions');
const petRoutes = require('./routes/pets');
const reportsRoutes = require('./routes/reports');
const userReportsRoutes = require('./routes/userReports');
const doctorAccessRoutes = require('./routes/doctorAccess');
const adminRoutes = require('./routes/adminRoutes');
const adminChatRoutes = require('./routes/adminChat');
const chatRoutes = require('./routes/chat');



const app = express();
const server = http.createServer(app);
const corsOrigins = Array.from(new Set([
  process.env.FRONTEND_URL || 'http://localhost:5173',
  ...(process.env.CORS_ORIGIN || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
]));

function isAllowedOrigin(origin) {
  // Allow same-origin/non-browser clients (curl, Postman, mobile apps).
  if (!origin) return true;
  if (corsOrigins.includes(origin)) return true;

  // In development, allow any localhost/127.0.0.1 port to avoid Vite port drift issues.
  if (
    process.env.NODE_ENV !== 'production' &&
    /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin)
  ) {
    return true;
  }

  return false;
}


const io = socketIO(server, {
  cors: {
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error(`Not allowed by CORS: ${origin}`));
    },
    methods: ['GET', 'POST'],
    credentials: true
  }
});

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX || 500),
  standardHeaders: true,
  legacyHeaders: false
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20
});

app.use(cors({
  origin: (origin, callback) => {
    if (isAllowedOrigin(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error(`Not allowed by CORS: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Doctor-Link']
}));

app.use(helmet());
app.use(hpp());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static(uploadsDir));
app.use(limiter);
app.use('/api/auth', authLimiter);

app.set('io', io);

io.on('connection', (socket) => {
  // ─── Consultation chat (doctor ↔ user per appointment) ───
  socket.on('join_consultation', (data) => {
    socket.join(data.consultationId);
    socket.to(data.consultationId).emit('user_joined', data);
  });

  socket.on('send_message', (data) => {
    if (data && data.chatId) {
      socket.to(`chat_${data.chatId}`).emit('receive_message', data);
      return;
    }

    socket.to(data.consultationId).emit('receive_message', data);
  });

  socket.on('join_chat', ({ chatId }) => {
    if (chatId) {
      socket.join(`chat_${chatId}`);
    }
  });

  socket.on('typing_start', (data) => {
    socket.to(data.consultationId).emit('user_typing', data);
  });

  socket.on('typing_stop', (data) => {
    socket.to(data.consultationId).emit('user_stopped_typing', data);
  });

  // ─── Admin direct chat rooms ───
  socket.on('join_admin_chat', ({ userId, role }) => {
    if (role === 'admin') {
      socket.join('admin_room');
    }
    if (userId) {
      socket.join(`admin_chat_${userId}`);
    }
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorsRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/consultations', consultationRoutes);
app.use('/api', suggestionsRoutes);
app.use('/api/pets', petRoutes);
app.use('/api/users', userRoutes);
app.use('/api/user', userReportsRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/doctor-access', doctorAccessRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin-chat', adminChatRoutes);
app.use('/api/chat', chatRoutes);



app.post('/api/upload', upload.single, (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  return res.json({
    success: true,
    file: {
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
      url: `/uploads/${req.file.filename}`
    }
  });
});

app.get('/api', (req, res) => {
  res.json({
    message: 'SmartVet API is running',
    health: '/api/health'
  });
});

app.get('/api/health', async (req, res) => {
  try {
    const result = await testConnection();
    res.json({
      success: true,
      message: 'SmartVet MySQL backend is healthy',
      timestamp: new Date().toISOString(),
      database: result.database_name || process.env.DB_NAME || process.env.MYSQL_DATABASE || 'smartvet',
      databaseAvailable: true,
      port: app.locals.port || Number(process.env.PORT || 5000),
      socketConnections: io.engine.clientsCount
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      message: 'Database health check failed',
      databaseAvailable: false,
      error: error.message
    });
  }
});

app.use((req, res) => {
  res.status(404).json({
    message: 'API endpoint not found'
  });
});

app.use(errorHandler);

const DEFAULT_PORT = Number(process.env.PORT || 5000);
const MAX_PORT_ATTEMPTS = Number(process.env.PORT_FALLBACK_ATTEMPTS || 10);

function listenOnPort(port) {
  return new Promise((resolve, reject) => {
    const onError = (error) => {
      server.off('listening', onListening);
      reject(error);
    };
    const onListening = () => {
      server.off('error', onError);
      resolve(port);
    };

    server.once('error', onError);
    server.once('listening', onListening);
    server.listen(port);
  });
}

async function startListening(preferredPort) {
  let port = preferredPort;

  for (let attempt = 0; attempt < MAX_PORT_ATTEMPTS; attempt += 1) {
    try {
      await listenOnPort(port);
      app.locals.port = port;
      return port;
    } catch (error) {
      if (error.code === 'EADDRINUSE') {
        console.warn(`Port ${port} is already in use. Trying port ${port + 1}...`);
        port += 1;
        continue;
      }
      throw error;
    }
  }

  throw new Error(`Unable to bind server after ${MAX_PORT_ATTEMPTS} attempts starting at port ${preferredPort}.`);
}

async function start() {
  app.locals.databaseAvailable = false;

  try {
    await initializeDatabaseWithRetry();
    const result = await testConnection();
    await ensureAdminUser();
    app.locals.databaseAvailable = true;
    console.log(`MySQL connection established. Database: ${result.database_name}`);
  } catch (error) {
    app.locals.databaseAvailable = false;
    console.warn(`Database unavailable at startup: ${error.message}`);
  }

  const activePort = await startListening(DEFAULT_PORT);
  console.log(`SmartVet backend running on port ${activePort}`);

  server.on('error', (error) => {
    console.error('Server runtime error:', error);
  });
}

async function ensureAdminUser() {
  const email = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD || '';

  if (!email || !password) {
    console.warn('Skipping admin seed: ADMIN_EMAIL or ADMIN_PASSWORD is missing.');
    return;
  }

  const existingAdmin = await User.findByEmail(email, { includePassword: true });
  if (existingAdmin) {
    if (existingAdmin.role !== 'admin') {
      console.warn(`Admin seed skipped: ${email} already exists with role ${existingAdmin.role}.`);
    } else {
      console.log(`Admin user already exists: ${email}`);
    }
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const adminUser = await User.create({
    name: 'SmartVet Platform Admin',
    email,
    mobile: null,
    password: hashedPassword,
    petName: null,
    role: 'admin'
  });

  console.log(`Admin user seeded successfully: ${adminUser.email} (ID: ${adminUser.id})`);
}

function gracefulShutdown(signal) {
  console.log(`Received ${signal}. Shutting down gracefully...`);
  server.close(async () => {
    await closePool();
    process.exit(0);
  });

  setTimeout(() => process.exit(1), 10000);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

start().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
