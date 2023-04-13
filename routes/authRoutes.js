const {Router} = require('express');
const authController = require('../controllers/authControllers');
const {	authenticateAdmin } = require('../middleware/authentication');
const router = Router();
const User = ('../models/User');

//user signup
router.post('/signup', authController.signup);

//user login
router.post('/login', authController.login);

//user logout
router.get('/logout', authController.logout);

//reset user password
router.post('/password-reset', authController.passwordReset);

//save new user password
router.patch('/new-password', authController.passwordUpdate);

//admin user functions
router.get('/users', authenticateAdmin, authController.findUsers);

router.delete('/users/:id', authenticateAdmin, authController.deleteUser);

module.exports = router;