import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, LogIn, UserCircle, GraduationCap, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'student'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const successMessage = location.state?.message;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const trimmedEmail = formData.email.trim().toLowerCase();
    const result = await login(trimmedEmail, formData.password);
    
    if (result.success) {
      navigate('/feed');
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa] dark:bg-gray-950 p-6 relative overflow-hidden">
      {/* Abstract Background Elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-500/5 blur-[120px] rounded-full -mr-64 -mt-64" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-orange-500/5 blur-[120px] rounded-full -ml-64 -mb-64" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] shadow-2xl shadow-orange-500/5 border border-gray-100 dark:border-white/5 relative z-10"
      >
        <div className="text-center mb-6">
          <div className="inline-flex p-4 bg-orange-500/10 rounded-2xl mb-6">
            <ShieldCheck className="h-10 w-10 text-orange-600" />
          </div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter mb-2">CampusQ</h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium">Elevate your academic journey</p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {successMessage && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/30 text-green-600 dark:text-green-400 px-5 py-4 rounded-2xl text-sm font-bold"
            >
              {successMessage}
            </motion.div>
          )}
          
          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 px-5 py-4 rounded-2xl text-sm font-bold flex items-center gap-3"
            >
              <div className="h-2 w-2 rounded-full bg-red-500" />
              {error}
            </motion.div>
          )}

          <div className="space-y-4">
            <div className="flex gap-2 p-1 bg-gray-50 dark:bg-white/5 rounded-2xl">
              {[
                { id: 'student', label: 'Student', icon: GraduationCap },
                { id: 'lecturer', label: 'Lecturer', icon: UserCircle },
                { id: 'admin', label: 'Admin', icon: Lock }
              ].map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setFormData({...formData, role: r.id})}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black transition-all ${
                    formData.role === r.id 
                      ? 'bg-white dark:bg-white/10 text-orange-600 shadow-sm' 
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <r.icon className="h-4 w-4" />
                  {r.label}
                </button>
              ))}
            </div>

            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
              <input
                name="email"
                type="text"
                required
                className="w-full pl-12 pr-5 py-4 bg-gray-50 dark:bg-white/5 border-2 border-transparent focus:border-orange-500/30 rounded-2xl outline-none text-gray-900 dark:text-white font-bold transition-all placeholder:text-gray-400"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
              <input
                name="password"
                type="password"
                required
                className="w-full pl-12 pr-5 py-4 bg-gray-50 dark:bg-white/5 border-2 border-transparent focus:border-orange-500/30 rounded-2xl outline-none text-gray-900 dark:text-white font-bold transition-all placeholder:text-gray-400"
                placeholder="Account Password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="pt-0">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-orange-600 text-white rounded-2xl font-black shadow-xl shadow-orange-600/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {loading ? 'Authenticating...' : (
                <>
                  <LogIn className="h-5 w-5" />
                  Enter Workspace
                </>
              )}
            </button>
          </div>

          <div className="text-center pt-2">
            <p className="text-sm font-bold text-gray-500">
              New to CampusQ?{' '}
              <Link to="/register" className="text-orange-600 hover:underline">
                Create Identity
              </Link>
            </p>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default LoginPage;
