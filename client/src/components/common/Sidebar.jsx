import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Boxes,
  Users,
  Building2,
  FileText,
  TrendingUp,
  LineChart,
  Bell,
  SlidersHorizontal,
  User,
  History,
  AlertTriangle,
  PlusCircle,
  FileSearch,
  Navigation,
  HeartHandshake
} from 'lucide-react';

export const Sidebar = ({ mobileOpen, onMobileClose }) => {
  const { user } = useAuth();

  if (!user) return null;

  const adminNav = [
    { label: 'Admin Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Blood Inventory', path: '/admin/inventory', icon: Boxes },
    { label: 'Donor Donations Queue', path: '/admin/donations', icon: HeartHandshake },
    { label: 'Donors Directory', path: '/admin/donors', icon: Users },
    { label: 'Hospitals Directory', path: '/admin/hospitals', icon: Building2 },
    { label: 'Nearby Blood Banks', path: '/nearby-blood-banks', icon: Navigation },
    { label: 'Blood Requests Queue', path: '/admin/requests', icon: FileText },
    { label: 'Demand Analytics', path: '/admin/demand-analytics', icon: TrendingUp },
    { label: 'Demand Estimation', path: '/admin/demand-estimation', icon: LineChart },
    { label: 'Alerts & Expiry', path: '/admin/alerts', icon: AlertTriangle },
    { label: 'Notifications', path: '/admin/notifications', icon: Bell },
    { label: 'Reports & Export', path: '/admin/reports', icon: FileSearch },
    { label: 'Stock Thresholds', path: '/admin/thresholds', icon: SlidersHorizontal },
    { label: 'Admin Profile', path: '/admin/profile', icon: User }
  ];

  const hospitalNav = [
    { label: 'Hospital Dashboard', path: '/hospital/dashboard', icon: LayoutDashboard },
    { label: 'Request Portal 🩸', path: '/hospital/request-portal', icon: FileText },
    { label: 'Available Stock', path: '/hospital/available-blood', icon: Boxes },
    { label: 'Nearby Blood Banks', path: '/nearby-blood-banks', icon: Navigation },
    { label: 'Create Request', path: '/hospital/create-request', icon: PlusCircle },
    { label: 'Notifications', path: '/hospital/notifications', icon: Bell },
    { label: 'Hospital Profile', path: '/hospital/profile', icon: User }
  ];

  const donorNav = [
    { label: 'Donor Dashboard', path: '/donor/dashboard', icon: LayoutDashboard },
    { label: 'Donate Blood ❤️', path: '/donor/donate', icon: HeartHandshake },
    { label: 'Donation History', path: '/donor/donations', icon: History },
    { label: 'Nearby Blood Banks', path: '/nearby-blood-banks', icon: Navigation },
    { label: 'Notifications', path: '/donor/notifications', icon: Bell },
    { label: 'Donor Profile', path: '/donor/profile', icon: User }
  ];

  let navItems = donorNav;
  if (user.role === 'ADMIN') navItems = adminNav;
  if (user.role === 'HOSPITAL') navItems = hospitalNav;

  return (
    <>
      {mobileOpen && (
        <div
          onClick={onMobileClose}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-30 lg:hidden"
        />
      )}

      <aside
        className={`fixed lg:sticky top-[5.5rem] left-4 z-30 w-64 bg-white/70 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl h-[calc(100vh-6.5rem)] overflow-y-auto transition-all duration-300 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-4 space-y-1">
          <div className="px-3 py-2 mb-2">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              {user.role} NAVIGATION
            </p>
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onMobileClose}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-r from-blood-600 to-blood-500 text-white shadow-[0_4px_15px_rgb(239,68,68,0.25)] scale-[1.02]'
                      : 'text-slate-600 hover:bg-slate-100/50 hover:text-slate-900 hover:scale-[1.02]'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </aside>
    </>
  );
};
