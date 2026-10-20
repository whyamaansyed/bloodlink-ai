import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BLOOD_GROUPS } from '../utils/constants';

export const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState('HOSPITAL');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    street: '100 Healthcare Ave',
    city: 'Metropolis',
    state: 'NY',
    zipCode: '10001',
    // Hospital extra fields
    hospitalName: '',
    registrationNumber: '',
    contactPerson: '',
    emergencyContact: '',
    // Donor extra fields
    bloodGroup: 'O+',
    gender: 'Male',
    dateOfBirth: '1995-05-15'
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        name: role === 'HOSPITAL' ? formData.hospitalName || formData.name : formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        role,
        address: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode
        },
        extraDetails: role === 'HOSPITAL' ? {
          hospitalName: formData.hospitalName || formData.name,
          registrationNumber: formData.registrationNumber || `REG-${Date.now()}`,
          contactPerson: formData.contactPerson || formData.name,
          city: formData.city,
          emergencyContact: formData.emergencyContact || formData.phone
        } : {
          bloodGroup: formData.bloodGroup,
          dateOfBirth: formData.dateOfBirth,
          gender: formData.gender
        }
      };

      const user = await register(payload);
      if (user.role === 'HOSPITAL') navigate('/hospital/dashboard');
      else navigate('/donor/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-center text-2xl font-bold tracking-tight text-slate-900">Create New Account</h2>
        <p className="mt-1 text-center text-xs text-slate-500">Register as a Hospital Facility or Voluntary Donor</p>
      </div>

      {/* Role Selection Tabs */}
      <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-200/50 backdrop-blur-sm rounded-2xl">
        <button
          type="button"
          onClick={() => setRole('HOSPITAL')}
          className={`py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all duration-300 ${
            role === 'HOSPITAL' ? 'bg-white text-blood-600 shadow-[0_4px_15px_rgb(0,0,0,0.05)] scale-[1.02]' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
          }`}
        >
          Hospital
        </button>
        <button
          type="button"
          onClick={() => setRole('DONOR')}
          className={`py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all duration-300 ${
            role === 'DONOR' ? 'bg-white text-blood-600 shadow-[0_4px_15px_rgb(0,0,0,0.05)] scale-[1.02]' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
          }`}
        >
          Donor
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-700 text-xs font-semibold rounded-xl border border-red-200">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {role === 'HOSPITAL' ? (
          <>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Hospital Name</label>
              <input
                type="text"
                name="hospitalName"
                value={formData.hospitalName}
                onChange={handleChange}
                placeholder="e.g. St. Jude Emergency Hospital"
                className="w-full p-2.5 text-sm border border-slate-300 rounded-xl"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Registration #</label>
                <input
                  type="text"
                  name="registrationNumber"
                  value={formData.registrationNumber}
                  onChange={handleChange}
                  placeholder="REG-HOSP-902"
                  className="w-full p-2.5 text-sm border border-slate-300 rounded-xl"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Contact Person</label>
                <input
                  type="text"
                  name="contactPerson"
                  value={formData.contactPerson}
                  onChange={handleChange}
                  placeholder="Dr. Smith"
                  className="w-full p-2.5 text-sm border border-slate-300 rounded-xl"
                  required
                />
              </div>
            </div>
          </>
        ) : (
          <>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. John Doe"
                className="w-full p-2.5 text-sm border border-slate-300 rounded-xl"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Blood Group</label>
                <select
                  name="bloodGroup"
                  value={formData.bloodGroup}
                  onChange={handleChange}
                  className="w-full p-2.5 text-sm border border-slate-300 rounded-xl font-bold text-blood-600"
                >
                  {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full p-2.5 text-sm border border-slate-300 rounded-xl"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="email@domain.com"
              className="w-full p-2.5 text-sm border border-slate-300 rounded-xl"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+1 555-0192"
              className="w-full p-2.5 text-sm border border-slate-300 rounded-xl"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Min 6 characters"
            className="w-full p-2.5 text-sm border border-slate-300 rounded-xl"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-gradient-to-r from-blood-600 to-blood-500 hover:from-blood-500 hover:to-blood-400 text-white font-black text-sm uppercase tracking-wider rounded-xl shadow-[0_8px_20px_rgb(239,68,68,0.25)] hover:shadow-[0_12px_25px_rgb(239,68,68,0.35)] transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none"
        >
          {loading ? 'Creating account...' : `Secure Registration`}
        </button>
      </form>

      <p className="text-center text-xs text-slate-500">
        Already registered?{' '}
        <Link to="/login" className="font-bold text-blood-600 hover:underline">
          Sign In
        </Link>
      </p>
    </div>
  );
};
