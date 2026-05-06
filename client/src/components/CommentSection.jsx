import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { MessageSquare, Send, ChevronDown, ChevronUp } from 'lucide-react';

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
      await api.post('/comments', {
        parent_type: type,
        parent_id: id,
        content: newComment
      });
      setNewComment('');
      fetchComments();
    } catch (err) {
      console.error('Error posting comment:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-4 border-t pt-4">
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-indigo-600 transition-colors"
      >
        <MessageSquare className="h-4 w-4" />
        {comments.length > 0 ? `${comments.length} Comments` : 'Add a Comment'}
        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>

      {isExpanded && (
        <div className="mt-4 pl-4 border-l-2 border-gray-100 space-y-4">
          {comments.map((comment) => (
            <div key={comment.comment_id} className="text-sm">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-gray-900">{comment.author_nickname}</span>
                <span className="text-gray-400 text-xs">• {new Date(comment.created_at).toLocaleDateString()}</span>
              </div>
              <p className="text-gray-700">{comment.content}</p>
            </div>
          ))}

          {user ? (
            <form onSubmit={handleSubmit} className="flex gap-2 mt-4">
              <input 
                type="text"
                placeholder="Write a comment..."
                className="flex-1 text-sm bg-gray-50 border-none rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <button 
                disabled={submitting}
                className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          ) : (
            <p className="text-xs text-gray-500 italic">Please login to comment.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default CommentSection;
