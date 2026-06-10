const User = require('../models/User');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/email');
const crypto = require('crypto');

// Helper function to create the Token
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

exports.register = async (req, res) => {
  try {
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password
    });

    const token = signToken(newUser._id);

    // Remove password from output for security
    newUser.password = undefined;

    res.status(201).json({
      success: true,
      token,
      user: newUser
    });
  } catch (err) {
    console.error("DEBUG ERROR:", err);
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  // 1) Check if email and password exist in request
  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password' });
  }

  // 2) Check if user exists & password is correct
  // We use .select('+password') because we hid it in the model
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return res.status(401).json({ message: 'Incorrect email or password' });
  }

  // 3) If everything ok, send token to client
  const token = signToken(user._id);
  res.status(200).json({
    success: true,
    token,
    user: { id: user._id, name: user.name, email: user.email }
  });
};

exports.getProfile = async (req, res) => {
  res.status(200).json({
    success: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role
    }
  });
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, email },
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'This email is already used by another account'
      });
    }

    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

exports.verifyPassword = async (req, res) => {
  try {
    const { oldPassword } = req.body;

    if (!oldPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please enter your old password'
      });
    }

    const user = await User.findById(req.user.id).select('+password');

    const isCorrect = await user.correctPassword(oldPassword, user.password);

    if (!isCorrect) {
      return res.status(401).json({
        success: false,
        message: 'Old password is incorrect'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Password verified'
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

exports.updatePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Old password and new password are required'
      });
    }

    const user = await User.findById(req.user.id).select('+password');

    const isCorrect = await user.correctPassword(oldPassword, user.password);

    if (!isCorrect) {
      return res.status(401).json({
        success: false,
        message: 'Old password is incorrect'
      });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No user found with this email'
      });
    }

    // Generate token
    const resetToken = crypto.randomBytes(32).toString('hex');

    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000;

    await user.save({ validateBeforeSave: false });

    // Reset URL
    const resetURL = `http://localhost:3000/reset-password/${resetToken}`;

    // SEND EMAIL (REAL)
    await sendEmail({
      email: user.email,
      subject: 'Password Reset Link (Valid 10 minutes)',
      message: `Click here to reset your password: ${resetURL}`
    });

    res.status(200).json({
      success: true,
      message: 'Reset password link sent to email'
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required'
      });
    }

    // Hash token (must match DB)
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Find valid user
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Token is invalid or expired'
      });
    }

    // Set new password
    user.password = password;

    // Clear reset fields
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password has been reset successfully'
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};