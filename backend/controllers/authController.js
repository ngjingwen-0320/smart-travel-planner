const User = require('../models/User');
const jwt = require('jsonwebtoken');

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