import { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Users, Flag, FileText, ShieldAlert, 
  Trash2, EyeOff, Eye, CheckCircle, 
  XCircle, Search, Loader2, ArrowRight, LogOut
} from 'lucide-react';
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

  if (authLoading) return <div className="p-20 text-center">Checking credentials...</div>;
  if (user?.role !== 'admin') return <Navigate to="/feed" />;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex-1 flex">
      {/* Admin Sidebar */}
      <aside className="w-64 bg-slate-900 text-white sticky top-0 h-screen p-6">
        <div className="flex items-center gap-3 mb-10 px-2">
          <ShieldAlert className="h-8 w-8 text-red-500" />
          <h1 className="text-xl font-black tracking-tight">Admin Console</h1>
        </div>

        <nav className="space-y-2">
          <button
            onClick={() => setActiveTab('users')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
              activeTab === 'users' ? 'bg-indigo-600 shadow-lg shadow-indigo-900/50' : 'hover:bg-slate-800 text-slate-400'
            }`}
          >
            <Users className="h-5 w-5" />
            User Management
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
              activeTab === 'reports' ? 'bg-indigo-600 shadow-lg shadow-indigo-900/50' : 'hover:bg-slate-800 text-slate-400'
            }`}
          >
            <Flag className="h-5 w-5" />
            Content Reports
          </button>
          <button
            onClick={() => setActiveTab('content')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
              activeTab === 'content' ? 'bg-indigo-600 shadow-lg shadow-indigo-900/50' : 'hover:bg-slate-800 text-slate-400'
            }`}
          >
            <FileText className="h-5 w-5" />
            Global Content
          </button>
        </nav>

        <div className="absolute bottom-10 left-6 right-6 space-y-4">
          <div className="bg-slate-800 p-4 rounded-2xl">
            <p className="text-xs text-slate-500 font-bold mb-1 uppercase tracking-wider">Logged in as</p>
            <p className="font-bold text-sm truncate">{user.nickname}</p>
            <p className="text-[10px] text-indigo-400 font-black mt-1">SUPER ADMIN</p>
          </div>
          
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="w-full flex items-center justify-center gap-2 bg-red-500/10 text-red-500 py-3 rounded-xl font-bold hover:bg-red-500 hover:text-white transition-all border border-red-500/20"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-10 overflow-y-auto">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-3xl font-black text-gray-900 capitalize">
              {activeTab} Management
            </h2>
            <p className="text-gray-500 font-medium">Control panel for platform health and safety.</p>
          </div>
          
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-indigo-600" />
            <input 
              type="text" 
              placeholder={`Search ${activeTab}...`}
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white shadow-sm transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-10 w-10 text-indigo-500 animate-spin mb-4" />
            <p className="text-gray-500 font-medium">Synchronizing system data...</p>
          </div>
        ) : (
          <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
            {activeTab === 'users' && (
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase">Nickname / Identity</th>
                    <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase">Role</th>
                    <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase">Status</th>
                    <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data.filter(u => u.nickname.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase())).map((u) => (
                    <tr key={`${u.role}-${u.id}`} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-8 py-5">
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-900">{u.nickname}</span>
                          <span className="text-xs text-gray-500">{u.email}</span>
                          <span className="text-[10px] text-gray-400 font-medium">{u.registration_number}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className={`text-[10px] uppercase font-black px-1.5 py-0.5 rounded ${
                          u.role === 'lecturer' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-1.5">
                          {u.is_active ? (
                            <div className="flex items-center gap-1 text-green-600 text-xs font-bold">
                              <CheckCircle className="h-3 w-3" /> ACTIVE
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-red-600 text-xs font-bold">
                              <XCircle className="h-3 w-3" /> DEACTIVATED
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <button 
                          onClick={() => handleToggleUserStatus(u.id, u.is_active)}
                          className={`text-xs font-black px-4 py-2 rounded-lg transition-all ${
                            u.is_active ? 'bg-red-50 text-red-600 hover:bg-red-600 hover:text-white' : 'bg-green-50 text-green-600 hover:bg-green-600 hover:text-white'
                          }`}
                        >
                          {u.is_active ? 'DEACTIVATE' : 'ACTIVATE'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'reports' && (
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase">Target</th>
                    <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase">Reason</th>
                    <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase">Status</th>
                    <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data.map((r) => (
                    <tr key={r.report_id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-8 py-5">
                        <div className="flex flex-col">
                          <span className="text-[10px] uppercase font-black text-indigo-500">{r.target_type}</span>
                          <span className="font-bold text-gray-900 line-clamp-1 max-w-xs">{r.target_preview || 'Content Deleted'}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-sm text-gray-600">{r.reason}</td>
                      <td className="px-8 py-5">
                        {r.is_hidden ? (
                          <span className="text-[10px] font-black bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">HIDDEN</span>
                        ) : (
                          <span className="text-[10px] font-black bg-green-100 text-green-700 px-2 py-0.5 rounded">VISIBLE</span>
                        )}
                      </td>
                      <td className="px-8 py-5 text-right space-x-2">
                        <button 
                          onClick={() => handleContentAction(r.is_hidden ? 'show' : 'hide', r.target_type, r.target_id)}
                          className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                          title={r.is_hidden ? 'Show Content' : 'Hide Content'}
                        >
                          {r.is_hidden ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                        </button>
                        <button 
                          onClick={() => handleContentAction('delete', r.target_type, r.target_id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Delete Content"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'content' && (
              <div className="p-20 text-center">
                <FileText className="h-16 w-16 text-gray-200 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Global Content Search</h3>
                <p className="text-gray-500 mb-8 max-w-md mx-auto">Coming soon: A powerful interface to browse and moderate all questions and answers across the platform.</p>
                <button 
                  onClick={() => setActiveTab('reports')}
                  className="inline-flex items-center gap-2 text-indigo-600 font-bold hover:underline"
                >
                  Manage Reported Content First <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </main>
      </div>
    </div>
  );
};

export default AdminPanel;
