const API_BASE = 'http://localhost:5000/api';

async function runIsolationTests() {
  console.log('🧪 Starting BLOODLINK AI Hospital Isolation Security Tests...\n');

  try {
    // Helper function to login and get JWT token
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

    // 1. Login as Donor
    console.log('Step 1: Logging in as Donor (donor@bloodlink.ai)...');
    const donorToken = await login('donor@bloodlink.ai', 'Donor@123');
    const donorHeaders = { 'Authorization': `Bearer ${donorToken}`, 'Content-Type': 'application/json' };

    // 2. Fetch Active Hospitals
    console.log('Step 2: Fetching registered active hospitals list...');
    const hospRes = await fetch(`${API_BASE}/hospitals`, { headers: donorHeaders });
    const hospData = await hospRes.json();
    const hospitals = hospData.hospitals;

    const hospitalA = hospitals.find(h => h.email === 'hospital@bloodlink.ai') || hospitals[0];
    const hospitalB = hospitals.find(h => h.email === 'stjude@hospital.org') || hospitals[1];

    console.log(`   Hospital A: ${hospitalA.hospitalName} (${hospitalA._id})`);
    console.log(`   Hospital B: ${hospitalB.hospitalName} (${hospitalB._id})`);

    // 3. Donor creates donation targeting Hospital A
    console.log('\nStep 3: Donor creating blood donation request assigned to Hospital A...');
    const donationPayload = {
      hospitalId: hospitalA._id,
      preferredDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      preferredTime: '10:00 AM - 12:00 PM',
      location: `${hospitalA.hospitalName}, ${hospitalA.city}`,
      donationType: 'Whole Blood',
      healthDeclaration: { feelingWell: true, accurateInfoConfirmed: true },
      notes: 'Test donation for isolation verification.'
    };

    let createdDonationId;
    const createRes = await fetch(`${API_BASE}/donations`, {
      method: 'POST',
      headers: donorHeaders,
      body: JSON.stringify(donationPayload)
    });
    const createData = await createRes.json();

    if (createRes.status === 201 && createData.success) {
      createdDonationId = createData.donation._id;
      console.log(`   ✅ Donation created successfully! ID: ${createdDonationId} (Code: ${createData.donation.donationId})`);
    } else if (createRes.status === 409) {
      console.log(`   ℹ️ Active donation already exists (ID: ${createData.activeDonationId}). Using existing active donation...`);
      createdDonationId = createData.activeDonationId;
    } else {
      throw new Error(`Donation creation failed: ${createData.message}`);
    }

    // 4. Login as Hospital A & verify donation is returned
    console.log('\nStep 4: Logging in as Hospital A (hospital@bloodlink.ai)...');
    const hospAToken = await login('hospital@bloodlink.ai', 'Hospital@123');
    const hospAHeaders = { 'Authorization': `Bearer ${hospAToken}` };

    const getARes = await fetch(`${API_BASE}/donations`, { headers: hospAHeaders });
    const getAData = await getARes.json();

    if (!getARes.ok) {
      throw new Error(`Hospital A GET /api/donations error: Status ${getARes.status} ${JSON.stringify(getAData)}`);
    }

    const donationsA = getAData.donations || [];
    const foundInA = donationsA.some(d => d._id === createdDonationId);
    console.log(`   Hospital A GET /api/donations count: ${donationsA.length}. Created donation found: ${foundInA ? '✅ YES' : '❌ NO'}`);
    if (!foundInA) throw new Error('Hospital A failed to retrieve donation assigned to it!');

    // 5. Login as Hospital B & verify donation is NOT returned in list
    console.log('\nStep 5: Logging in as Hospital B (stjude@hospital.org)...');
    const hospBToken = await login('stjude@hospital.org', 'Hospital@123');
    const hospBHeaders = { 'Authorization': `Bearer ${hospBToken}`, 'Content-Type': 'application/json' };

    const getBRes = await fetch(`${API_BASE}/donations`, { headers: hospBHeaders });
    const getBData = await getBRes.json();

    if (!getBRes.ok) {
      throw new Error(`Hospital B GET /api/donations error: Status ${getBRes.status} ${JSON.stringify(getBData)}`);
    }

    const donationsB = getBData.donations || [];
    const foundInB = donationsB.some(d => d._id === createdDonationId);
    console.log(`   Hospital B GET /api/donations count: ${donationsB.length}. Created donation found: ${foundInB ? '❌ LEAKED (FAIL)' : '✅ ISOLATED (PASSED - NOT RETURNED)'}`);
    if (foundInB) throw new Error('SECURITY BREACH: Hospital B was able to view Hospital A donation in list!');

    // 6. Direct ID Attack: Hospital B attempts GET /api/donations/:id
    console.log('\nStep 6: Testing Direct ID Access Attack (Hospital B requesting Hospital A donation by ID)...');
    const directGetRes = await fetch(`${API_BASE}/donations/${createdDonationId}`, { headers: hospBHeaders });
    const directGetData = await directGetRes.json();
    if (directGetRes.status === 403) {
      console.log(`   ✅ PASSED: Server rejected request with 403 Forbidden! Message: "${directGetData.message}"`);
    } else {
      console.log(`   ❌ SECURITY BREACH! Expected 403 Forbidden, got status ${directGetRes.status} ${JSON.stringify(directGetData)}`);
      throw new Error(`Direct ID access security test failed!`);
    }

    // 7. Direct ID Attack: Hospital B attempts PATCH /api/donations/:id/status
    console.log('\nStep 7: Testing Direct Modification Attack (Hospital B updating Hospital A donation status)...');
    const directPatchRes = await fetch(`${API_BASE}/donations/${createdDonationId}/status`, {
      method: 'PATCH',
      headers: hospBHeaders,
      body: JSON.stringify({ status: 'APPROVED' })
    });
    const directPatchData = await directPatchRes.json();
    if (directPatchRes.status === 403) {
      console.log(`   ✅ PASSED: Server rejected update with 403 Forbidden! Message: "${directPatchData.message}"`);
    } else {
      console.log(`   ❌ SECURITY BREACH! Expected 403 Forbidden, got status ${directPatchRes.status} ${JSON.stringify(directPatchData)}`);
      throw new Error(`Direct status modification security test failed!`);
    }

    // 8. Admin Global Access Test
    console.log('\nStep 8: Logging in as ADMIN (admin@bloodlink.ai)...');
    const adminToken = await login('admin@bloodlink.ai', 'Admin@123');
    const adminHeaders = { 'Authorization': `Bearer ${adminToken}` };

    const getAdminRes = await fetch(`${API_BASE}/donations`, { headers: adminHeaders });
    const getAdminData = await getAdminRes.json();
    const donationsAdmin = getAdminData.donations || [];
    const foundInAdmin = donationsAdmin.some(d => d._id === createdDonationId);
    console.log(`   ADMIN GET /api/donations total count: ${donationsAdmin.length}. Created donation found: ${foundInAdmin ? '✅ GLOBAL ACCESS VERIFIED' : '❌ NOT RETURNED'}`);

    console.log('\n🎉 ALL HOSPITAL ISOLATION SECURITY TESTS PASSED SUCCESSFULLY!');
  } catch (err) {
    console.error('\n❌ Isolation Test Failed:', err.message);
    process.exitCode = 1;
  }
}

runIsolationTests();
