import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { SearchBar } from '../components/common/SearchBar';
import { Building2, Phone, MapPin, Navigation } from 'lucide-react';

export const NearbyBloodBanksPage = () => {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchCity, setSearchCity] = useState('');
  const [userLocation, setUserLocation] = useState(null);

  const fetchHospitals = async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchCity) params.city = searchCity;
      const { data } = await api.get('/hospitals', { params });
      if (data.success) {
        setHospitals(data.hospitals);
      }
    } catch (err) {
      console.error('Failed to fetch nearby blood banks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHospitals();
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => setUserLocation({ latitude: coords.latitude, longitude: coords.longitude }),
        () => setUserLocation(null),
        { enableHighAccuracy: false, timeout: 5000, maximumAge: 300000 }
      );
    }
  }, [searchCity]);

  const distanceKm = (latitude, longitude) => {
    if (!userLocation || latitude == null || longitude == null) return null;
    const toRad = value => (value * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(latitude - userLocation.latitude);
    const dLon = toRad(longitude - userLocation.longitude);
    const a = Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(userLocation.latitude)) * Math.cos(toRad(latitude)) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Nearby Blood Banks & Emergency Repositories</h1>
          <p className="text-xs text-slate-500 mt-1">Discover nearby partner blood banks, hospital emergency centers, and dispatch hubs</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between">
        <SearchBar value={searchCity} onChange={setSearchCity} placeholder="Search by city (e.g. Metropolis, Suburbia)..." />
      </div>

      {loading ? (
        <LoadingSpinner text="Locating nearby blood banks and emergency centers..." />
      ) : hospitals.length === 0 ? (
        <div className="p-10 bg-white rounded-xl border border-slate-200 text-center text-slate-400 text-xs">
          No nearby blood bank facilities found for the specified city.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {hospitals.map((h, idx) => {
            const distance = distanceKm(h.location?.latitude, h.location?.longitude);
            return (
            <div key={h._id || idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 hover:border-blood-300 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blood-50 border border-blood-200 rounded-xl flex items-center justify-center text-blood-600 font-bold">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">{h.hospitalName}</h3>
                    <p className="text-xs text-slate-400 font-mono">Reg #: {h.registrationNumber}</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center space-x-1">
                  <Navigation className="w-3 h-3" />
                  <span>{distance != null ? `${distance.toFixed(1)} km away` : 'Location on file'}</span>
                </span>
              </div>

              <div className="space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-3">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{h.address?.street || 'Central Way'}, {h.city}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-blood-600 shrink-0" />
                  <span>Emergency Hotline: <strong className="text-slate-900">{h.emergencyContact || h.phone}</strong></span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                <span className="text-slate-500 font-medium">Contact: {h.contactPerson}</span>
                <a
                  href={`tel:${h.emergencyContact || h.phone}`}
                  className="px-3 py-1.5 bg-blood-600 hover:bg-blood-700 text-white rounded-lg font-bold text-xs shadow-xs"
                >
                  Call Emergency Desk
                </a>
              </div>
            </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
