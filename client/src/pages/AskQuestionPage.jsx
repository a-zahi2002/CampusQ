import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessageSquare, Tag as TagIcon, ArrowRight, Loader2, Info } from 'lucide-react';
import api from '../services/api';
import Navbar from '../components/Navbar';

const AskQuestionPage = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      const response = await api.get('/tags');
      setAvailableTags(response.data.tags);
    } catch (err) {
      console.error('Error fetching tags:', err);
    }
  };

  const toggleTag = (tagId) => {
    if (selectedTags.includes(tagId)) {
      setSelectedTags(selectedTags.filter(id => id !== tagId));
    } else {
      if (selectedTags.length >= 5) return; // Limit to 5 tags
      setSelectedTags([...selectedTags, tagId]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError('Title and content are required.');
      return;
    }
    if (selectedTags.length === 0) {
      setError('Please select at least one tag.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await api.post('/questions', {
        title,
        content,
        tags: selectedTags
      });
      navigate(`/questions/${response.data.question.id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post question. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-gray-950 transition-colors duration-500">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-2xl">
              <MessageSquare className="h-8 w-8 text-orange-600 dark:text-orange-500" />
            </div>
            <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">Ask a Question</h1>
          </div>
          <p className="text-gray-500 dark:text-gray-400 font-medium text-lg">Share your problem with the community and get expert help.</p>
        </motion.div>

        <motion.form 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSubmit}
          className="glass-card rounded-[2.5rem] p-8 md:p-10 border border-white/20 dark:border-white/5 space-y-8 shadow-xl shadow-gray-200/50 dark:shadow-none"
        >
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-2xl flex items-center gap-3 font-bold text-sm border border-red-100 dark:border-red-900/30">
              <Info className="h-5 w-5 flex-shrink-0" />
              {error}
            </div>
          )}

          <div className="space-y-3">
            <label className="block text-sm font-black text-gray-900 dark:text-white tracking-wide uppercase">Question Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., How does the event loop work in JavaScript?"
              className="w-full px-5 py-4 bg-gray-50 dark:bg-white/5 border-2 border-transparent rounded-2xl focus:border-orange-500/50 focus:bg-white dark:focus:bg-transparent outline-none transition-all text-gray-900 dark:text-white font-medium placeholder-gray-400"
              required
            />
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-black text-gray-900 dark:text-white tracking-wide uppercase">Details & Context</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Describe your problem in detail. Include code snippets, error messages, or steps to reproduce..."
              rows={8}
              className="w-full px-5 py-4 bg-gray-50 dark:bg-white/5 border-2 border-transparent rounded-2xl focus:border-orange-500/50 focus:bg-white dark:focus:bg-transparent outline-none transition-all text-gray-900 dark:text-white font-medium placeholder-gray-400 resize-y custom-scrollbar"
              required
            />
          </div>

          <div className="space-y-4">
            <label className="flex items-center justify-between text-sm font-black text-gray-900 dark:text-white tracking-wide uppercase">
              <span>Relevant Tags</span>
              <span className="text-gray-400 font-medium normal-case">{selectedTags.length}/5 selected</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {availableTags.map((tag) => {
                const isSelected = selectedTags.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all border ${
                      isSelected 
                        ? 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-900/50 scale-[1.05] shadow-sm' 
                        : 'bg-white dark:bg-white/5 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20'
                    }`}
                  >
                    <TagIcon className={`h-4 w-4 ${isSelected ? 'text-orange-600 dark:text-orange-500' : ''}`} />
                    {tag.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 dark:border-white/10">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto ml-auto flex items-center justify-center gap-3 px-10 py-4 bg-orange-600 text-white font-black rounded-2xl shadow-lg shadow-orange-500/30 hover:bg-orange-700 transition-all disabled:opacity-70 uppercase tracking-widest text-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Posting...
                </>
              ) : (
                <>
                  Post Question
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </motion.button>
          </div>
        </motion.form>
      </main>
    </div>
  );
};

export default AskQuestionPage;
