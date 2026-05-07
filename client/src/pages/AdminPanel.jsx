import { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Users, Flag, FileText, ShieldAlert, 
  Trash2, EyeOff, Eye, CheckCircle, 
  XCircle, Search, Loader2, ArrowRight, LogOut,
  BarChart3, Plus, Edit3, Hash, AlertTriangle,
  Mail, UserPlus, Info, Check, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';

const AdminPanel = () => {
  const { user, logout, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [data, setData] = useState({ users: [], reports: [], content: { questions: [], answers: [] }, tags: [] });
  const [stats, setStats] = useState({ users: 0, questions: 0, answers: 0, pendingReports: 0, pendingApprovals: 0 });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal states
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userForm, setUserForm] = useState({ nickname: '', email: '', password: '', role: 'student', registration_number: '' });
  
  const [showTagModal, setShowTagModal] = useState(false);
  const [editingTag, setEditingTag] = useState(null);
  const [tagForm, setTagForm] = useState({ name: '' });

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchAllData();
    }
  }, [user]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [usersRes, reportsRes, statsRes, contentRes, tagsRes] = await Promise.all([
        api.get('/admin/users'),
        api.get('/reports'),
        api.get('/admin/stats'),
        api.get('/admin/content'),
        api.get('/tags')
      ]);
      
      setData({
        users: usersRes.data.users,
        reports: reportsRes.data.reports,
        content: contentRes.data,
        tags: tagsRes.data.tags
      });
      setStats(statsRes.data.stats);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await api.patch(`/admin/users/${editingUser.id}`, userForm);
      } else {
        await api.post('/admin/users', userForm);
      }
      setShowUserModal(false);
      setEditingUser(null);
      setUserForm({ nickname: '', email: '', password: '', role: 'student', registration_number: '' });
      fetchAllData();
    } catch (err) {
      alert(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleTagSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTag) {
        await api.patch(`/api/tags/${editingTag.id}`, tagForm);
      } else {
        await api.post('/api/tags', tagForm);
      }
      setShowTagModal(false);
      setEditingTag(null);
      setTagForm({ name: '' });
      fetchAllData();
    } catch (err) {
      alert(err.response?.data?.message || 'Operation failed');
    }
  };

  const deleteAction = async (endpoint, message = 'Are you sure?') => {
    if (!window.confirm(message)) return;
    try {
      await api.delete(endpoint);
      fetchAllData();
    } catch (err) {
      alert('Deletion failed');
    }
  };

  const toggleStatus = async (userId, currentStatus) => {
    try {
      const action = currentStatus ? 'deactivate' : 'reactivate';
      await api.patch(`/admin/users/${userId}/${action}`);
      fetchAllData();
    } catch (err) {
      alert('Status update failed');
    }
  };

  if (authLoading) return (
    <div className="flex flex-col items-center justify-center h-screen bg-[#f8f9fa] dark:bg-gray-950">
      <Loader2 className="h-16 w-16 text-orange-500 animate-spin mb-6" />
      <p className="text-gray-500 dark:text-gray-400 font-black tracking-widest uppercase text-xs">Authenticating...</p>
    </div>
  );

  if (user?.role !== 'admin') return <Navigate to="/feed" />;

  const filteredUsers = data.users.filter(u => 
    u.nickname.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredQuestions = data.content.questions.filter(q => 
    q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    q.body.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-screen bg-[#f8f9fa] dark:bg-gray-950 flex flex-col transition-colors duration-500 overflow-hidden">
      <Navbar />
      
      <div className="flex-1 flex overflow-hidden">
        {/* Admin Sidebar */}
        <aside className="w-72 bg-gray-900 dark:bg-black text-white h-full p-8 flex flex-col border-r border-gray-800 dark:border-white/5 shadow-2xl z-20 overflow-x-hidden">
          <div className="flex items-center gap-4 mb-12">
            <div className="p-3 bg-orange-500/10 rounded-2xl border border-orange-500/20">
              <ShieldAlert className="h-8 w-8 text-orange-500" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight leading-none">Console</h1>
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Super Control</span>
            </div>
          </div>

          <nav className="space-y-2 flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide">
            {[
              { id: 'overview', label: 'Dashboard', icon: BarChart3 },
              { id: 'users', label: 'User Hub', icon: Users },
              { id: 'content', label: 'Global Content', icon: FileText },
              { id: 'reports', label: 'Safety Queue', icon: Flag },
              { id: 'tags', label: 'Tag Management', icon: Hash },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-black transition-all ${
                  activeTab === tab.id 
                    ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/20 scale-[1.02]' 
                    : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'
                }`}
              >
                <tab.icon className={`h-5 w-5 ${activeTab === tab.id ? 'text-white' : 'text-gray-500'}`} />
                {tab.label}
              </button>
            ))}
          </nav>

          <div className="mt-auto pt-8 border-t border-gray-800 dark:border-white/5">
            <button
              onClick={() => { logout(); navigate('/login'); }}
              className="w-full flex items-center justify-center gap-3 bg-red-500/10 text-red-500 py-4 rounded-2xl font-black hover:bg-red-600 hover:text-white transition-all group border border-red-500/20"
            >
              <LogOut className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
              Exit Console
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-12 bg-gray-50/50 dark:bg-gray-950/50">
          <header className="flex justify-between items-start mb-12">
            <div>
              <motion.h2 
                key={activeTab}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-5xl font-black text-gray-900 dark:text-white capitalize tracking-tighter mb-2"
              >
                {activeTab === 'overview' ? 'Platform Health' : `${activeTab} Management`}
              </motion.h2>
              <p className="text-gray-500 dark:text-gray-400 font-medium text-lg">System-wide command and monitoring interface.</p>
            </div>
            
            <div className="flex gap-4">
              {['users', 'content', 'tags'].includes(activeTab) && (
                <div className="relative group w-80">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                  <input 
                    type="text" 
                    placeholder={`Search ${activeTab}...`}
                    className="w-full pl-12 pr-4 py-4 bg-white dark:bg-white/5 border-2 border-transparent focus:border-orange-500/50 rounded-2xl focus:outline-none text-gray-900 dark:text-white shadow-sm transition-all font-medium"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              )}
              {activeTab === 'users' && (
                <button 
                  onClick={() => { setEditingUser(null); setUserForm({ nickname: '', email: '', password: '', role: 'student', registration_number: '' }); setShowUserModal(true); }}
                  className="bg-orange-600 text-white px-6 py-4 rounded-2xl font-black shadow-lg shadow-orange-600/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                >
                  <UserPlus className="h-5 w-5" /> Add User
                </button>
              )}
              {activeTab === 'tags' && (
                <button 
                  onClick={() => { setEditingTag(null); setTagForm({ name: '' }); setShowTagModal(true); }}
                  className="bg-orange-600 text-white px-6 py-4 rounded-2xl font-black shadow-lg shadow-orange-600/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                >
                  <Plus className="h-5 w-5" /> New Tag
                </button>
              )}
            </div>
          </header>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 glass-card rounded-[3rem]">
              <Loader2 className="h-12 w-12 text-orange-500 animate-spin mb-6" />
              <p className="text-gray-500 dark:text-gray-400 font-black tracking-widest uppercase text-sm">Synchronizing Matrix...</p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {activeTab === 'overview' && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
                >
                  {[
                    { label: 'Total Users', value: stats.users, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                    { label: 'Pending Approvals', value: stats.pendingApprovals, icon: UserPlus, color: 'text-purple-500', bg: 'bg-purple-500/10' },
                    { label: 'Questions', value: stats.questions, icon: FileText, color: 'text-orange-500', bg: 'bg-orange-500/10' },
                    { label: 'Safety Reports', value: stats.pendingReports, icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-500/10' }
                  ].map((stat, i) => (
                    <div key={i} className="glass-card p-10 rounded-[2.5rem] flex flex-col items-center text-center group hover:scale-[1.02] transition-all">
                      <div className={`p-6 ${stat.bg} rounded-3xl mb-6 group-hover:rotate-12 transition-transform`}>
                        <stat.icon className={`h-10 w-10 ${stat.color}`} />
                      </div>
                      <span className="text-gray-500 dark:text-gray-400 font-black tracking-widest uppercase text-xs mb-2">{stat.label}</span>
                      <span className="text-5xl font-black text-gray-900 dark:text-white tracking-tighter">{stat.value}</span>
                    </div>
                  ))}
                  
                  <div className="md:col-span-2 lg:col-span-4 glass-card p-12 rounded-[3rem] mt-4">
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-6">Recent System Activity</h3>
                    <div className="space-y-4">
                      {data.reports.slice(0, 3).map((r, i) => (
                        <div key={i} className="flex items-center justify-between p-6 bg-white/50 dark:bg-white/5 rounded-3xl border border-gray-100 dark:border-white/5">
                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-red-500/10 rounded-2xl">
                              <Flag className="h-5 w-5 text-red-500" />
                            </div>
                            <div>
                              <p className="font-bold text-gray-900 dark:text-white">New {r.target_type} report submitted</p>
                              <p className="text-sm text-gray-500">{r.reason}</p>
                            </div>
                          </div>
                          <button onClick={() => setActiveTab('reports')} className="text-orange-600 font-black text-xs uppercase tracking-widest hover:underline">Review</button>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'users' && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="glass-card rounded-[3rem] overflow-hidden"
                >
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-white/5 border-b border-gray-100 dark:border-white/5">
                      <tr>
                        <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Identity</th>
                        <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Role & Stats</th>
                        <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Account State</th>
                        <th className="px-10 py-6 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Management</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                      {filteredUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-white dark:hover:bg-white/5 transition-colors group">
                          <td className="px-10 py-6">
                            <div className="flex items-center gap-4">
                              <div className="h-14 w-14 bg-gray-100 dark:bg-white/5 rounded-2xl flex items-center justify-center text-gray-400 font-black text-xl">
                                {u.nickname[0].toUpperCase()}
                              </div>
                              <div>
                                <p className="font-black text-lg text-gray-900 dark:text-white">{u.nickname}</p>
                                <p className="text-sm text-gray-500 flex items-center gap-1.5"><Mail className="h-3 w-3" /> {u.email}</p>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1"># {u.registration_number || 'N/A'}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-10 py-6">
                            <div className="flex flex-col gap-2">
                              <span className={`inline-block px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest w-fit ${
                                u.role === 'admin' ? 'bg-orange-500 text-white' : 
                                u.role === 'lecturer' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30' : 
                                'bg-blue-100 text-blue-600 dark:bg-blue-900/30'
                              }`}>
                                {u.role}
                              </span>
                              <span className="text-xs font-bold text-gray-500">{u.points} Contribution Points</span>
                            </div>
                          </td>
                          <td className="px-10 py-6">
                            <div className="flex flex-col gap-2">
                              {u.is_approved ? (
                                u.is_active ? (
                                  <div className="flex items-center gap-2 text-green-500 font-black text-[10px] uppercase tracking-widest">
                                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" /> Operational
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2 text-red-500 font-black text-[10px] uppercase tracking-widest">
                                    <div className="h-2 w-2 rounded-full bg-red-500" /> Suspended
                                  </div>
                                )
                              ) : (
                                <div className="flex items-center gap-2 text-orange-500 font-black text-[10px] uppercase tracking-widest">
                                  <div className="h-2 w-2 rounded-full bg-orange-500 animate-bounce" /> Pending Approval
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-10 py-6 text-right">
                            <div className="flex justify-end gap-2">
                              {!u.is_approved && (
                                <button 
                                  onClick={async () => { await api.patch(`/admin/users/${u.id}/approve`); fetchAllData(); }}
                                  className="p-3 text-orange-500 hover:bg-orange-500/10 rounded-xl transition-all"
                                  title="Approve User"
                                >
                                  <CheckCircle className="h-5 w-5" />
                                </button>
                              )}
                              <button onClick={() => { setEditingUser(u); setUserForm({...u, password: ''}); setShowUserModal(true); }} className="p-3 text-gray-400 hover:text-orange-500 hover:bg-orange-500/10 rounded-xl transition-all"><Edit3 className="h-5 w-5" /></button>
                              <button onClick={() => toggleStatus(u.id, u.is_active)} className={`p-3 rounded-xl transition-all ${u.is_active ? 'text-red-400 hover:bg-red-500/10' : 'text-green-400 hover:bg-green-500/10'}`}>
                                {u.is_active ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                              </button>
                              <button onClick={() => deleteAction(`/admin/users/${u.id}`, 'PERMANENTLY delete this user? All their data will be lost!')} className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"><Trash2 className="h-5 w-5" /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </motion.div>
              )}

              {activeTab === 'content' && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-12"
                >
                  <div className="glass-card rounded-[3rem] overflow-hidden">
                    <div className="px-10 py-8 bg-gray-50 dark:bg-white/5 border-b border-gray-100 dark:border-white/5 flex justify-between items-center">
                      <h3 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                        <FileText className="text-orange-500" /> Question Repository
                      </h3>
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{filteredQuestions.length} entries</span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                          {filteredQuestions.map(q => (
                            <tr key={q.id} className="hover:bg-white dark:hover:bg-white/5 transition-colors">
                              <td className="px-10 py-6">
                                <p className="font-bold text-gray-900 dark:text-white text-lg line-clamp-1">{q.title}</p>
                                <p className="text-sm text-gray-500 line-clamp-1 mt-1">{q.body}</p>
                                <div className="flex gap-4 mt-3 text-[10px] font-black uppercase tracking-widest text-gray-400">
                                  <span>BY {q.author_name}</span>
                                  <span>•</span>
                                  <span>{new Date(q.created_at).toLocaleDateString()}</span>
                                  {q.is_hidden && <span className="text-orange-500">HIDDEN</span>}
                                </div>
                              </td>
                              <td className="px-10 py-6 text-right">
                                <div className="flex justify-end gap-2">
                                  <button onClick={() => deleteAction(`/admin/questions/${q.id}`, 'PERMANENTLY delete this question?')} className="p-4 bg-red-500/10 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all">
                                    <Trash2 className="h-5 w-5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'reports' && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="glass-card rounded-[3rem] overflow-hidden"
                >
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-white/5 border-b border-gray-100 dark:border-white/5">
                      <tr>
                        <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Offending Content</th>
                        <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Reasoning</th>
                        <th className="px-10 py-6 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Resolution</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                      {data.reports.map(r => (
                        <tr key={r.id} className="hover:bg-white dark:hover:bg-white/5 transition-colors">
                          <td className="px-10 py-6">
                            <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">
                              {r.question_id ? 'Question' : 'Answer'}
                            </span>
                            <p className="font-bold text-gray-900 dark:text-white text-lg mt-1 line-clamp-2">
                              {r.question_title || r.answer_body || 'Content unavailable'}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">Reported by {r.reporter_nickname}</p>
                          </td>
                          <td className="px-10 py-6">
                            <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 p-4 rounded-2xl">
                              <p className="text-sm font-medium text-red-700 dark:text-red-400">{r.reason}</p>
                            </div>
                          </td>
                          <td className="px-10 py-6 text-right">
                            <div className="flex justify-end gap-3">
                              <button 
                                onClick={() => deleteAction(
                                  r.question_id ? `/admin/questions/${r.question_id}` : `/admin/answers/${r.answer_id}`, 
                                  `Permanently delete this ${r.question_id ? 'question' : 'answer'}?`
                                )} 
                                className="px-5 py-3 bg-red-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-red-600/20"
                              >
                                Purge
                              </button>
                              <button 
                                onClick={() => api.patch(
                                  r.question_id ? `/admin/questions/${r.question_id}/hide` : `/admin/answers/${r.answer_id}/hide`
                                ).then(fetchAllData)} 
                                className="px-5 py-3 bg-gray-900 dark:bg-white dark:text-gray-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest"
                              >
                                Hide
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </motion.div>
              )}

              {activeTab === 'tags' && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {data.tags.map(tag => (
                    <div key={tag.id} className="glass-card p-8 rounded-[2rem] flex justify-between items-center group hover:border-orange-500/50 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-orange-100 dark:bg-orange-950 rounded-xl group-hover:bg-orange-600 group-hover:text-white transition-colors">
                          <Hash className="h-5 w-5" />
                        </div>
                        <span className="font-black text-lg text-gray-900 dark:text-white tracking-tight">{tag.name}</span>
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => { setEditingTag(tag); setTagForm({name: tag.name}); setShowTagModal(true); }} className="p-2 text-gray-400 hover:text-orange-500"><Edit3 className="h-4 w-4" /></button>
                        <button onClick={() => deleteAction(`/tags/${tag.id}`, 'Delete this tag?')} className="p-2 text-gray-400 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </main>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showUserModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-gray-950/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white dark:bg-gray-900 w-full max-w-xl rounded-[3rem] shadow-2xl p-10 border border-white/20 dark:border-white/5"
            >
              <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-8 tracking-tighter">
                {editingUser ? 'Edit User Matrix' : 'Onboard New Identity'}
              </h3>
              <form onSubmit={handleUserSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">Nickname</label>
                    <input required type="text" className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-white/5 border-2 border-transparent focus:border-orange-500/50 outline-none text-gray-900 dark:text-white font-bold" value={userForm.nickname} onChange={e => setUserForm({...userForm, nickname: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">Email Address</label>
                    <input required type="email" className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-white/5 border-2 border-transparent focus:border-orange-500/50 outline-none text-gray-900 dark:text-white font-bold" value={userForm.email} onChange={e => setUserForm({...userForm, email: e.target.value})} />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">Reg Number</label>
                    <input type="text" className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-white/5 border-2 border-transparent focus:border-orange-500/50 outline-none text-gray-900 dark:text-white font-bold" value={userForm.registration_number || ''} onChange={e => setUserForm({...userForm, registration_number: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">Access Level</label>
                    <select className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-white/5 border-2 border-transparent focus:border-orange-500/50 outline-none text-gray-900 dark:text-white font-bold" value={userForm.role} onChange={e => setUserForm({...userForm, role: e.target.value})}>
                      <option value="student">Student</option>
                      <option value="lecturer">Lecturer</option>
                      <option value="admin">Administrator</option>
                    </select>
                  </div>
                </div>

                {!editingUser && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">Initial Password</label>
                    <input required type="password" placeholder="••••••••" className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-white/5 border-2 border-transparent focus:border-orange-500/50 outline-none text-gray-900 dark:text-white font-bold" value={userForm.password} onChange={e => setUserForm({...userForm, password: e.target.value})} />
                  </div>
                )}

                <div className="flex gap-4 pt-4">
                  <button type="submit" className="flex-1 py-5 bg-orange-600 text-white rounded-2xl font-black shadow-xl shadow-orange-600/20 hover:scale-[1.02] active:scale-95 transition-all">
                    {editingUser ? 'Synchronize Updates' : 'Authorize User'}
                  </button>
                  <button type="button" onClick={() => setShowUserModal(false)} className="px-10 py-5 bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-white rounded-2xl font-black hover:bg-gray-200 transition-all">Cancel</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {showTagModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-gray-950/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white dark:bg-gray-900 w-full max-w-md rounded-[3rem] p-10"
            >
              <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-8 tracking-tighter">
                {editingTag ? 'Edit Tag' : 'Create New Tag'}
              </h3>
              <form onSubmit={handleTagSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">Tag Name</label>
                  <div className="relative">
                    <Hash className="absolute left-6 top-1/2 -translate-y-1/2 text-orange-500" />
                    <input required type="text" className="w-full pl-14 pr-6 py-5 rounded-2xl bg-gray-50 dark:bg-white/5 border-2 border-transparent focus:border-orange-500/50 outline-none text-gray-900 dark:text-white font-bold" value={tagForm.name} onChange={e => setTagForm({name: e.target.value})} />
                  </div>
                </div>
                <div className="flex gap-4">
                  <button type="submit" className="flex-1 py-5 bg-orange-600 text-white rounded-2xl font-black shadow-xl shadow-orange-600/20">Save Tag</button>
                  <button type="button" onClick={() => setShowTagModal(false)} className="px-10 py-5 bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-white rounded-2xl font-black">Cancel</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminPanel;
