import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  HomeIcon,
  Cog6ToothIcon,
  UsersIcon,
  WrenchScrewdriverIcon,
  ArrowLeftOnRectangleIcon
} from '@heroicons/react/24/outline';

const navLinks = [
  { to: '/admin', icon: HomeIcon, label: 'Overview' },
  { to: '/admin/users', icon: UsersIcon, label: 'Users' },
  { to: '/admin/tools', icon: WrenchScrewdriverIcon, label: 'Tools' },
  { to: '/admin/settings', icon: Cog6ToothIcon, label: 'Settings' },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6 lg:p-8">
      <div className="grid gap-6 lg:grid-cols-[250px_1fr]">
        {/* Sidebar */}
        <aside className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg h-fit transition-all duration-300 ease-in-out">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
            <span className="text-xl font-bold tracking-tight text-blue-600">Admin Panel</span>
          </div>

          {/* User Info */}
          {user && (
            <div className="mb-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-sm text-blue-600 font-medium">{user.role}</div>
              <div className="text-xs text-blue-500 truncate">{user.email}</div>
            </div>
          )}

          <nav className="flex flex-col gap-2">
            {navLinks.map((link, index) => (
              <NavLink
                key={index}
                end={link.to === '/admin'}
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium
                  ${isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'}`
                }
              >
                <link.icon className="h-5 w-5" aria-hidden="true" />
                <span>{link.label}</span>
              </NavLink>
            ))}
          </nav>
          
          <div className="mt-8 pt-4 border-t border-gray-200">
            <button 
              onClick={handleLogout}
              className="flex w-full items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium text-gray-500 hover:bg-red-50 hover:text-red-600"
            >
              <ArrowLeftOnRectangleIcon className="h-5 w-5" aria-hidden="true" />
              <span>Log out</span>
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="bg-white border border-gray-200 rounded-2xl p-8 shadow-lg">
          <Outlet />
        </main>
      </div>
    </div>
  );
}