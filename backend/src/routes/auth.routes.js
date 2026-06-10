const express = require('express');
const authController = require('../controllers/auth.controller');
const { auth } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const { validate } = require('../middleware/validate');
const { auditLogger } = require('../middleware/auditLogger');
const { registerSchema, loginSchema, changePasswordSchema } = require('../validators/auth.validator');

const router = express.Router();

router.post('/register', auth, requireRole('admin'), validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', auth, auditLogger('logout', 'User'), authController.logout);
router.get('/me', auth, authController.getMe);
router.post('/change-password', auth, validate(changePasswordSchema), auditLogger('change-password', 'User'), authController.changePassword);

module.exports = router;
