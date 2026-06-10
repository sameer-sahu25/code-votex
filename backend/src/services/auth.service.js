const bcrypt = require('bcryptjs');
const { User } = require('../models');
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} = require('../utils/jwt');

const register = async (email, password, role = 'analyst') => {
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({
    email,
    passwordHash,
    role,
  });
  const { passwordHash: _, ...userWithoutPassword } = user.toJSON();
  return userWithoutPassword;
};

const login = async (email, password) => {
  const user = await User.findOne({ where: { email } });
  if (!user || !user.isActive) {
    throw new Error('Invalid credentials');
  }

  const passwordValid = await bcrypt.compare(password, user.passwordHash);
  if (!passwordValid) {
    throw new Error('Invalid credentials');
  }

  const accessToken = signAccessToken({ id: user.id, role: user.role });
  const refreshToken = signRefreshToken({ id: user.id });
  const refreshTokenHash = await bcrypt.hash(refreshToken, 12);

  await user.update({
    refreshToken: refreshTokenHash,
    lastLoginAt: new Date(),
  });

  const { passwordHash: _, refreshToken: __, ...userWithoutPassword } = user.toJSON();

  return { accessToken, refreshToken, user: userWithoutPassword };
};

const refresh = async (refreshToken) => {
  if (!refreshToken) {
    throw new Error('No refresh token provided');
  }

  const decoded = verifyRefreshToken(refreshToken);
  const user = await User.findByPk(decoded.id);

  if (!user || !user.refreshToken) {
    throw new Error('Invalid refresh token');
  }

  const valid = await bcrypt.compare(refreshToken, user.refreshToken);
  if (!valid) {
    throw new Error('Invalid refresh token');
  }

  const accessToken = signAccessToken({ id: user.id, role: user.role });
  return accessToken;
};

const logout = async (userId) => {
  await User.update({ refreshToken: null }, { where: { id: userId } });
};

const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await User.findByPk(userId);
  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) {
    throw new Error('Current password is incorrect');
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);
  await user.update({ passwordHash, refreshToken: null });
};

module.exports = {
  register,
  login,
  refresh,
  logout,
  changePassword,
};
