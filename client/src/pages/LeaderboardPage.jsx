import { useState, useEffect } from 'react';
import api from '../services/api';
import { Trophy, Medal, Star, TrendingUp, Calendar, Globe, Loader2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

const LeaderboardPage = () => {
  const [activeTab, setActiveTab] = useState('all-time');
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, [activeTab]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const endpoint = activeTab === 'all-time' ? '/leaderboard/alltime' : '/leaderboard/monthly';
      const response = await api.get(endpoint);
      setLeaderboard(response.data.leaderboard);
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const getRankStyle = (index) => {
    switch (index) {
      case 0: return 'bg-yellow-100 text-yellow-700 ring-yellow-400';
      case 1: return 'bg-gray-100 text-gray-700 ring-gray-400';
      case 2: return 'bg-orange-100 text-orange-700 ring-orange-400';
      default: return 'bg-white text-gray-500 ring-gray-200';
    }
  };

  const getMedalIcon = (index) => {
    switch (index) {
      case 0: return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 1: return <Medal className="h-6 w-6 text-gray-400" />;
      case 2: return <Medal className="h-6 w-6 text-orange-400" />;
      default: return <span className="font-bold text-lg">{index + 1}</span>;
    }
  };

  return (
import { motion, AnimatePresence } from 'framer-motion';

const LeaderboardPage = () => {
  const [activeTab, setActiveTab] = useState('all-time');
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, [activeTab]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const endpoint = activeTab === 'all-time' ? '/leaderboard/alltime' : '/leaderboard/monthly';
      const response = await api.get(endpoint);
      setLeaderboard(response.data.leaderboard);
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const getRankStyle = (index) => {
    switch (index) {
      case 0: return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 ring-yellow-400/50';
      case 1: return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400 ring-gray-400/50';
      case 2: return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 ring-orange-400/50';
      default: return 'bg-white dark:bg-white/5 text-gray-500 dark:text-gray-400 ring-gray-200 dark:ring-white/10';
    }
  };

  const getMedalIcon = (index) => {
    switch (index) {
      case 0: return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 1: return <Medal className="h-6 w-6 text-gray-400" />;
      case 2: return <Medal className="h-6 w-6 text-orange-400" />;
      default: return <span className="font-black text-lg">{index + 1}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-gray-950 transition-colors duration-500">
      <Navbar />
      <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Link 
            to="/feed"
            className="inline-flex items-center gap-2 text-orange-600 dark:text-orange-500 hover:gap-3 font-black mb-10 transition-all"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Feed
          </Link>
        </motion.div>

        <div className="text-center mb-16">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center justify-center p-5 bg-orange-100 dark:bg-orange-950 rounded-[2rem] mb-6 shadow-xl shadow-orange-500/10"
          >
            <Trophy className="h-12 w-12 text-orange-600 dark:text-orange-500" />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-black text-gray-900 dark:text-white mb-4 tracking-tight"
          >
            Campus<span className="text-orange-600 dark:text-orange-500">Q</span> Rankings
          </motion.h1>
          <motion.p 
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.1 }}
             className="text-gray-500 dark:text-gray-400 max-w-lg mx-auto font-medium text-lg"
          >
            Recognizing our most elite academic contributors.
          </motion.p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-12">
          <div className="glass-card p-2 rounded-3xl flex gap-3">
            {[
              { id: 'all-time', label: 'All Time', icon: Globe },
              { id: 'monthly', label: 'This Month', icon: Calendar }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-8 py-4 rounded-2xl text-sm font-black transition-all ${
                  activeTab === tab.id 
                    ? 'bg-orange-600 text-white shadow-xl shadow-orange-500/30 scale-[1.05]' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-500 hover:bg-white dark:hover:bg-white/5'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table Content */}
        <div className="glass-card rounded-[3rem] overflow-hidden border border-white/20 dark:border-white/5">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="h-16 w-16 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
              <p className="text-gray-500 dark:text-gray-400 font-bold mt-6 tracking-wide uppercase text-xs">Computing Ranks...</p>
            </div>
          ) : leaderboard.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 dark:bg-white/5 border-b border-gray-100 dark:border-white/5">
                    <th className="px-10 py-6 text-xs font-black text-gray-400 uppercase tracking-widest">Rank</th>
                    <th className="px-10 py-6 text-xs font-black text-gray-400 uppercase tracking-widest">Contributor</th>
                    <th className="px-10 py-6 text-xs font-black text-gray-400 uppercase tracking-widest">Points</th>
                    <th className="px-10 py-6 text-xs font-black text-gray-400 uppercase tracking-widest hidden sm:table-cell">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                  <AnimatePresence>
                    {leaderboard.map((user, index) => (
                      <motion.tr 
                        layout
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        key={index} 
                        className="hover:bg-white/50 dark:hover:bg-white/5 transition-colors group"
                      >
                        <td className="px-10 py-8">
                          <div className={`h-12 w-12 rounded-[1rem] flex items-center justify-center ring-4 ring-transparent transition-all group-hover:scale-110 group-hover:ring-orange-500/10 ${getRankStyle(index)}`}>
                            {getMedalIcon(index)}
                          </div>
                        </td>
                        <td className="px-10 py-8">
                          <div className="flex flex-col">
                            <span className="text-xl font-black text-gray-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-500 transition-colors">
                              {user.nickname}
                            </span>
                            <span className={`text-[10px] w-fit mt-2 uppercase font-black tracking-widest px-2 py-1 rounded-lg ${
                              user.role === 'lecturer' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                            }`}>
                              {user.role}
                            </span>
                          </div>
                        </td>
                        <td className="px-10 py-8">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-orange-100 dark:bg-orange-950 rounded-xl flex items-center justify-center">
                              <Star className="h-5 w-5 text-orange-600 dark:text-orange-500 fill-orange-600" />
                            </div>
                            <span className="text-3xl font-black text-gray-900 dark:text-white">
                              {user.points || 0}
                            </span>
                          </div>
                        </td>
                        <td className="px-10 py-8 hidden sm:table-cell">
                          <div className="flex items-center gap-2 text-green-500 font-black text-xs uppercase tracking-widest">
                            <TrendingUp className="h-4 w-4" />
                            {index < 3 ? 'Elite Tier' : 'Rising Star'}
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-24 px-10">
              <div className="h-20 w-20 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                <Globe className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">The arena is empty</h3>
              <p className="text-gray-500 dark:text-gray-400 font-medium">Be the first to claim the throne this season!</p>
            </div>
          )}
        </div>

        {/* Call to action */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-16 bg-gradient-to-br from-orange-600 to-orange-700 rounded-[3rem] p-12 text-white flex flex-col md:flex-row items-center justify-between gap-10 shadow-2xl shadow-orange-500/20"
        >
          <div className="text-center md:text-left">
            <h3 className="text-3xl font-black mb-2 tracking-tight">Ready to rise?</h3>
            <p className="text-orange-50 text-lg font-medium opacity-90">Contribute high-quality answers and earn your spot on the leaderboard.</p>
          </div>
          <Link 
            to="/feed"
            className="whitespace-nowrap bg-white text-orange-600 px-10 py-5 rounded-2xl font-black text-lg hover:scale-105 active:scale-95 transition-all shadow-xl"
          >
            Get Started
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default LeaderboardPage;

