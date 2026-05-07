import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { LogOut, User, LayoutDashboard, Trophy, Home, Sun, Moon } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <nav className="bg-white dark:bg-gray-900 border-b dark:border-gray-800 sticky top-0 z-50 shadow-sm transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-8">
            <Link to="/feed" className="flex items-center gap-2">
              <img src="/logo.png" alt="CampusQ Logo" className="h-8 w-8 object-contain" />
              <span className="text-2xl font-black text-indigo-600 tracking-tighter">CampusQ</span>
            </Link>
            
            <div className="hidden md:flex items-center gap-4">
              <Link to="/feed" className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-orange-500 font-medium px-3 py-2 rounded-lg transition-colors">
                <Home className="h-4 w-4" />
                Feed
              </Link>
              <Link to="/leaderboard" className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-orange-500 font-medium px-3 py-2 rounded-lg transition-colors">
                <Trophy className="h-4 w-4" />
                Leaderboard
              </Link>
              {user.role === 'admin' && (
                <Link to="/admin" className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-orange-500 font-medium px-3 py-2 rounded-lg transition-colors">
                  <LayoutDashboard className="h-4 w-4" />
                  Admin
                </Link>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all shadow-sm"
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            >
              {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </button>

            <div className="flex flex-col items-end mr-2">
              <span className="text-sm font-bold text-gray-900 dark:text-white">{user.nickname}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user.role}</span>
            </div>
            
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-4 py-2 rounded-xl font-bold hover:bg-red-100 dark:hover:bg-red-900/30 transition-all border border-red-100 dark:border-red-900/50"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
