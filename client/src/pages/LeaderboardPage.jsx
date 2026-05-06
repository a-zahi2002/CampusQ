import { useState, useEffect } from 'react';
import api from '../services/api';
import { Trophy, Medal, Star, TrendingUp, Calendar, Globe, Loader2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

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
      const endpoint = activeTab === 'all-time' ? '/leaderboard/all-time' : '/leaderboard/monthly';
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
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Link 
          to="/feed"
          className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-bold mb-8 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Feed
        </Link>

        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-3 bg-indigo-100 rounded-2xl mb-4">
            <Trophy className="h-10 w-10 text-indigo-600" />
          </div>
          <h1 className="text-4xl font-black text-gray-900 mb-2">CampusQ Rankings</h1>
          <p className="text-gray-500 max-w-lg mx-auto font-medium">
            Celebrate our most active contributors! Earn points by answering questions and getting high ratings.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-10">
          <div className="bg-white p-1.5 rounded-2xl shadow-sm border flex gap-2">
            <button
              onClick={() => setActiveTab('all-time')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${
                activeTab === 'all-time' 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' 
                  : 'text-gray-500 hover:text-indigo-600'
              }`}
            >
              <Globe className="h-4 w-4" />
              All Time
            </button>
            <button
              onClick={() => setActiveTab('monthly')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${
                activeTab === 'monthly' 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' 
                  : 'text-gray-500 hover:text-indigo-600'
              }`}
            >
              <Calendar className="h-4 w-4" />
              This Month
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="bg-white rounded-[2.5rem] shadow-xl overflow-hidden border border-gray-100">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-10 w-10 text-indigo-500 animate-spin mb-4" />
              <p className="text-gray-500 font-medium">Calculating rankings...</p>
            </div>
          ) : leaderboard.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                    <th className="px-8 py-5 text-sm font-black text-gray-400 uppercase tracking-wider">Rank</th>
                    <th className="px-8 py-5 text-sm font-black text-gray-400 uppercase tracking-wider">Contributor</th>
                    <th className="px-8 py-5 text-sm font-black text-gray-400 uppercase tracking-wider">Points</th>
                    <th className="px-8 py-5 text-sm font-black text-gray-400 uppercase tracking-wider hidden sm:table-cell">Growth</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {leaderboard.map((user, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-8 py-6">
                        <div className={`h-10 w-10 rounded-xl flex items-center justify-center ring-2 transition-transform group-hover:scale-110 ${getRankStyle(index)}`}>
                          {getMedalIcon(index)}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <span className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                            {user.nickname}
                          </span>
                          <span className={`text-[10px] w-fit mt-1 uppercase font-black px-1.5 py-0.5 rounded ${
                            user.role === 'lecturer' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                          }`}>
                            {user.role}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 bg-yellow-50 rounded-lg flex items-center justify-center">
                            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                          </div>
                          <span className="text-2xl font-black text-gray-900">
                            {user.points || 0}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6 hidden sm:table-cell">
                        <div className="flex items-center gap-1.5 text-green-500 font-bold text-sm">
                          <TrendingUp className="h-4 w-4" />
                          {index < 3 ? 'Top Tier' : 'Climbing'}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-20 px-6">
              <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">No rankings data available</h3>
              <p className="text-gray-500">Be the first to climb the leaderboard this month!</p>
            </div>
          )}
        </div>

        {/* Call to action */}
        <div className="mt-10 bg-indigo-600 rounded-3xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl shadow-indigo-200">
          <div className="text-center md:text-left">
            <h3 className="text-xl font-bold mb-1">Want to see your name here?</h3>
            <p className="text-indigo-100 text-sm">Contribute high-quality answers to earn stars from lecturers and peers.</p>
          </div>
          <Link 
            to="/feed"
            className="whitespace-nowrap bg-white text-indigo-600 px-8 py-4 rounded-2xl font-bold hover:bg-indigo-50 transition-colors shadow-lg"
          >
            Start Contributing
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;
