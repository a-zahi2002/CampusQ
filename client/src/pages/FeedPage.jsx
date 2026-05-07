import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import QuestionCard from '../components/QuestionCard';
import { Search, Filter, Hash, Loader2, PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

import { motion, AnimatePresence } from 'framer-motion';

const FeedPage = () => {
  const [questions, setQuestions] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    fetchTags();
    fetchQuestions();
  }, [user]);

  const fetchQuestions = async (search = '', tag = '') => {
    setLoading(true);
    try {
      let url = '/questions';
      const params = new URLSearchParams();
      
      if (search) params.append('search', search);
      if (tag) {
        const tagObj = tags.find(t => t.name === tag);
        if (tagObj) params.append('tag_id', tagObj.id);
      }
      
      if (params.toString()) url += `?${params.toString()}`;
      
      const response = await api.get(url);
      setQuestions(response.data.questions);
    } catch (err) {
      console.error('Error fetching questions:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTags = async () => {
    try {
      const response = await api.get('/tags');
      setTags(response.data.tags);
    } catch (err) {
      console.error('Error fetching tags:', err);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchQuestions(searchQuery, selectedTag);
  };

  const handleTagClick = (tagName) => {
    const newTag = selectedTag === tagName ? '' : tagName;
    setSelectedTag(newTag);
    fetchQuestions(searchQuery, newTag);
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-gray-950 transition-colors duration-500">
      <Navbar />
      <div className="flex max-w-7xl mx-auto">
        {/* Sidebar for Tags */}
      <aside className="w-72 hidden lg:block sticky top-24 h-[calc(100vh-6rem)] p-6">
        <div className="glass-card rounded-[2rem] h-full p-8 flex flex-col">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
              <Filter className="h-5 w-5 text-orange-600 dark:text-orange-500" />
            </div>
            <h2 className="text-xl font-black text-gray-900 dark:text-white">Explore</h2>
          </div>
          
          <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar">
            <button
              onClick={() => handleTagClick('')}
              className={`w-full text-left px-5 py-3 rounded-2xl text-sm font-bold transition-all duration-300 ${
                selectedTag === '' ? 'bg-orange-600 text-white shadow-lg shadow-orange-500/20 scale-[1.02]' : 'text-gray-500 dark:text-gray-400 hover:bg-white dark:hover:bg-white/5'
              }`}
            >
              All Discussions
            </button>
            {tags.map((tag) => (
              <button
                key={tag.id}
                onClick={() => handleTagClick(tag.name)}
                className={`w-full text-left px-5 py-3 rounded-2xl text-sm font-bold transition-all duration-300 flex justify-between items-center group ${
                  selectedTag === tag.name ? 'bg-orange-600 text-white shadow-lg shadow-orange-500/20 scale-[1.02]' : 'text-gray-500 dark:text-gray-400 hover:bg-white dark:hover:bg-white/5'
                }`}
              >
                <span className="flex items-center gap-3">
                  <Hash className={`h-4 w-4 ${selectedTag === tag.name ? 'text-white' : 'text-orange-500'}`} />
                  {tag.name}
                </span>
                <ChevronRight className={`h-4 w-4 transition-transform group-hover:translate-x-1 ${selectedTag === tag.name ? 'opacity-100' : 'opacity-0'}`} />
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 lg:p-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12"
        >
          <div>
            <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">
              Community <span className="text-orange-600 dark:text-orange-500">Feed</span>
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">Join the conversation and solve academic challenges together.</p>
          </div>
          
          <Link 
            to="/ask"
            className="btn-primary"
          >
            <PlusCircle className="h-5 w-5" />
            Ask Question
          </Link>
        </motion.div>

        {/* Search Bar */}
        <motion.form 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSearch} 
          className="relative mb-12 group"
        >
          <div className="absolute inset-0 bg-orange-600/5 blur-2xl rounded-3xl group-focus-within:bg-orange-600/10 transition-colors" />
          <div className="relative glass-card rounded-[1.5rem] flex items-center p-2 border-transparent group-focus-within:border-orange-500/50 transition-all">
            <div className="p-3">
              <Search className="h-6 w-6 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Search by topic, keyword, or tag..."
              className="w-full py-4 bg-transparent text-gray-900 dark:text-white font-medium focus:outline-none placeholder-gray-400 dark:placeholder-gray-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="hidden md:block px-6 py-3 bg-gray-900 dark:bg-orange-600 text-white font-bold rounded-2xl hover:scale-105 active:scale-95 transition-all">
              Search
            </button>
          </div>
        </motion.form>

        {/* Question List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="relative">
              <div className="h-16 w-16 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-8 w-8 bg-orange-500/10 rounded-full animate-pulse" />
              </div>
            </div>
            <p className="text-gray-500 dark:text-gray-400 font-bold mt-6 tracking-wide uppercase text-xs">Syncing Knowledge...</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {questions.length > 0 ? (
              <motion.div 
                layout
                className="grid gap-6"
              >
                {questions.map((q, index) => (
                  <motion.div
                    key={q.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <QuestionCard question={q} />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-24 glass-card rounded-[2.5rem] border-dashed border-2 border-gray-200 dark:border-white/10"
              >
                <div className="bg-gray-100 dark:bg-gray-800 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">No results found</h3>
                <p className="text-gray-500 dark:text-gray-400 font-medium mb-8">Try adjusting your filters or search keywords.</p>
                <button 
                  onClick={() => {setSearchQuery(''); setSelectedTag(''); fetchQuestions('', '');}}
                  className="px-8 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-2xl hover:scale-105 transition-all"
                >
                  Reset all filters
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </main>
      </div>
    </div>

  );
};

export default FeedPage;
