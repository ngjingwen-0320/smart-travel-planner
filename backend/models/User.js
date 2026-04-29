const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator'); 

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Please tell us your name'],
    trim: true, // Removes accidental spaces at start/end
    maxlength: [50, 'Name cannot be longer than 50 characters']
  },
  email: { 
    type: String, 
    required: [true, 'Email is required'], 
    unique: true, 
    lowercase: true,
    // REAL-WORLD VALIDATION: Ensures it follows user@domain.com format
    validate: [validator.isEmail, 'Please provide a valid email address']
  },
  password: { 
    type: String, 
    required: [true, 'Password is required'], 
    minlength: [8, 'Password must be at least 8 characters long'], 
    select: false 
  },
  role: { 
    type: String, 
    // ENUM VALIDATION: Prevents users from setting role to "admin" or "hacker"
    enum: {
      values: ['user', 'guide', 'admin'],
      message: 'Role must be either user, guide, or admin'
    },
    default: 'user' 
  }
}, {
  // AUTOMATIC TIMESTAMPS: Satisfies the createdAt/updatedAt requirement
  timestamps: true 
});

// DOCUMENT MIDDLEWARE: Runs before .save()
userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// Instance Method
userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

module.exports = mongoose.model('User', userSchema);