import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, LayoutDashboard, Trophy, Home } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <nav className="bg-white border-b sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-8">
            <Link to="/feed" className="flex items-center gap-2">
              <span className="text-2xl font-black text-indigo-600 tracking-tighter">CampusQ</span>
            </Link>
            
            <div className="hidden md:flex items-center gap-4">
              <Link to="/feed" className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 font-medium px-3 py-2 rounded-lg transition-colors">
                <Home className="h-4 w-4" />
                Feed
              </Link>
              <Link to="/leaderboard" className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 font-medium px-3 py-2 rounded-lg transition-colors">
                <Trophy className="h-4 w-4" />
                Leaderboard
              </Link>
              {user.role === 'admin' && (
                <Link to="/admin" className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 font-medium px-3 py-2 rounded-lg transition-colors">
                  <LayoutDashboard className="h-4 w-4" />
                  Admin
                </Link>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end mr-2">
              <span className="text-sm font-bold text-gray-900">{user.nickname}</span>
              <span className="text-xs text-gray-500 capitalize">{user.role}</span>
            </div>
            
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-xl font-bold hover:bg-red-100 transition-all border border-red-100"
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
