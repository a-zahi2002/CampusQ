import { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Users, Flag, FileText, ShieldAlert, 
  Trash2, EyeOff, Eye, CheckCircle, 
  XCircle, Search, Loader2, ArrowRight, LogOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';

const AdminPanel = () => {
  const { user, logout, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('users');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchData();
    }
  }, [activeTab, user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      let endpoint = '';
      if (activeTab === 'users') endpoint = '/admin/users';
      else if (activeTab === 'reports') endpoint = '/reports';
      
      if (endpoint) {
        const response = await api.get(endpoint);
        setData(activeTab === 'users' ? response.data.users : response.data.reports);
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      const action = currentStatus ? 'deactivate' : 'reactivate';
      await api.patch(`/admin/users/${userId}/${action}`);
      fetchData();
    } catch (err) {
      alert('Failed to update user status');
    }
  };

  const handleContentAction = async (action, type, id) => {
    if (action === 'delete' && !window.confirm('Are you sure you want to PERMANENTLY delete this?')) return;
    
    try {
      const method = action === 'delete' ? 'delete' : 'patch';
      const endpoint = action === 'delete' 
        ? `/admin/${type}s/${id}` 
        : `/admin/${type}s/${id}/hide`;
      
      await api[method](endpoint);
      fetchData();
    } catch (err) {
      alert('Action failed');
    }
  };

  if (authLoading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#f8f9fa] dark:bg-gray-950">
      <div className="h-16 w-16 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin mb-6" />
      <p className="text-gray-500 dark:text-gray-400 font-bold tracking-widest uppercase text-xs">Authenticating...</p>
    </div>
  );
  if (user?.role !== 'admin') return <Navigate to="/feed" />;

  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-gray-950 flex flex-col transition-colors duration-500">
      <Navbar />
      <div className="flex-1 flex overflow-hidden">
        {/* Admin Sidebar */}
        <aside className="w-72 bg-gray-900 dark:bg-black text-white sticky top-0 h-screen p-8 flex flex-col border-r border-gray-800 dark:border-white/5 shadow-2xl z-10">
          <div className="flex items-center gap-4 mb-12">
            <div className="p-3 bg-red-500/10 rounded-2xl border border-red-500/20">
              <ShieldAlert className="h-8 w-8 text-red-500" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight leading-none">Console</h1>
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Admin Control</span>
            </div>
          </div>

          <nav className="space-y-3 flex-1">
            {[
              { id: 'users', label: 'User Management', icon: Users },
              { id: 'reports', label: 'Content Reports', icon: Flag },
              { id: 'content', label: 'Global Content', icon: FileText }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-black transition-all ${
                  activeTab === tab.id 
                    ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/20 scale-[1.02]' 
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white hover:scale-[1.01]'
                }`}
              >
                <tab.icon className={`h-5 w-5 ${activeTab === tab.id ? 'text-white' : 'text-gray-500'}`} />
                {tab.label}
              </button>
            ))}
          </nav>

          <div className="mt-auto space-y-4 pt-8 border-t border-gray-800 dark:border-white/5">
            <div className="bg-gray-800/50 p-5 rounded-3xl border border-gray-700/50">
              <p className="text-[10px] text-gray-500 font-black mb-1 uppercase tracking-widest">Authenticated User</p>
              <p className="font-bold text-lg truncate text-white">{user.nickname}</p>
              <div className="inline-flex items-center gap-1.5 mt-2 bg-orange-500/10 text-orange-500 px-2 py-1 rounded border border-orange-500/20">
                <ShieldAlert className="h-3 w-3" />
                <span className="text-[10px] font-black tracking-widest uppercase">SUPER ADMIN</span>
              </div>
            </div>
            
            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="w-full flex items-center justify-center gap-3 bg-red-500/10 text-red-500 py-4 rounded-2xl font-black hover:bg-red-500 hover:text-white transition-all border border-red-500/20 group"
            >
              <LogOut className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
              Secure Logout
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-12 overflow-y-auto relative">
          <header className="flex justify-between items-end mb-12">
            <div>
              <motion.h2 
                key={activeTab}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl font-black text-gray-900 dark:text-white capitalize tracking-tight mb-2"
              >
                {activeTab} Management
              </motion.h2>
              <p className="text-gray-500 dark:text-gray-400 font-medium text-lg">Control panel for platform health and safety.</p>
            </div>
            
            <div className="relative group w-80">
              <div className="absolute inset-0 bg-orange-600/5 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity rounded-2xl" />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500 group-focus-within:text-orange-600 dark:group-focus-within:text-orange-500 transition-colors" />
              <input 
                type="text" 
                placeholder={`Search ${activeTab}...`}
                className="w-full pl-12 pr-4 py-4 border-2 border-transparent bg-white dark:bg-white/5 rounded-2xl focus:outline-none focus:border-orange-500/50 text-gray-900 dark:text-white shadow-sm transition-all placeholder-gray-400 dark:placeholder-gray-600 font-medium relative z-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </header>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 glass-card rounded-[3rem]">
              <Loader2 className="h-12 w-12 text-orange-500 animate-spin mb-6" />
              <p className="text-gray-500 dark:text-gray-400 font-black tracking-widest uppercase text-sm">Synchronizing Data...</p>
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card rounded-[3rem] overflow-hidden border border-white/20 dark:border-white/5"
            >
              {activeTab === 'users' && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50/50 dark:bg-white/5 border-b border-gray-100 dark:border-white/5">
                        <th className="px-10 py-6 text-xs font-black text-gray-400 uppercase tracking-widest">User Identity</th>
                        <th className="px-10 py-6 text-xs font-black text-gray-400 uppercase tracking-widest">Role Level</th>
                        <th className="px-10 py-6 text-xs font-black text-gray-400 uppercase tracking-widest">Account Status</th>
                        <th className="px-10 py-6 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                      <AnimatePresence>
                        {data.filter(u => u.nickname.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase())).map((u, index) => (
                          <motion.tr 
                            layout
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            key={`${u.role}-${u.id}`} 
                            className="hover:bg-white/50 dark:hover:bg-white/5 transition-colors group"
                          >
                            <td className="px-10 py-6">
                              <div className="flex items-center gap-4">
                                <div className="h-12 w-12 bg-gray-100 dark:bg-white/5 rounded-2xl flex items-center justify-center">
                                  <Users className="h-6 w-6 text-gray-400" />
                                </div>
                                <div className="flex flex-col">
                                  <span className="font-black text-lg text-gray-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-500 transition-colors">{u.nickname}</span>
                                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{u.email}</span>
                                  <span className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest mt-1">{u.registration_number}</span>
                                </div>
                              </div>
                            </td>
                            <td className="px-10 py-6">
                              <span className={`text-[10px] uppercase font-black tracking-widest px-3 py-1.5 rounded-xl ${
                                u.role === 'lecturer' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                              }`}>
                                {u.role}
                              </span>
                            </td>
                            <td className="px-10 py-6">
                              {u.is_active ? (
                                <div className="inline-flex items-center gap-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 px-3 py-1.5 rounded-xl border border-green-200 dark:border-green-900/50">
                                  <CheckCircle className="h-4 w-4" /> 
                                  <span className="text-xs font-black tracking-widest">ACTIVE</span>
                                </div>
                              ) : (
                                <div className="inline-flex items-center gap-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-3 py-1.5 rounded-xl border border-red-200 dark:border-red-900/50">
                                  <XCircle className="h-4 w-4" /> 
                                  <span className="text-xs font-black tracking-widest">SUSPENDED</span>
                                </div>
                              )}
                            </td>
                            <td className="px-10 py-6 text-right">
                              <button 
                                onClick={() => handleToggleUserStatus(u.id, u.is_active)}
                                className={`text-xs font-black tracking-widest px-6 py-3 rounded-xl transition-all shadow-lg active:scale-95 ${
                                  u.is_active 
                                    ? 'bg-red-600 text-white hover:bg-red-700 shadow-red-500/20' 
                                    : 'bg-green-600 text-white hover:bg-green-700 shadow-green-500/20'
                                }`}
                              >
                                {u.is_active ? 'SUSPEND' : 'RESTORE'}
                              </button>
                            </td>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'reports' && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50/50 dark:bg-white/5 border-b border-gray-100 dark:border-white/5">
                      <tr>
                        <th className="px-10 py-6 text-xs font-black text-gray-400 uppercase tracking-widest">Target Entity</th>
                        <th className="px-10 py-6 text-xs font-black text-gray-400 uppercase tracking-widest">Violation Reason</th>
                        <th className="px-10 py-6 text-xs font-black text-gray-400 uppercase tracking-widest">State</th>
                        <th className="px-10 py-6 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                      <AnimatePresence>
                        {data.map((r, index) => (
                          <motion.tr 
                            layout
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            key={r.report_id} 
                            className="hover:bg-white/50 dark:hover:bg-white/5 transition-colors group"
                          >
                            <td className="px-10 py-6">
                              <div className="flex flex-col">
                                <span className="text-[10px] uppercase font-black tracking-widest text-orange-600 dark:text-orange-500 mb-1">{r.target_type}</span>
                                <span className="font-bold text-lg text-gray-900 dark:text-white line-clamp-2 max-w-sm">{r.target_preview || 'Content Deleted / Unavailable'}</span>
                              </div>
                            </td>
                            <td className="px-10 py-6">
                              <span className="text-sm font-medium text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-white/5 px-4 py-2 rounded-xl inline-block">{r.reason}</span>
                            </td>
                            <td className="px-10 py-6">
                              {r.is_hidden ? (
                                <span className="inline-flex items-center text-[10px] font-black tracking-widest bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 px-3 py-1.5 rounded-xl border border-yellow-200 dark:border-yellow-900/50">HIDDEN</span>
                              ) : (
                                <span className="inline-flex items-center text-[10px] font-black tracking-widest bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1.5 rounded-xl border border-green-200 dark:border-green-900/50">PUBLIC</span>
                              )}
                            </td>
                            <td className="px-10 py-6 text-right">
                              <div className="flex justify-end gap-3">
                                <button 
                                  onClick={() => handleContentAction(r.is_hidden ? 'show' : 'hide', r.target_type, r.target_id)}
                                  className="p-3 text-gray-500 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-500/10 rounded-xl transition-all shadow-sm active:scale-95"
                                  title={r.is_hidden ? 'Restore Content' : 'Hide Content'}
                                >
                                  {r.is_hidden ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                                </button>
                                <button 
                                  onClick={() => handleContentAction('delete', r.target_type, r.target_id)}
                                  className="p-3 text-red-500 hover:text-white hover:bg-red-600 rounded-xl transition-all shadow-sm shadow-red-500/20 active:scale-95"
                                  title="Permanently Delete"
                                >
                                  <Trash2 className="h-5 w-5" />
                                </button>
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'content' && (
                <div className="p-32 text-center">
                  <div className="h-24 w-24 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center mx-auto mb-8">
                    <FileText className="h-10 w-10 text-orange-600 dark:text-orange-500" />
                  </div>
                  <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">Global Content Matrix</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-10 max-w-md mx-auto text-lg font-medium">An advanced interface to browse, filter, and moderate all questions and answers across the platform is currently under construction.</p>
                  <button 
                    onClick={() => setActiveTab('reports')}
                    className="inline-flex items-center gap-3 text-orange-600 dark:text-orange-500 font-black tracking-widest uppercase text-sm hover:gap-4 transition-all"
                  >
                    Manage Reports Instead <ArrowRight className="h-5 w-5" />
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminPanel;
