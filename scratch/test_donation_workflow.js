const API_BASE = 'http://localhost:5000/api';

async function runWorkflowTests() {
  console.log('🧪 Starting BLOODLINK AI Complete Donation Workflow Lifecycle Tests...\n');

  try {
    const login = async (email, password) => {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!data.success) throw new Error(`Login failed for ${email}: ${data.message}`);
      return data.token;
    };

    // 1. Donor Login & Hospital Fetch
    console.log('Step 1: Logging in as Donor (donor@bloodlink.ai)...');
    const donorToken = await login('donor@bloodlink.ai', 'Donor@123');
    const donorHeaders = { 'Authorization': `Bearer ${donorToken}`, 'Content-Type': 'application/json' };

    const hospRes = await fetch(`${API_BASE}/hospitals`, { headers: donorHeaders });
    const hospData = await hospRes.json();
    const targetHospital = hospData.hospitals[0];

    console.log(`   Target Hospital: ${targetHospital.hospitalName} (${targetHospital._id})`);

    // 2. Create Donation (DONATION_REQUESTED)
    console.log('\nStep 2: Submitting donor donation request...');
    const donationPayload = {
      hospitalId: targetHospital._id,
      preferredDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
      preferredTime: '10:00 AM - 12:00 PM',
      location: `${targetHospital.hospitalName}, ${targetHospital.city}`,
      donationType: 'Whole Blood',
      healthDeclaration: { feelingWell: true, accurateInfoConfirmed: true },
      notes: 'Workflow test donation.'
    };

    const createRes = await fetch(`${API_BASE}/donations`, {
      method: 'POST',
      headers: donorHeaders,
      body: JSON.stringify(donationPayload)
    });
    const createData = await createRes.json();

    let donationId;
    if (createRes.status === 201) {
      donationId = createData.donation._id;
      console.log(`   ✅ Created donation ID: ${donationId} (Status: ${createData.donation.status})`);
    } else if (createRes.status === 409) {
      donationId = createData.activeDonationId;
      console.log(`   ℹ️ Using active donation ID: ${donationId} (Status: ${createData.status})`);
    } else {
      throw new Error(`Failed to create donation: ${createData.message}`);
    }

    // Hospital Login
    console.log('\nStep 3: Logging in as Hospital Staff (hospital@bloodlink.ai)...');
    const hospToken = await login('hospital@bloodlink.ai', 'Hospital@123');
    const hospHeaders = { 'Authorization': `Bearer ${hospToken}`, 'Content-Type': 'application/json' };

    const patchStatus = async (targetStatus, extra = {}) => {
      const res = await fetch(`${API_BASE}/donations/${donationId}/status`, {
        method: 'PATCH',
        headers: hospHeaders,
        body: JSON.stringify({ status: targetStatus, ...extra })
      });
      const data = await res.json();
      return { status: res.status, data };
    };

    // Transition 1: SCHEDULED
    console.log('Step 4: Hospital scheduling appointment (SCHEDULED)...');
    let res = await patchStatus('SCHEDULED', { preferredDate: new Date(Date.now() + 86400000).toISOString().split('T')[0] });
    console.log(`   Result: Status ${res.status} -> ${res.data.donation?.status || res.data.message}`);

    // Transition 2: CHECK_IN (Validating SCHEDULED -> CHECK_IN)
    console.log('\nStep 5: Testing SCHEDULED -> CHECK_IN transition (Check In Donor)...');
    res = await patchStatus('CHECK_IN');
    if (res.status === 200 && res.data.donation.status === 'CHECK_IN') {
      console.log(`   ✅ PASSED: Transitioned SCHEDULED -> CHECK_IN successfully!`);
    } else {
      throw new Error(`SCHEDULED -> CHECK_IN failed: ${res.data.message}`);
    }

    // Transition 3: DONATED (CHECK_IN -> DONATED)
    console.log('\nStep 6: Testing CHECK_IN -> DONATED transition (Complete Blood Collection)...');
    res = await patchStatus('DONATED');
    if (res.status === 200 && res.data.donation.status === 'DONATED') {
      console.log(`   ✅ PASSED: Transitioned CHECK_IN -> DONATED successfully!`);
    } else {
      throw new Error(`CHECK_IN -> DONATED failed: ${res.data.message}`);
    }

    // Transition 4: TESTING (DONATED -> TESTING)
    console.log('\nStep 7: Testing DONATED -> TESTING transition (Lab Testing)...');
    res = await patchStatus('TESTING');
    if (res.status === 200 && res.data.donation.status === 'TESTING') {
      console.log(`   ✅ PASSED: Transitioned DONATED -> TESTING successfully!`);
    } else {
      throw new Error(`DONATED -> TESTING failed: ${res.data.message}`);
    }

    // Transition 5: AVAILABLE (TESTING -> AVAILABLE)
    console.log('\nStep 8: Testing TESTING -> AVAILABLE transition (Complete & Add to Inventory)...');
    res = await patchStatus('AVAILABLE');
    if (res.status === 200 && res.data.donation.status === 'AVAILABLE') {
      console.log(`   ✅ PASSED: Transitioned TESTING -> AVAILABLE successfully!`);
      console.log(`   📦 Inventory Unit Registered: ${res.data.donation.bloodUnitRef || 'Created'}`);
    } else {
      throw new Error(`TESTING -> AVAILABLE failed: ${res.data.message}`);
    }

    console.log('\n🎉 ALL DONATION WORKFLOW LIFECYCLE TESTS PASSED 100% CLEANLY!');
  } catch (err) {
    console.error('\n❌ Workflow Test Failed:', err.message);
    process.exitCode = 1;
  }
}

runWorkflowTests();
