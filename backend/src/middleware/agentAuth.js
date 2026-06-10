const { Agent } = require('../models');
const { error } = require('../utils/response');

const agentAuth = async (req, res, next) => {
  try {
    const agentKey = req.headers['x-agent-key'];
    if (!agentKey) {
      return error(res, 'Unauthorized: Missing agent key', 401);
    }

    const agent = await Agent.findOne({ where: { agentKey } });
    if (!agent) {
      return error(res, 'Unauthorized: Invalid agent key', 401);
    }

    req.agent = agent;
    next();
  } catch (err) {
    console.error('Agent auth error:', err);
    return error(res, 'Internal server error', 500);
  }
};

module.exports = { agentAuth };
