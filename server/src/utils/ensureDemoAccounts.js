const User = require('../models/User');
const Donor = require('../models/Donor');
const Hospital = require('../models/Hospital');
const { ROLES } = require('../config/constants');

const DEMO_ACCOUNTS = {
  admin: {
    name: 'Dr. Sarah Jenkins',
    email: 'admin@bloodlink.ai',
    password: 'Admin@123',
    phone: '+1 (555) 019-2831',
    role: ROLES.ADMIN,
    address: {
      street: '100 Medical Center Blvd',
      city: 'Metropolis',
      state: 'NY',
      zipCode: '10001'
    }
  },
  hospital: {
    name: 'Metropolis City General Hospital',
    email: 'hospital@bloodlink.ai',
    password: 'Hospital@123',
    phone: '+1 555-111-2222',
    role: ROLES.HOSPITAL,
    address: {
      street: '45 Hospital Way',
      city: 'Metropolis',
      state: 'NY',
      zipCode: '10002'
    }
  },
  hospitalB: {
    name: 'St. Jude Children Research Center',
    email: 'stjude@hospital.org',
    password: 'Hospital@123',
    phone: '+1 555-222-3333',
    role: ROLES.HOSPITAL,
    address: {
      street: '88 Health Ave',
      city: 'Metropolis',
      state: 'NY',
      zipCode: '10004'
    }
  },
  donor: {
    name: 'John Doe',
    email: 'donor@bloodlink.ai',
    password: 'Donor@123',
    phone: '+1 555-701-0001',
    role: ROLES.DONOR,
    address: {
      street: '12 Community Rd',
      city: 'Metropolis',
      state: 'NY',
      zipCode: '10003'
    }
  }
};

const upsertDemoUser = async (account) => {
  let existing = await User.findOne({ email: account.email }).select('+password');
  if (existing) {
    const isMatch = await existing.matchPassword(account.password);
    if (!isMatch) {
      existing.password = account.password;
      await existing.save();
    }
    return { user: existing, created: false };
  }

  const user = await User.create(account);
  return { user, created: true };
};

/**
 * Adds the accounts advertised by the Quick Demo Login buttons without
 * removing accounts that have already been registered in development.
 */
const ensureDemoAccounts = async () => {
  const created = [];
  const admin = await upsertDemoUser(DEMO_ACCOUNTS.admin);
  if (admin.created) created.push(DEMO_ACCOUNTS.admin.email);

  const hospital = await upsertDemoUser(DEMO_ACCOUNTS.hospital);
  if (hospital.created) created.push(DEMO_ACCOUNTS.hospital.email);
  const hospitalProfile = await Hospital.findOne({ userId: hospital.user._id });
  if (!hospitalProfile) {
    await Hospital.create({
      userId: hospital.user._id,
      hospitalName: DEMO_ACCOUNTS.hospital.name,
      registrationNumber: 'REG-HOSP-001',
      contactPerson: 'Dr. Robert Vance',
      phone: DEMO_ACCOUNTS.hospital.phone,
      email: DEMO_ACCOUNTS.hospital.email,
      address: DEMO_ACCOUNTS.hospital.address,
      city: 'Metropolis',
      emergencyContact: '+1 555-999-0000'
    });
  }

  const hospitalB = await upsertDemoUser(DEMO_ACCOUNTS.hospitalB);
  if (hospitalB.created) created.push(DEMO_ACCOUNTS.hospitalB.email);
  const hospitalBProfile = await Hospital.findOne({ userId: hospitalB.user._id });
  if (!hospitalBProfile) {
    await Hospital.create({
      userId: hospitalB.user._id,
      hospitalName: DEMO_ACCOUNTS.hospitalB.name,
      registrationNumber: 'REG-HOSP-002',
      contactPerson: 'Elena Rostova',
      phone: DEMO_ACCOUNTS.hospitalB.phone,
      email: DEMO_ACCOUNTS.hospitalB.email,
      address: DEMO_ACCOUNTS.hospitalB.address,
      city: 'Metropolis',
      emergencyContact: '+1 555-888-0000'
    });
  }

  const donor = await upsertDemoUser(DEMO_ACCOUNTS.donor);
  if (donor.created) created.push(DEMO_ACCOUNTS.donor.email);
  const donorProfile = await Donor.findOne({ userId: donor.user._id });
  if (!donorProfile) {
    await Donor.create({
      userId: donor.user._id,
      bloodGroup: 'O+',
      dateOfBirth: new Date('1990-05-14'),
      gender: 'Male',
      phone: DEMO_ACCOUNTS.donor.phone,
      address: DEMO_ACCOUNTS.donor.address,
      totalDonations: 1
    });
  }

  return created;
};

module.exports = ensureDemoAccounts;
