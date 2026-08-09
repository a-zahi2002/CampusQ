import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { LogOut, User, LayoutDashboard, Trophy, Home, Sun, Moon, Sparkles } from 'lucide-react';
import InterestsModal from './InterestsModal';

const Navbar = ({ onInterestsSaved }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isInterestsOpen, setIsInterestsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <>
      <nav className="glass-card sticky top-0 z-50 transition-all duration-500 rounded-b-3xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center gap-10">
              <Link to="/feed" className="flex items-center gap-3 group">
                <div className="p-2 bg-orange-100 dark:bg-orange-950 rounded-xl group-hover:rotate-12 transition-transform duration-300">
                  <img src="/logo.png" alt="CampusQ Logo" className="h-8 w-8 object-contain" />
                </div>
                <span className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter">
                  Campus<span className="text-orange-600 dark:text-orange-500">Q</span>
                </span>
              </Link>
              
              <div className="hidden md:flex items-center gap-2">
                {[
                  { to: '/feed', icon: Home, label: 'Feed' },
                  { to: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
                  ...(user.role === 'admin' ? [{ to: '/admin', icon: LayoutDashboard, label: 'Admin' }] : [])
                ].map((item) => (
                  <Link 
                    key={item.to}
                    to={item.to} 
                    className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 font-bold px-4 py-2 rounded-xl hover:bg-orange-50 dark:hover:bg-orange-950/30 transition-all duration-300"
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsInterestsOpen(true)}
                className="hidden sm:flex items-center gap-2 px-4 py-2 bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-500 hover:bg-orange-100 dark:hover:bg-orange-900/40 rounded-2xl border border-orange-200/50 dark:border-orange-500/20 text-xs font-black transition-all"
                title="Manage Academic Interests"
              >
                <Sparkles className="h-4 w-4" />
                My Interests
              </button>

              <button
                onClick={toggleTheme}
                className="p-3 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:scale-110 active:scale-95 transition-all shadow-inner"
                title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
              >
                {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              </button>

              <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-white/5">
                <div className="flex flex-col items-end">
                  <span className="text-sm font-black text-gray-900 dark:text-white">{user.nickname}</span>
                  <span className="text-[10px] uppercase tracking-widest text-orange-600 dark:text-orange-500 font-bold">{user.role}</span>
                </div>
                <div className="h-10 w-10 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
                  <User className="h-6 w-6 text-orange-600 dark:text-orange-500" />
                </div>
              </div>
              
              <button
                onClick={handleLogout}
                className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-2xl hover:bg-red-600 hover:text-white transition-all group"
                title="Logout"
              >
                <LogOut className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <InterestsModal
        isOpen={isInterestsOpen}
        onClose={() => setIsInterestsOpen(false)}
        onSaveSuccess={onInterestsSaved}
      />
    </>
  );
};

export default Navbar;
