const { Server } = require('socket.io');
const { Agent } = require('../models');
const { verifyAccessToken } = require('../utils/jwt');
const logger = require('./logger');
const alertService = require('../services/alert.service');

const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
    },
  });

  alertService.setIo(io);

  io.on('connection', async (socket) => {
    const { token, agentKey } = socket.handshake.auth;

    if (agentKey) {
      try {
        const agent = await Agent.findOne({ where: { agentKey } });
        if (agent) {
          socket.join(`agent:${agent.id}`);
          logger.info(`Agent ${agent.id} connected via socket`);
        } else {
          socket.disconnect(true);
        }
      } catch (err) {
        logger.error('Socket agent auth error:', err);
        socket.disconnect(true);
      }
    } else if (token) {
      try {
        const decoded = await verifyAccessToken(token);
        socket.join('admins');
        logger.info(`User ${decoded.userId} connected via socket`);
      } catch (err) {
        logger.error('Socket user auth error:', err);
        socket.disconnect(true);
      }
    } else {
      socket.disconnect(true);
    }

    socket.on('agent:register', (agentId) => {
      socket.join(`agent:${agentId}`);
    });

    socket.on('agent:heartbeat', () => {
    });

    socket.on('killswitch:confirm', (data) => {
    });

    socket.on('disconnect', () => {
      logger.info('Socket disconnected:', socket.id);
    });
  });

  return io;
};

module.exports = { initSocket };
