const authService = require('../services/auth.service');
const { success, error } = require('../utils/response');

const register = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const user = await authService.register(email, password, role);
    return success(res, user, 'User registered successfully', 201);
  } catch (err) {
    return error(res, err.message, 400);
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { accessToken, refreshToken, user } = await authService.login(email, password);
    
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: 'strict',
    });
    
    return success(res, { accessToken, user }, 'Login successful');
  } catch (err) {
    return error(res, err.message, 401);
  }
};

const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;
    const accessToken = await authService.refresh(refreshToken);
    return success(res, { accessToken }, 'Token refreshed successfully');
  } catch (err) {
    return error(res, err.message, 401);
  }
};

const logout = async (req, res) => {
  try {
    await authService.logout(req.user.id);
    res.clearCookie('refreshToken');
    return success(res, null, 'Logged out successfully');
  } catch (err) {
    return error(res, err.message, 500);
  }
};

const getMe = async (req, res) => {
  try {
    return success(res, req.user, 'User retrieved successfully');
  } catch (err) {
    return error(res, err.message, 500);
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    await authService.changePassword(req.user.id, currentPassword, newPassword);
    res.clearCookie('refreshToken');
    return success(res, null, 'Password changed successfully');
  } catch (err) {
    return error(res, err.message, 400);
  }
};

module.exports = {
  register,
  login,
  refresh,
  logout,
  getMe,
  changePassword,
};
