const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const { connectDB, disconnectDB } = require('../config/db');
const User = require('../models/User');
const Donor = require('../models/Donor');
const Hospital = require('../models/Hospital');
const BloodInventory = require('../models/BloodInventory');
const BloodRequest = require('../models/BloodRequest');
const DemandRecord = require('../models/DemandRecord');
const Notification = require('../models/Notification');
const StockThreshold = require('../models/StockThreshold');
const { BLOOD_GROUPS, BLOOD_COMPONENTS, INVENTORY_STATUS, REQUEST_STATUS, REQUEST_URGENCY, NOTIFICATION_TYPES } = require('../config/constants');

const seedDatabase = async (disconnect = true) => {
  try {
    console.log('🌱 Starting Database Seeding Process...');
    if (disconnect) await connectDB();

    // Clear existing collections
    await User.deleteMany({});
    await Donor.deleteMany({});
    await Hospital.deleteMany({});
    await BloodInventory.deleteMany({});
    await BloodRequest.deleteMany({});
    await DemandRecord.deleteMany({});
    await Notification.deleteMany({});
    await StockThreshold.deleteMany({});

    console.log('🧹 Cleared existing database records.');

    // 1. Create Admin User
    const adminUser = await User.create({
      name: 'Dr. Sarah Jenkins',
      email: 'admin@bloodlink.ai',
      password: 'Admin@123',
      phone: '+1 (555) 019-2831',
      role: 'ADMIN',
      address: {
        street: '100 Medical Center Blvd',
        city: 'Metropolis',
        state: 'NY',
        zipCode: '10001'
      }
    });

    console.log('👤 Created Admin user: admin@bloodlink.ai / Admin@123');

    // 2. Create Hospitals
    const hospitalData = [
      { name: 'Metropolis City General Hospital', email: 'hospital@bloodlink.ai', reg: 'REG-HOSP-001', contact: 'Dr. Robert Vance', phone: '+1 555-111-2222', city: 'Metropolis' },
      { name: 'St. Jude Children Research Center', email: 'stjude@hospital.org', reg: 'REG-HOSP-002', contact: 'Elena Rostova', phone: '+1 555-222-3333', city: 'Metropolis' },
      { name: 'Trinity Emergency Medical Center', email: 'trinity@hospital.org', reg: 'REG-HOSP-003', contact: 'Marcus Brody', phone: '+1 555-333-4444', city: 'Metropolis' },
      { name: 'Valley Heart & Surgical Hospital', email: 'valleyheart@hospital.org', reg: 'REG-HOSP-004', contact: 'Dr. Anita Desai', phone: '+1 555-444-5555', city: 'Suburbia' },
      { name: 'Apex Trauma & Trauma Institute', email: 'apex@hospital.org', reg: 'REG-HOSP-005', contact: 'David Kim', phone: '+1 555-555-6666', city: 'Metropolis' }
    ];

    const createdHospitals = [];
    for (const h of hospitalData) {
      const u = await User.create({
        name: h.name,
        email: h.email,
        password: 'Hospital@123',
        phone: h.phone,
        role: 'HOSPITAL',
        address: { street: '45 Hospital Way', city: h.city, state: 'NY', zipCode: '10002' }
      });

      const hosp = await Hospital.create({
        userId: u._id,
        hospitalName: h.name,
        registrationNumber: h.reg,
        contactPerson: h.contact,
        phone: h.phone,
        email: h.email,
        address: { street: '45 Hospital Way', city: h.city, state: 'NY', zipCode: '10002' },
        city: h.city,
        emergencyContact: '+1 555-999-0000'
      });
      createdHospitals.push(hosp);
    }
    console.log(`🏥 Created ${createdHospitals.length} Hospital accounts.`);

    // 3. Create Donors
    const donorData = [
      { name: 'John Doe', email: 'donor@bloodlink.ai', bg: 'O+', dob: '1990-05-14', gender: 'Male', phone: '+1 555-701-0001' },
      { name: 'Jane Smith', email: 'jane.smith@gmail.com', bg: 'A+', dob: '1992-08-22', gender: 'Female', phone: '+1 555-701-0002' },
      { name: 'Michael Brown', email: 'michael.b@yahoo.com', bg: 'B+', dob: '1988-12-10', gender: 'Male', phone: '+1 555-701-0003' },
      { name: 'Emily Davis', email: 'emily.d@outlook.com', bg: 'O-', dob: '1995-03-30', gender: 'Female', phone: '+1 555-701-0004' },
      { name: 'Carlos Rodriguez', email: 'carlos.r@gmail.com', bg: 'AB+', dob: '1991-11-05', gender: 'Male', phone: '+1 555-701-0005' },
      { name: 'Sophia Chen', email: 'sophia.c@gmail.com', bg: 'A-', dob: '1996-07-18', gender: 'Female', phone: '+1 555-701-0006' },
      { name: 'David Wilson', email: 'david.w@gmail.com', bg: 'B-', dob: '1987-01-25', gender: 'Male', phone: '+1 555-701-0007' },
      { name: 'Olivia Taylor', email: 'olivia.t@gmail.com', bg: 'AB-', dob: '1994-09-12', gender: 'Female', phone: '+1 555-701-0008' },
      { name: 'James Anderson', email: 'james.a@gmail.com', bg: 'O+', dob: '1989-04-04', gender: 'Male', phone: '+1 555-701-0009' },
      { name: 'Emma Thomas', email: 'emma.t@gmail.com', bg: 'A+', dob: '1993-06-15', gender: 'Female', phone: '+1 555-701-0010' },
      { name: 'Alexander Martinez', email: 'alex.m@gmail.com', bg: 'O+', dob: '1992-02-19', gender: 'Male', phone: '+1 555-701-0011' },
      { name: 'Isabella Hernandez', email: 'isabella.h@gmail.com', bg: 'B+', dob: '1997-10-08', gender: 'Female', phone: '+1 555-701-0012' },
      { name: 'William King', email: 'william.k@gmail.com', bg: 'A+', dob: '1985-07-07', gender: 'Male', phone: '+1 555-701-0013' },
      { name: 'Mia Scott', email: 'mia.s@gmail.com', bg: 'O-', dob: '1998-11-23', gender: 'Female', phone: '+1 555-701-0014' },
      { name: 'Benjamin Green', email: 'ben.g@gmail.com', bg: 'A-', dob: '1991-05-02', gender: 'Male', phone: '+1 555-701-0015' },
      { name: 'Charlotte Baker', email: 'charlotte.b@gmail.com', bg: 'B+', dob: '1993-09-17', gender: 'Female', phone: '+1 555-701-0016' },
      { name: 'Lucas Adams', email: 'lucas.a@gmail.com', bg: 'AB+', dob: '1989-12-01', gender: 'Male', phone: '+1 555-701-0017' },
      { name: 'Amelia Nelson', email: 'amelia.n@gmail.com', bg: 'O+', dob: '1996-04-11', gender: 'Female', phone: '+1 555-701-0018' },
      { name: 'Ethan Hill', email: 'ethan.h@gmail.com', bg: 'B-', dob: '1990-08-31', gender: 'Male', phone: '+1 555-701-0019' },
      { name: 'Harper Ramsey', email: 'harper.r@gmail.com', bg: 'O-', dob: '1994-01-14', gender: 'Female', phone: '+1 555-701-0020' }
    ];

    const createdDonors = [];
    for (const d of donorData) {
      const u = await User.create({
        name: d.name,
        email: d.email,
        password: 'Donor@123',
        phone: d.phone,
        role: 'DONOR',
        address: { street: '12 Community Rd', city: 'Metropolis', state: 'NY', zipCode: '10003' }
      });

      const donor = await Donor.create({
        userId: u._id,
        bloodGroup: d.bg,
        dateOfBirth: new Date(d.dob),
        gender: d.gender,
        phone: d.phone,
        address: { street: '12 Community Rd', city: 'Metropolis', state: 'NY', zipCode: '10003' },
        lastDonationDate: new Date(Date.now() - Math.floor(Math.random() * 60) * 86400000),
        totalDonations: Math.floor(Math.random() * 8) + 1,
        eligibilityStatus: 'ELIGIBLE'
      });
      createdDonors.push(donor);
    }
    console.log(`🩸 Created ${createdDonors.length} Donor profiles.`);

    // 4. Create Stock Thresholds
    const stockThresholds = [];
    for (const bg of BLOOD_GROUPS) {
      for (const comp of BLOOD_COMPONENTS) {
        const thresh = await StockThreshold.create({
          bloodGroup: bg,
          component: comp,
          minimumStock: bg === 'O+' || bg === 'A+' ? 12 : 6,
          criticalStock: bg === 'O+' || bg === 'A+' ? 5 : 3,
          updatedBy: adminUser._id
        });
        stockThresholds.push(thresh);
      }
    }
    console.log(`⚙️ Created ${stockThresholds.length} Stock Threshold rules.`);

    // 5. Create Blood Inventory (50+ units: Available, Expiring Soon, Expired, Issued)
    const inventoryUnits = [];
    const storageLocations = ['Freezer A-1', 'Freezer A-2', 'Freezer B-1', 'Cold Vault 1', 'Platelet Agitator 2'];

    const now = new Date();

    for (let i = 1; i <= 55; i++) {
      const bg = BLOOD_GROUPS[i % BLOOD_GROUPS.length];
      const comp = BLOOD_COMPONENTS[i % BLOOD_COMPONENTS.length];
      const donor = createdDonors[i % createdDonors.length];

      // Variance in expiry dates (some expired, some expiring in 2 days, some in 20 days)
      let daysOffset = 25;
      let status = INVENTORY_STATUS.AVAILABLE;

      if (i <= 5) {
        // Expired units
        daysOffset = -Math.floor(Math.random() * 5 + 1);
        status = INVENTORY_STATUS.EXPIRED;
      } else if (i <= 12) {
        // Expiring soon (1-4 days)
        daysOffset = Math.floor(Math.random() * 3 + 1);
      } else if (i <= 18) {
        // Issued units
        daysOffset = Math.floor(Math.random() * 15 + 5);
        status = INVENTORY_STATUS.ISSUED;
      }

      const collectionDate = new Date(now.getTime() - (35 - daysOffset) * 86400000);
      const expiryDate = new Date(collectionDate.getTime() + 35 * 86400000);

      const unit = await BloodInventory.create({
        unitId: `BLD-202609-${String(i).padStart(4, '0')}`,
        bloodGroup: bg,
        component: comp,
        quantity: 1,
        collectionDate,
        expiryDate,
        donorId: donor._id,
        storageLocation: storageLocations[i % storageLocations.length],
        status
      });
      inventoryUnits.push(unit);
    }
    console.log(`📦 Seeded ${inventoryUnits.length} physical blood units into inventory.`);

    // 6. Create Historical Demand Records (3+ months)
    const demandRecords = [];
    for (let m = 3; m >= 0; m--) {
      const date = new Date(now.getFullYear(), now.getMonth() - m, 15);
      for (const bg of BLOOD_GROUPS) {
        for (const comp of BLOOD_COMPONENTS) {
          const requested = Math.floor(Math.random() * 15) + 5;
          const fulfilled = Math.floor(requested * 0.85);
          const rejected = requested - fulfilled;
          const emergency = Math.floor(Math.random() * 3);

          const dr = await DemandRecord.create({
            bloodGroup: bg,
            component: comp,
            date,
            requestedUnits: requested,
            fulfilledUnits: fulfilled,
            rejectedUnits: rejected,
            emergencyRequests: emergency
          });
          demandRecords.push(dr);
        }
      }
    }
    console.log(`📊 Created ${demandRecords.length} historical Demand records over 4 months.`);

    // 7. Create Blood Requests (30+)
    const bloodRequests = [];
    const reasons = [
      'Emergency Trauma Care - Severe Road Accident',
      'Open Heart Surgery Procedure',
      'Oncology Chemotherapy Blood Support',
      'Severe Anemia Treatment',
      'Maternal Hemorrhage Emergency'
    ];

    const statuses = [
      REQUEST_STATUS.PENDING,
      REQUEST_STATUS.APPROVED,
      REQUEST_STATUS.FULFILLED,
      REQUEST_STATUS.REJECTED,
      REQUEST_STATUS.CANCELLED
    ];

    for (let i = 1; i <= 32; i++) {
      const hosp = createdHospitals[i % createdHospitals.length];
      const bg = BLOOD_GROUPS[i % BLOOD_GROUPS.length];
      const comp = BLOOD_COMPONENTS[i % BLOOD_COMPONENTS.length];
      const urgency = i % 5 === 0 ? REQUEST_URGENCY.EMERGENCY : (i % 3 === 0 ? REQUEST_URGENCY.URGENT : REQUEST_URGENCY.NORMAL);
      const status = statuses[i % statuses.length];

      const reqObj = {
        hospitalId: hosp._id,
        patientReference: `PAT-2026-${String(100 + i)}`,
        bloodGroup: bg,
        component: comp,
        quantity: Math.floor(Math.random() * 3) + 1,
        urgency,
        requiredDate: new Date(now.getTime() + Math.floor(Math.random() * 5) * 86400000),
        reason: reasons[i % reasons.length],
        status,
        createdAt: new Date(now.getTime() - Math.floor(Math.random() * 20) * 86400000)
      };

      if (status === REQUEST_STATUS.APPROVED || status === REQUEST_STATUS.FULFILLED) {
        reqObj.approvedBy = adminUser._id;
        reqObj.approvedAt = new Date(reqObj.createdAt.getTime() + 3600000);
      }

      if (status === REQUEST_STATUS.FULFILLED) {
        reqObj.fulfilledAt = new Date(reqObj.createdAt.getTime() + 7200000);
      }

      if (status === REQUEST_STATUS.REJECTED) {
        reqObj.rejectionReason = 'Insufficient inventory units available for requested blood group.';
      }

      const createdReq = await BloodRequest.create(reqObj);
      bloodRequests.push(createdReq);
    }
    console.log(`📋 Created ${bloodRequests.length} hospital blood requests.`);

    // 8. Create Notifications
    await Notification.create({
      userId: adminUser._id,
      type: NOTIFICATION_TYPES.LOW_STOCK,
      title: '🚨 Critical Stock Alert: O- (Whole Blood)',
      message: 'Available inventory for O- Whole Blood has dropped to 2 units (Critical threshold is 3).'
    });

    await Notification.create({
      userId: adminUser._id,
      type: NOTIFICATION_TYPES.EXPIRY_WARNING,
      title: '⚠️ Expiry Warning',
      message: '4 units of A+ Packed Red Blood Cells are expiring within 3 days.'
    });

    if (createdHospitals[0] && createdHospitals[0].userId) {
      await Notification.create({
        userId: createdHospitals[0].userId,
        type: NOTIFICATION_TYPES.REQUEST_FULFILLED,
        title: 'Blood Request Fulfilled! 🩸',
        message: 'Your request for 2 units of O+ Whole Blood has been fulfilled and dispatched.'
      });
    }

    console.log('🔔 Created initial system notifications.');
    console.log('✅ Database Seeding Completed Successfully!');
  } catch (error) {
    console.error('❌ Seeding failed with error:', error);
    process.exitCode = 1;
  } finally {
    if (disconnect) {
      await disconnectDB();
    }
  }
};

if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
