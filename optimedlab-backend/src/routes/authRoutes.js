// routes/authRoutes.js
const express = require('express');
const {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  uploadAvatar
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

// Avatar upload with custom error handling
router.post('/avatar', protect, (req, res) => {
  upload.single('avatar')(req, res, (err) => {
    if (err) {
      console.error('Multer error:', err);
      // Handle file size error
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'File too large. Maximum size is 5MB.'
        });
      }
      // Handle other multer errors
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
    // If no error, proceed to controller
    uploadAvatar(req, res);
  });
});

module.exports = router;