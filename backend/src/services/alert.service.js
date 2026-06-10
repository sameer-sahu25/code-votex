let io = null;

const setIo = (socketIo) => {
  io = socketIo;
};

const emitCanaryAlert = (agentId, alert) => {
  if (io) {
    io.to(`agent:${agentId}`).emit('canary:alert', alert);
    io.to('admins').emit('canary:alert', alert);
  }
};

const emitEntropyAnomaly = (agentId, event) => {
  if (io) {
    io.to(`agent:${agentId}`).emit('entropy:anomaly', event);
    io.to('admins').emit('entropy:anomaly', event);
  }
};

const emitProcessSuspicious = (agentId, processEvent) => {
  if (io) {
    io.to(`agent:${agentId}`).emit('process:suspicious', processEvent);
    io.to('admins').emit('process:suspicious', processEvent);
  }
};

const emitThreatScoreUpdate = (agentId, threatScore) => {
  if (io) {
    io.to(`agent:${agentId}`).emit('threat:score', threatScore);
    io.to('admins').emit('threat:score', threatScore);
  }
};

const emitKillSwitchTriggered = (agentId, log) => {
  if (io) {
    io.to(`agent:${agentId}`).emit('killswitch:triggered', log);
    io.to('admins').emit('killswitch:triggered', log);
  }
};

const emitKillSwitchRestore = (agentId, log) => {
  if (io) {
    io.to(`agent:${agentId}`).emit('killswitch:restore', log);
    io.to('admins').emit('killswitch:restore', log);
  }
};

const emitAgentStatus = (agentId, status) => {
  if (io) {
    io.to(`agent:${agentId}`).emit('agent:status', { agentId, status, timestamp: new Date() });
    io.to('admins').emit('agent:status', { agentId, status, timestamp: new Date() });
  }
};

module.exports = {
  setIo,
  emitCanaryAlert,
  emitEntropyAnomaly,
  emitProcessSuspicious,
  emitThreatScoreUpdate,
  emitKillSwitchTriggered,
  emitKillSwitchRestore,
  emitAgentStatus
};
