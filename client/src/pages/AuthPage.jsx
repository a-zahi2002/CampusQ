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

      <div className="relative w-full max-w-5xl h-[700px] bg-white dark:bg-gray-900 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-none border dark:border-gray-800 overflow-hidden flex flex-col md:flex-row transition-colors duration-500">
        
        {/* Sliding Info Panel (Overlay) */}
        <motion.div 
          className="absolute top-0 bottom-0 z-20 hidden md:flex flex-col justify-center items-center p-12 text-white bg-gradient-to-br from-orange-500 to-orange-600"
          initial={false}
          animate={{ 
            x: isLogin ? '0%' : '100%',
            width: '50%'
          }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
        >
          <div className="text-center space-y-6">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-white/20 p-4 rounded-2xl backdrop-blur-md inline-block mb-4"
            >
              <img src="/logo.png" alt="CampusQ" className="h-20 w-20 object-contain invert brightness-200" />
            </motion.div>
            
            <h1 className="text-5xl font-black tracking-tight">CampusQ</h1>
            <p className="text-orange-50 text-lg max-w-xs mx-auto leading-relaxed">
              {isLogin 
                ? "Don't have an account yet? Join our community of students and lecturers today." 
                : "Already a member of CampusQ? Sign in to continue your academic journey."}
            </p>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleMode}
              className="px-8 py-3 bg-white text-orange-600 font-bold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2 mx-auto"
            >
              {isLogin ? 'Create Account' : 'Sign In'}
              <ChevronRight className="h-5 w-5" />
            </motion.button>
          </div>
        </motion.div>

        {/* Forms Container */}
        <div className="relative flex-1 flex flex-col md:flex-row h-full">
          
          {/* Register Form Section (On the Left, covered when isLogin is true) */}
          <div className={`flex-1 h-full flex flex-col justify-center p-8 md:p-16 transition-opacity duration-300 ${isLogin && 'opacity-0 pointer-events-none md:opacity-100'}`}>
            <div className="max-w-md mx-auto w-full space-y-8">
              <div className="md:hidden text-center mb-8">
                <img src="/logo.png" alt="CampusQ" className="h-12 w-12 mx-auto mb-4" />
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">CampusQ</h1>
              </div>

              <div className="space-y-2">
                <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Create Account</h2>
                <p className="text-gray-500 dark:text-gray-400">Join our academic community today</p>
              </div>

              <form onSubmit={handleRegisterSubmit} className="space-y-6">
                {error && !isLogin && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-xl border border-red-100 dark:border-red-900/30 flex items-center gap-3"
                  >
                    <ShieldCheck className="h-5 w-5 flex-shrink-0" />
                    {error}
                  </motion.div>
                )}

                <div className="space-y-4">
                   <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
                    {['student', 'lecturer'].map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setRegisterData({...registerData, role: r})}
                        className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold capitalize transition-all ${
                          registerData.role === r ? 'bg-white dark:bg-gray-700 text-orange-600 dark:text-orange-400 shadow-sm' : 'text-gray-500 dark:text-gray-400'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>

                  <div className="relative">
                    <User className={iconClasses} />
                    <input
                      type="text"
                      required
                      placeholder="Username"
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-600"
                      value={registerData.nickname}
                      onChange={(e) => setRegisterData({...registerData, nickname: e.target.value})}
                    />
                  </div>

                  <div className="relative">
                    <Mail className={iconClasses} />
                    <input
                      type="email"
                      required
                      placeholder="University Email"
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-600"
                      value={registerData.email}
                      onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
                    />
                  </div>

                  <div className="relative">
                    <Lock className={iconClasses} />
                    <input
                      type={showRegisterPassword ? "text" : "password"}
                      required
                      placeholder="Password"
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-600"
                      value={registerData.password}
                      onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showRegisterPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <input type="checkbox" required className="mt-1 w-4 h-4 rounded border-gray-300 dark:border-gray-700 text-orange-600 focus:ring-orange-500 dark:bg-gray-800" />
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                      By creating an account, I agree to the <a href="#" className="text-orange-600 dark:text-orange-400 underline">Terms of Service</a> and <a href="#" className="text-orange-600 dark:text-orange-400 underline">Privacy Policy</a>.
                    </p>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={loading}
                    className="w-full py-4 bg-orange-600 text-white font-bold rounded-xl shadow-lg shadow-orange-200 hover:bg-orange-700 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                  >
                    {loading ? 'Creating Account...' : 'Get Started'}
                    <CheckCircle2 className="h-5 w-5" />
                  </motion.button>
                </div>
              </form>

              <p className="md:hidden text-center text-sm text-gray-600 dark:text-gray-400">
                Already have an account? 
                <button onClick={toggleMode} className="ml-1 font-bold text-orange-600 dark:text-orange-400">Sign In</button>
              </p>
            </div>
          </div>
          
          {/* Login Form Section (On the Right, covered when isLogin is false) */}
          <div className={`flex-1 h-full flex flex-col justify-center p-8 md:p-16 transition-opacity duration-300 ${!isLogin && 'opacity-0 pointer-events-none md:opacity-100'}`}>
            <div className="max-w-md mx-auto w-full space-y-8">
              <div className="md:hidden text-center mb-8">
                <img src="/logo.png" alt="CampusQ" className="h-12 w-12 mx-auto mb-4" />
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">CampusQ</h1>
              </div>
              
              <div className="space-y-2">
                <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Welcome Back</h2>
                <p className="text-gray-500 dark:text-gray-400">Enter your credentials to access your account</p>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-6">
                {error && isLogin && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-xl border border-red-100 dark:border-red-900/30 flex items-center gap-3"
                  >
                    <ShieldCheck className="h-5 w-5 flex-shrink-0" />
                    {error}
                  </motion.div>
                )}

                <div className="space-y-4">
                  <div className="relative">
                    <Mail className={iconClasses} />
                    <input
                      type="email"
                      required
                      placeholder="Email address"
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-600"
                      value={loginData.email}
                      onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                    />
                  </div>

                  <div className="relative">
                    <Lock className={iconClasses} />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="Password"
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-600"
                      value={loginData.password}
                      onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input type="checkbox" className="w-4 h-4 rounded border-gray-300 dark:border-gray-700 text-orange-600 focus:ring-orange-500 dark:bg-gray-800" />
                    <span className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white">Remember me</span>
                  </label>
                  <a href="#" className="text-sm font-semibold text-orange-600 dark:text-orange-400 hover:text-orange-700">Forgot password?</a>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={loading}
                  className="w-full py-4 bg-orange-600 text-white font-bold rounded-xl shadow-lg shadow-orange-200 hover:bg-orange-700 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {loading ? 'Processing...' : 'Sign In'}
                  <ArrowRight className="h-5 w-5" />
                </motion.button>
              </form>

              <p className="md:hidden text-center text-sm text-gray-600 dark:text-gray-400">
                Don't have an account? 
                <button onClick={toggleMode} className="ml-1 font-bold text-orange-600 dark:text-orange-400">Sign Up</button>
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AuthPage;
