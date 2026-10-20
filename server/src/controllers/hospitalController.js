const Hospital = require('../models/Hospital');
const User = require('../models/User');

// @desc    Get all hospitals
// @route   GET /api/hospitals
// @access  Private (Admin)
const getHospitals = async (req, res, next) => {
  try {
    const { city, search } = req.query;
    const query = {};

    if (city) query.city = city;

    let hospitals = await Hospital.find(query).populate('userId', req.user.role === 'ADMIN' ? 'name email phone isActive' : 'name phone isActive');

    if (search) {
      const searchLower = search.toLowerCase();
      hospitals = hospitals.filter(h =>
        h.hospitalName.toLowerCase().includes(searchLower) ||
        h.registrationNumber.toLowerCase().includes(searchLower) ||
        h.city.toLowerCase().includes(searchLower)
      );
    }

    res.json({
      success: true,
      count: hospitals.length,
      hospitals
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get hospital by ID
// @route   GET /api/hospitals/:id
// @access  Private
const getHospitalById = async (req, res, next) => {
  try {
    const hospital = await Hospital.findById(req.params.id).populate('userId', '-password');
    if (!hospital) {
      return res.status(404).json({ success: false, message: 'Hospital not found' });
    }

    res.json({
      success: true,
      hospital
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new hospital account
// @route   POST /api/hospitals
// @access  Private (Admin)
const createHospital = async (req, res, next) => {
  try {
    const { hospitalName, registrationNumber, contactPerson, phone, email, password, address, city, emergencyContact, location } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    const user = await User.create({
      name: hospitalName,
      email,
      password: password || 'Hospital@123',
      phone,
      role: 'HOSPITAL',
      address
    });

    const hospital = await Hospital.create({
      userId: user._id,
      hospitalName,
      registrationNumber,
      contactPerson,
      phone,
      email,
      address,
      city,
      emergencyContact,
      location
    });

    res.status(201).json({
      success: true,
      hospital
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update hospital profile
// @route   PUT /api/hospitals/:id
// @access  Private
const updateHospital = async (req, res, next) => {
  try {
    let hospital = await Hospital.findById(req.params.id);
    if (!hospital) {
      return res.status(404).json({ success: false, message: 'Hospital not found' });
    }

    if (req.user.role !== 'ADMIN' && hospital.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this hospital' });
    }

    const allowed = ['hospitalName', 'contactPerson', 'phone', 'email', 'address', 'city', 'emergencyContact', 'location'];
    const updates = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowed.includes(key)));
    hospital = await Hospital.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true }).populate('userId', '-password');

    if (hospital.userId?._id) {
      const userUpdates = {};
      if (updates.hospitalName) userUpdates.name = updates.hospitalName;
      if (updates.email) userUpdates.email = updates.email;
      if (updates.phone) userUpdates.phone = updates.phone;
      if (updates.address) userUpdates.address = updates.address;
      if (Object.keys(userUpdates).length) await User.findByIdAndUpdate(hospital.userId._id, userUpdates, { runValidators: true });
    }

    res.json({
      success: true,
      hospital
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getHospitals,
  getHospitalById,
  createHospital,
  updateHospital
};
