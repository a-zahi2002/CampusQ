import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { MessageSquare, Send, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CommentSection = ({ type, id }) => {
  const [comments, setComments] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (isExpanded) {
      fetchComments();
    }
  }, [isExpanded, id]);

  const fetchComments = async () => {
    try {
      const response = await api.get(`/comments/${type}/${id}`);
      setComments(response.data.comments);
    } catch (err) {
      console.error('Error fetching comments:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      const payload = { body: newComment };
      if (type === 'question') payload.question_id = id;
      else payload.answer_id = id;
      
      await api.post('/comments', payload);
      setNewComment('');
      fetchComments();
    } catch (err) {
      console.error('Error posting comment:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-8 border-t dark:border-white/5 pt-6">
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-3 text-sm font-black uppercase tracking-widest text-gray-500 hover:text-orange-600 dark:hover:text-orange-500 transition-colors group"
      >
        <div className="p-2 bg-gray-100 dark:bg-white/5 rounded-xl group-hover:bg-orange-100 dark:group-hover:bg-orange-900/30 transition-colors">
          <MessageSquare className="h-4 w-4" />
        </div>
        {comments.length > 0 ? `${comments.length} Comments` : 'Join Discussion'}
        <div className="ml-auto p-1 border border-gray-200 dark:border-white/10 rounded-lg group-hover:border-orange-200 dark:group-hover:border-orange-500/30 transition-colors">
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-6 pl-6 border-l-2 border-orange-100 dark:border-orange-900/30 space-y-6">
              {comments.map((comment, i) => (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  key={comment.id} 
                  className="text-sm bg-gray-50 dark:bg-white/5 p-4 rounded-2xl"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-black text-gray-900 dark:text-white text-base">{comment.author_nickname}</span>
                    <span className="text-gray-400 dark:text-gray-500 text-xs font-bold tracking-wider uppercase">• {new Date(comment.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 text-base font-medium leading-relaxed">{comment.body}</p>
                </motion.div>
              ))}

              {user ? (
                <form onSubmit={handleSubmit} className="flex gap-3 mt-6">
                  <input 
                    type="text"
                    placeholder="Contribute your thoughts..."
                    className="flex-1 text-sm bg-gray-50 dark:bg-white/5 border border-transparent dark:border-transparent rounded-xl px-5 py-3 focus:border-orange-500/50 dark:focus:border-orange-500/50 outline-none transition-all text-gray-900 dark:text-white font-medium placeholder-gray-400 dark:placeholder-gray-600"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                  />
                  <button 
                    disabled={submitting || !newComment.trim()}
                    className="bg-orange-600 text-white p-3 rounded-xl hover:bg-orange-700 disabled:opacity-50 disabled:hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/20 flex items-center justify-center"
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </form>
              ) : (
                <div className="bg-orange-50 dark:bg-orange-900/10 text-orange-600 dark:text-orange-500 text-xs font-bold p-4 rounded-xl border border-orange-100 dark:border-orange-500/20">
                  Please sign in to participate in the discussion.
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CommentSection;
