const Donor = require('../models/Donor');
const User = require('../models/User');
const BloodInventory = require('../models/BloodInventory');

// @desc    Get all donors
// @route   GET /api/donors
// @access  Private (Admin)
const getDonors = async (req, res, next) => {
  try {
    const { bloodGroup, eligibility, search } = req.query;
    const query = {};

    if (bloodGroup) query.bloodGroup = bloodGroup;
    if (eligibility) query.eligibilityStatus = eligibility;

    let donors = await Donor.find(query).populate('userId', 'name email phone address isActive');

    if (search) {
      const searchLower = search.toLowerCase();
      donors = donors.filter(d => 
        (d.userId && d.userId.name && d.userId.name.toLowerCase().includes(searchLower)) ||
        (d.userId && d.userId.email && d.userId.email.toLowerCase().includes(searchLower)) ||
        d.phone.includes(searchLower)
      );
    }

    res.json({
      success: true,
      count: donors.length,
      donors
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single donor profile by ID
// @route   GET /api/donors/:id
// @access  Private
const getDonorById = async (req, res, next) => {
  try {
    const donor = await Donor.findById(req.params.id).populate('userId', '-password');
    if (!donor) {
      return res.status(404).json({ success: false, message: 'Donor not found' });
    }

    // Get donations linked to this donor
    const donations = await BloodInventory.find({ donorId: donor._id }).sort({ collectionDate: -1 });

    res.json({
      success: true,
      donor,
      donations
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new donor
// @route   POST /api/donors
// @access  Private (Admin)
const createDonor = async (req, res, next) => {
  try {
    const { name, email, password, phone, bloodGroup, dateOfBirth, gender, address } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    const user = await User.create({
      name,
      email,
      password: password || 'Donor@123',
      phone,
      role: 'DONOR',
      address
    });

    const donor = await Donor.create({
      userId: user._id,
      bloodGroup,
      dateOfBirth,
      gender,
      phone,
      address
    });

    res.status(201).json({
      success: true,
      donor
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update donor details
// @route   PUT /api/donors/:id
// @access  Private
const updateDonor = async (req, res, next) => {
  try {
    let donor = await Donor.findById(req.params.id);
    if (!donor) {
      return res.status(404).json({ success: false, message: 'Donor not found' });
    }

    // Authorization check: Admin or self
    if (req.user.role !== 'ADMIN' && donor.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this profile' });
    }

    const allowed = ['bloodGroup', 'dateOfBirth', 'gender', 'phone', 'address', 'lastDonationDate', 'totalDonations', 'eligibilityStatus'];
    const updates = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowed.includes(key)));
    donor = await Donor.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true }).populate('userId', '-password');

    if (donor.userId?._id) {
      const userUpdates = {};
      if (updates.phone) userUpdates.phone = updates.phone;
      if (updates.address) userUpdates.address = updates.address;
      if (Object.keys(userUpdates).length) await User.findByIdAndUpdate(donor.userId._id, userUpdates, { runValidators: true });
    }

    res.json({
      success: true,
      donor
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete donor
// @route   DELETE /api/donors/:id
// @access  Private (Admin)
const deleteDonor = async (req, res, next) => {
  try {
    const donor = await Donor.findById(req.params.id);
    if (!donor) {
      return res.status(404).json({ success: false, message: 'Donor not found' });
    }

    await User.findByIdAndDelete(donor.userId);
    await Donor.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Donor deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDonors,
  getDonorById,
  createDonor,
  updateDonor,
  deleteDonor
};
