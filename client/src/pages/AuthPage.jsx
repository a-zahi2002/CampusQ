import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { 
  Mail, 
  Lock, 
  LogIn, 
  UserCircle, 
  GraduationCap, 
  User, 
  ArrowRight,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Eye,
  EyeOff
} from 'lucide-react';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loginData, setLoginData] = useState({ email: '', password: '', role: 'student' });
  const [registerData, setRegisterData] = useState({ email: '', nickname: '', password: '', role: 'student' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === '/register') {
      setIsLogin(false);
    } else {
      setIsLogin(true);
    }
  }, [location.pathname]);

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    navigate(!isLogin ? '/login' : '/register');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(loginData.email.trim().toLowerCase(), loginData.password);
    if (result.success) {
      // Automatic redirection based on role
      const storedUser = JSON.parse(localStorage.getItem('user'));
      if (storedUser?.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/feed');
      }
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await register(registerData);
    if (result.success) {
      setIsLogin(true);
      navigate('/login', { state: { message: 'Registration successful! Please login.' } });
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  const inputClasses = "w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all text-gray-700";
  const iconClasses = "absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400";

  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-gray-950 flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans transition-colors duration-500">
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-100 dark:bg-orange-900/10 rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-100 dark:bg-orange-900/10 rounded-full blur-3xl opacity-50" />
      </div>

      <div className="relative w-full max-w-5xl h-[600px] glass-card rounded-[3rem] border-transparent overflow-hidden flex flex-col md:flex-row transition-all duration-500 shadow-2xl shadow-orange-500/10">
        
        {/* Sliding Info Panel (Overlay) */}
        <motion.div 
          className="absolute top-0 bottom-0 z-20 hidden md:flex flex-col justify-center items-center p-16 text-white bg-gradient-to-br from-orange-600 to-orange-700"
          initial={false}
          animate={{ 
            x: isLogin ? '0%' : '100%',
            width: '50%'
          }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
        >
          <div className="text-center space-y-8">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-white/20 p-5 rounded-[2rem] backdrop-blur-md inline-block mb-4 shadow-xl"
            >
              <img src="/logo.png" alt="CampusQ" className="h-20 w-20 object-contain invert brightness-200" />
            </motion.div>
            
            <h1 className="text-6xl font-black tracking-tighter">Campus<span className="opacity-50">Q</span></h1>
            <p className="text-orange-50 text-xl max-w-xs mx-auto leading-relaxed font-medium">
              {isLogin 
                ? "Unlock a world of academic excellence and collaborative learning." 
                : "Your journey towards academic mastery continues here."}
            </p>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleMode}
              className="px-10 py-4 bg-white text-orange-600 font-black rounded-2xl shadow-2xl hover:bg-orange-50 transition-all flex items-center gap-3 mx-auto uppercase tracking-widest text-sm"
            >
              {isLogin ? 'Join Community' : 'Access Account'}
              <ChevronRight className="h-5 w-5" />
            </motion.button>
          </div>
        </motion.div>

        {/* Forms Container */}
        <div className="relative flex-1 flex flex-col md:flex-row h-full bg-white dark:bg-[#0A0A0A]">
          
          {/* Register Form Section */}
          <div className={`flex-1 h-full flex flex-col justify-center p-8 md:p-12 transition-opacity duration-300 ${isLogin && 'opacity-0 pointer-events-none md:opacity-100'}`}>
            <div className="max-w-md mx-auto w-full space-y-6">
              <div className="md:hidden text-center mb-10">
                <img src="/logo.png" alt="CampusQ" className="h-16 w-16 mx-auto mb-4" />
                <h1 className="text-4xl font-black text-gray-900 dark:text-white">CampusQ</h1>
              </div>

              <div className="space-y-3">
                <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Create Account</h2>
                <p className="text-gray-500 dark:text-gray-400 font-medium text-base">Join 5,000+ students & lecturers</p>
              </div>

              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                {error && !isLogin && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-bold rounded-2xl border border-red-100 dark:border-red-900/30 flex items-center gap-3"
                  >
                    <ShieldCheck className="h-5 w-5 flex-shrink-0" />
                    {error}
                  </motion.div>
                )}

                <div className="space-y-4">
                   <div className="flex p-1.5 bg-gray-100 dark:bg-white/5 rounded-2xl">
                    {['student', 'lecturer'].map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setRegisterData({...registerData, role: r})}
                        className={`flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                          registerData.role === r ? 'bg-white dark:bg-orange-600 text-orange-600 dark:text-white shadow-xl' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>

                  <div className="relative group">
                    <User className={`${iconClasses} group-focus-within:text-orange-500 transition-colors`} />
                    <input
                      type="text"
                      required
                      placeholder="Username"
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-white/5 border-2 border-transparent rounded-2xl focus:border-orange-500/50 focus:bg-white dark:focus:bg-transparent outline-none transition-all text-gray-900 dark:text-white font-medium placeholder-gray-400"
                      value={registerData.nickname}
                      onChange={(e) => setRegisterData({...registerData, nickname: e.target.value})}
                    />
                  </div>

                  <div className="relative group">
                    <Mail className={`${iconClasses} group-focus-within:text-orange-500 transition-colors`} />
                    <input
                      type="email"
                      required
                      placeholder="University Email"
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-white/5 border-2 border-transparent rounded-2xl focus:border-orange-500/50 focus:bg-white dark:focus:bg-transparent outline-none transition-all text-gray-900 dark:text-white font-medium placeholder-gray-400"
                      value={registerData.email}
                      onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
                    />
                  </div>

                  <div className="relative group">
                    <Lock className={`${iconClasses} group-focus-within:text-orange-500 transition-colors`} />
                    <input
                      type={showRegisterPassword ? "text" : "password"}
                      required
                      placeholder="Secure Password"
                      className="w-full pl-12 pr-12 py-4 bg-gray-50 dark:bg-white/5 border-2 border-transparent rounded-2xl focus:border-orange-500/50 focus:bg-white dark:focus:bg-transparent outline-none transition-all text-gray-900 dark:text-white font-medium placeholder-gray-400"
                      value={registerData.password}
                      onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-500 transition-colors"
                    >
                      {showRegisterPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <input type="checkbox" required className="mt-1 w-5 h-5 rounded-lg border-gray-300 dark:border-white/10 text-orange-600 focus:ring-orange-500 dark:bg-white/5 cursor-pointer" />
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
                      I agree to the <a href="#" className="text-orange-600 dark:text-orange-500 font-bold hover:underline">Terms of Service</a> and <a href="#" className="text-orange-600 dark:text-orange-500 font-bold hover:underline">Privacy Policy</a>.
                    </p>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={loading}
                    className="w-full py-4 bg-orange-600 text-white font-black rounded-[1.5rem] shadow-2xl shadow-orange-500/30 hover:bg-orange-700 transition-all disabled:opacity-70 flex items-center justify-center gap-3 uppercase tracking-widest text-sm"
                  >
                    {loading ? 'Initializing...' : 'Create Account'}
                    <CheckCircle2 className="h-5 w-5" />
                  </motion.button>
                </div>
              </form>

              <p className="md:hidden text-center text-sm text-gray-600 dark:text-gray-400 font-bold">
                Already member? 
                <button onClick={toggleMode} className="ml-2 text-orange-600 dark:text-orange-500 underline">Sign In</button>
              </p>
            </div>
          </div>
          
          {/* Login Form Section */}
          <div className={`flex-1 h-full flex flex-col justify-center p-8 md:p-12 transition-opacity duration-300 ${!isLogin && 'opacity-0 pointer-events-none md:opacity-100'}`}>
            <div className="max-w-md mx-auto w-full space-y-6">
              <div className="md:hidden text-center mb-10">
                <img src="/logo.png" alt="CampusQ" className="h-16 w-16 mx-auto mb-4" />
                <h1 className="text-4xl font-black text-gray-900 dark:text-white">CampusQ</h1>
              </div>
              
              <div className="space-y-3">
                <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Welcome Back</h2>
                <p className="text-gray-500 dark:text-gray-400 font-medium text-base">Sign in to your academic portal</p>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                {error && isLogin && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-bold rounded-2xl border border-red-100 dark:border-red-900/30 flex items-center gap-3"
                  >
                    <ShieldCheck className="h-5 w-5 flex-shrink-0" />
                    {error}
                  </motion.div>
                )}

                <div className="space-y-4">
                  <div className="relative group">
                    <Mail className={`${iconClasses} group-focus-within:text-orange-500 transition-colors`} />
                    <input
                      type="email"
                      required
                      placeholder="Email address"
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-white/5 border-2 border-transparent rounded-2xl focus:border-orange-500/50 focus:bg-white dark:focus:bg-transparent outline-none transition-all text-gray-900 dark:text-white font-medium placeholder-gray-400"
                      value={loginData.email}
                      onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                    />
                  </div>

                  <div className="relative group">
                    <Lock className={`${iconClasses} group-focus-within:text-orange-500 transition-colors`} />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="Password"
                      className="w-full pl-12 pr-12 py-4 bg-gray-50 dark:bg-white/5 border-2 border-transparent rounded-2xl focus:border-orange-500/50 focus:bg-white dark:focus:bg-transparent outline-none transition-all text-gray-900 dark:text-white font-medium placeholder-gray-400"
                      value={loginData.password}
                      onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-500 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input type="checkbox" className="w-5 h-5 rounded-lg border-gray-300 dark:border-white/10 text-orange-600 focus:ring-orange-500 dark:bg-white/5 cursor-pointer transition-all" />
                    <span className="text-sm text-gray-600 dark:text-gray-400 font-bold group-hover:text-gray-900 dark:group-hover:text-white transition-colors">Stay Signed In</span>
                  </label>
                  <a href="#" className="text-sm font-black text-orange-600 dark:text-orange-500 hover:underline">Forgot?</a>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={loading}
                  className="w-full py-4 bg-orange-600 text-white font-black rounded-[1.5rem] shadow-2xl shadow-orange-500/30 hover:bg-orange-700 transition-all disabled:opacity-70 flex items-center justify-center gap-3 uppercase tracking-widest text-sm"
                >
                  {loading ? 'Verifying...' : 'Sign In'}
                  <ArrowRight className="h-5 w-5" />
                </motion.button>
              </form>

              <p className="md:hidden text-center text-sm text-gray-600 dark:text-gray-400 font-bold">
                New here? 
                <button onClick={toggleMode} className="ml-2 text-orange-600 dark:text-orange-500 underline">Create Account</button>
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AuthPage;
