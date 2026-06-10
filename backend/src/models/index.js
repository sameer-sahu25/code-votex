const User = require('./User');
const Agent = require('./Agent');
const CanaryFile = require('./CanaryFile');
const CanaryAlert = require('./CanaryAlert');
const EntropyEvent = require('./EntropyEvent');
const ProcessEvent = require('./ProcessEvent');
const ThreatScore = require('./ThreatScore');
const KillSwitchLog = require('./KillSwitchLog');
const AuditLog = require('./AuditLog');

// User associations
User.hasMany(Agent, { foreignKey: 'userId' });
Agent.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(AuditLog, { foreignKey: 'userId' });
AuditLog.belongsTo(User, { foreignKey: 'userId' });

// Agent associations
Agent.hasMany(CanaryFile, { foreignKey: 'agentId' });
CanaryFile.belongsTo(Agent, { foreignKey: 'agentId' });

Agent.hasMany(CanaryAlert, { foreignKey: 'agentId' });
CanaryAlert.belongsTo(Agent, { foreignKey: 'agentId' });

Agent.hasMany(EntropyEvent, { foreignKey: 'agentId' });
EntropyEvent.belongsTo(Agent, { foreignKey: 'agentId' });

Agent.hasMany(ProcessEvent, { foreignKey: 'agentId' });
ProcessEvent.belongsTo(Agent, { foreignKey: 'agentId' });

Agent.hasMany(ThreatScore, { foreignKey: 'agentId' });
ThreatScore.belongsTo(Agent, { foreignKey: 'agentId' });

Agent.hasMany(KillSwitchLog, { foreignKey: 'agentId' });
KillSwitchLog.belongsTo(Agent, { foreignKey: 'agentId' });

Agent.hasMany(AuditLog, { foreignKey: 'agentId' });
AuditLog.belongsTo(Agent, { foreignKey: 'agentId' });

// CanaryFile associations
CanaryFile.hasMany(CanaryAlert, { foreignKey: 'canaryFileId' });
CanaryAlert.belongsTo(CanaryFile, { foreignKey: 'canaryFileId' });

// CanaryAlert associations
CanaryAlert.belongsTo(User, { foreignKey: 'acknowledgedBy', as: 'acknowledger' });

// KillSwitchLog associations
KillSwitchLog.belongsTo(User, { foreignKey: 'triggeredByUserId', as: 'triggeredByUser' });

module.exports = {
  User,
  Agent,
  CanaryFile,
  CanaryAlert,
  EntropyEvent,
  ProcessEvent,
  ThreatScore,
  KillSwitchLog,
  AuditLog,
};
