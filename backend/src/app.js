require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

const { connectDB } = require('./config/database');
const { initSocket } = require('./config/socket');
const { specs, swaggerUi } = require('./config/swagger');
const errorHandler = require('./middleware/errorHandler');
const routes = require('./routes');
const { setIo } = require('./services/alert.service');
const { startJobs } = require('./jobs');
const logger = require('./config/logger');

const app = express();
const server = http.createServer(app);

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Routes
app.use('/api/v1', routes);

// Error handler
app.use(errorHandler);

// Socket.io
const io = initSocket(server);
setIo(io);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    startJobs();
    server.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`API docs available at http://localhost:${PORT}/api-docs`);
    });
  } catch (err) {
    logger.error('Failed to start server:', err);
    process.exit(1);
  }
};

startServer();

module.exports = { app, server, io };
