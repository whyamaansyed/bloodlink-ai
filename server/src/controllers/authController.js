const User = require('../models/User');
const Donor = require('../models/Donor');
const Hospital = require('../models/Hospital');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign(
    { id },
    (() => {
      if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is not configured');
      return process.env.JWT_SECRET;
    })(),
    { expiresIn: '30d' }
  );
};

// @desc    Register user (Admin, Hospital, Donor)
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, phone, address, extraDetails } = req.body;
    const role = ['DONOR', 'HOSPITAL'].includes(req.body.role) ? req.body.role : 'DONOR';

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      phone,
      role,
      address
    });

    // Create role profile if applicable
    if (user.role === 'DONOR' && extraDetails) {
      await Donor.create({
        userId: user._id,
        bloodGroup: extraDetails.bloodGroup || 'O+',
        dateOfBirth: extraDetails.dateOfBirth || new Date('1995-01-01'),
        gender: extraDetails.gender || 'Other',
        phone: phone,
        address: address
      });
    } else if (user.role === 'HOSPITAL' && extraDetails) {
      await Hospital.create({
        userId: user._id,
        hospitalName: extraDetails.hospitalName || name,
        registrationNumber: extraDetails.registrationNumber || `REG-${Date.now()}`,
        contactPerson: extraDetails.contactPerson || name,
        phone: phone,
        email: email,
        address: address,
        city: extraDetails.city || 'Metropolis',
        emergencyContact: extraDetails.emergencyContact || phone
      });
    }

    const token = generateToken(user._id);

    const userObj = user.toObject();
    delete userObj.password;
    let profile = null;
    if (user.role === 'DONOR') profile = await Donor.findOne({ userId: user._id });
    if (user.role === 'HOSPITAL') profile = await Hospital.findOne({ userId: user._id });

    res.status(201).json({
      success: true,
      token,
      user: { ...userObj, profile }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Your account has been deactivated. Please contact admin.' });
    }

    const token = generateToken(user._id);

    // Fetch associated profile details
    let profile = null;
    if (user.role === 'DONOR') {
      profile = await Donor.findOne({ userId: user._id });
    } else if (user.role === 'HOSPITAL') {
      profile = await Hospital.findOne({ userId: user._id });
    }

    const userObj = user.toObject();
    delete userObj.password;

    res.json({
      success: true,
      token,
      user: {
        ...userObj,
        profile
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    let profile = null;

    if (user.role === 'DONOR') {
      profile = await Donor.findOne({ userId: user._id });
    } else if (user.role === 'HOSPITAL') {
      profile = await Hospital.findOne({ userId: user._id });
    }

    res.json({
      success: true,
      user: {
        ...user.toObject(),
        profile
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  getCurrentUser
};
