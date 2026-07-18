import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
  Calendar,
  Home,
  Bell,
  LogOut,
  Menu,
  X,
  Stethoscope,
  UserCircle,
} from 'lucide-react';
import { useAuthStore } from '@/context/authStore';

const navigation = [
  { name: 'Overview', href: '/dashboard', icon: Home },
  { name: 'Appointments', href: '/appointments', icon: Calendar },
  { name: 'Notifications', href: '/notifications', icon: Bell },
];

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-[#f4f6f5]">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-primary-800 text-primary-50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between px-6 py-6">
            <Link to="/" className="flex items-center gap-2.5">
              <Stethoscope className="w-6 h-6 text-primary-50" />
              <span className="text-lg font-display font-semibold tracking-tight">MediBook</span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-md hover:bg-primary-700/60"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center px-3 py-2.5 rounded-md text-sm transition-colors ${
                    active
                      ? 'bg-primary-50/15 font-medium text-white'
                      : 'text-primary-100/70 hover:bg-primary-50/10 hover:text-primary-50'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2.5" />
                  {item.name}
                </Link>
              );
            })}
            <Link
              to="/appointments/book"
              onClick={() => setSidebarOpen(false)}
              className="flex items-center justify-center gap-2 mt-4 px-3 py-2.5 rounded-md text-sm font-medium bg-accent-500 text-white hover:bg-accent-600 transition-colors"
            >
              <Calendar className="w-4 h-4" />
              Book a visit
            </Link>
          </nav>

          {/* User profile section */}
          <div className="px-4 py-4 border-t border-primary-50/10">
            <div className="flex items-center px-2 py-2 mb-1">
              <UserCircle className="w-8 h-8 text-primary-100/70" />
              <div className="ml-2.5 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-primary-100/60 capitalize">{user?.role}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-3 py-2 text-sm text-primary-100/70 hover:text-white hover:bg-primary-50/10 rounded-md transition-colors"
            >
              <LogOut className="w-4 h-4 mr-2.5" />
              Sign out
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top header */}
        <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-primary-50">
          <div className="flex items-center justify-between px-4 py-4 lg:px-8">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-md hover:bg-primary-50"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div className="hidden lg:block">
              <h1 className="text-lg font-display font-semibold text-primary-900">
                {navigation.find((n) => isActive(n.href))?.name || 'Overview'}
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <Link
                to="/notifications"
                className="relative p-2 rounded-md hover:bg-primary-50 transition-colors"
              >
                <Bell className="w-5 h-5 text-primary-700" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent-500 rounded-full" />
              </Link>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="px-4 py-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
