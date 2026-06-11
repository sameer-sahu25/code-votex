const User = require('./User');
const Agent = require('./Agent');
const CanaryFile = require('./CanaryFile');
const CanaryAlert = require('./CanaryAlert');
const EntropyEvent = require('./EntropyEvent');
const ProcessEvent = require('./ProcessEvent');
const ThreatScore = require('./ThreatScore');
const KillSwitchLog = require('./KillSwitchLog');
const AuditLog = require('./AuditLog');

// Session-based Simulator Models
const MonitoringSession = require('./MonitoringSession');
const Process = require('./Process');
const FileEvent = require('./FileEvent');
const Alert = require('./Alert');
const Settings = require('./Settings');

// --- User Associations ---
User.hasMany(Agent, { foreignKey: 'userId' });
Agent.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(AuditLog, { foreignKey: 'userId' });
AuditLog.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(MonitoringSession, { foreignKey: 'userId' });
MonitoringSession.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Alert, { foreignKey: 'userId' });
Alert.belongsTo(User, { foreignKey: 'userId' });

User.hasOne(Settings, { foreignKey: 'userId' });
Settings.belongsTo(User, { foreignKey: 'userId' });

// --- Agent Associations ---
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

// --- Session-based Associations ---
MonitoringSession.hasMany(Process, { foreignKey: 'sessionId' });
Process.belongsTo(MonitoringSession, { foreignKey: 'sessionId' });

MonitoringSession.hasMany(FileEvent, { foreignKey: 'sessionId' });
FileEvent.belongsTo(MonitoringSession, { foreignKey: 'sessionId' });

MonitoringSession.hasMany(Alert, { foreignKey: 'sessionId' });
Alert.belongsTo(MonitoringSession, { foreignKey: 'sessionId' });

MonitoringSession.hasMany(CanaryFile, { foreignKey: 'sessionId' });
CanaryFile.belongsTo(MonitoringSession, { foreignKey: 'sessionId' });

// --- Other Associations ---
CanaryFile.hasMany(CanaryAlert, { foreignKey: 'canaryFileId' });
CanaryAlert.belongsTo(CanaryFile, { foreignKey: 'canaryFileId' });

CanaryAlert.belongsTo(User, { foreignKey: 'acknowledgedBy', as: 'acknowledger' });

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
  MonitoringSession,
  Process,
  FileEvent,
  Alert,
  Settings,
};
