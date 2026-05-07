import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import CommentSection from '../components/CommentSection';
import { 
  User, Clock, Tag as TagIcon, CheckCircle, 
  Star, ChevronLeft, Loader2, Send, MessageSquare, Sparkles 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const QuestionDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [question, setQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newAnswer, setNewAnswer] = useState('');
  const [submittingAnswer, setSubmittingAnswer] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [qRes, aRes] = await Promise.all([
        api.get(`/questions/${id}`),
        api.get(`/answers/question/${id}`)
      ]);
      setQuestion(qRes.data.question);
      setAnswers(aRes.data.answers);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePostAnswer = async (e) => {
    e.preventDefault();
    if (!newAnswer.trim()) return;

    setSubmittingAnswer(true);
    try {
      await api.post('/answers', {
        question_id: id,
        body: newAnswer
      });
      setNewAnswer('');
      fetchData(); // Refresh to show new answer
    } catch (err) {
      console.error('Error posting answer:', err);
    } finally {
      setSubmittingAnswer(false);
    }
  };

  const handleAcceptAnswer = async (answerId) => {
    try {
      await api.patch(`/answers/${answerId}/accept`);
      fetchData();
    } catch (err) {
      console.error('Error accepting answer:', err);
    }
  };

  const handleRateAnswer = async (answerId, stars) => {
    try {
      await api.post('/ratings', { answer_id: answerId, stars });
      fetchData();
    } catch (err) {
      console.error('Error rating answer:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#f8f9fa] dark:bg-gray-950">
        <div className="h-16 w-16 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin mb-6" />
        <p className="text-gray-500 dark:text-gray-400 font-bold tracking-widest uppercase text-xs">Assembling Knowledge...</p>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8f9fa] dark:bg-gray-950 p-6 text-center">
        <div className="bg-white dark:bg-white/5 p-8 rounded-[3rem] glass-card max-w-md">
          <div className="bg-red-100 dark:bg-red-900/30 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Sparkles className="h-10 w-10 text-red-600" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-4">Question Missing</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-8">This discussion may have been moved or archived.</p>
          <button onClick={() => navigate('/feed')} className="btn-primary w-full">
            Back to Community Feed
          </button>
        </div>
      </div>
    );
  }

  const isOwner = user && user.id === question.user_id;

  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-gray-950 transition-colors duration-500">
      <Navbar />
      <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <motion.button 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate('/feed')}
          className="flex items-center gap-2 text-orange-600 dark:text-orange-500 hover:gap-3 transition-all mb-10 font-black text-sm uppercase tracking-widest"
        >
          <ChevronLeft className="h-5 w-5" />
          Back to Feed
        </motion.button>

        {/* Question Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-[3rem] p-10 mb-12 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <MessageSquare className="h-32 w-32 text-orange-500" />
          </div>

          <div className="flex flex-wrap gap-3 mb-8">
            {question.tags.map((tag, i) => (
              <span key={i} className="flex items-center gap-2 bg-orange-100 dark:bg-orange-950/30 text-orange-600 dark:text-orange-500 text-xs font-black px-4 py-2 rounded-xl uppercase tracking-wider border border-orange-200/50 dark:border-orange-500/20">
                <TagIcon className="h-3.5 w-3.5" />
                {tag}
              </span>
            ))}
          </div>

          <h1 className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white mb-8 leading-[1.1] tracking-tight">{question.title}</h1>
          
          <div className="flex items-center gap-8 text-sm text-gray-500 dark:text-gray-400 mb-10 pb-10 border-b dark:border-white/5">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-gray-100 dark:bg-white/5 rounded-2xl flex items-center justify-center">
                <User className="h-6 w-6 text-gray-400" />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-gray-900 dark:text-white text-base">{question.author_nickname}</span>
                <span className="text-[10px] uppercase font-black tracking-widest text-orange-600 dark:text-orange-500">
                  {question.author_role}
                </span>
              </div>
            </div>
            <div className="h-12 w-[1px] bg-gray-100 dark:bg-white/5" />
            <div className="flex items-center gap-3 font-bold">
              <Clock className="h-5 w-5 text-gray-400" />
              <span>{new Date(question.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
          </div>

          <div className="prose dark:prose-invert max-w-none text-gray-800 dark:text-gray-300 text-xl leading-relaxed whitespace-pre-wrap font-medium">
            {question.body}
          </div>

          <div className="mt-12">
            <CommentSection type="question" id={id} />
          </div>
        </motion.div>

        {/* Answers Section */}
        <div className="space-y-10 mb-16">
          <div className="flex items-center justify-between px-4">
            <h2 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-4">
              {answers.length} Solutions
              <div className="h-2 w-2 rounded-full bg-orange-500" />
            </h2>
          </div>

          <AnimatePresence>
            {answers.map((answer, index) => (
              <motion.div 
                key={answer.id} 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`glass-card rounded-[2.5rem] p-10 border-2 transition-all ${
                  answer.is_accepted ? 'border-orange-500 shadow-2xl shadow-orange-500/10' : 'border-transparent'
                }`}
              >
                <div className="flex justify-between items-start mb-8">
                  <div className="flex items-center gap-4">
                    <div className="bg-gray-100 dark:bg-white/5 h-12 w-12 rounded-2xl flex items-center justify-center">
                      <User className="h-6 w-6 text-gray-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="font-black text-gray-900 dark:text-white text-xl">{answer.author_nickname}</span>
                        <span className={`text-[10px] uppercase font-black tracking-widest px-2.5 py-1 rounded-lg ${
                          answer.author_role === 'lecturer' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                        }`}>
                          {answer.author_role}
                        </span>
                      </div>
                      <span className="text-xs text-gray-400 dark:text-gray-500 font-bold mt-1 block">
                        Verified {new Date(answer.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {answer.is_accepted && (
                      <div className="flex items-center gap-2 bg-orange-600 text-white px-6 py-2 rounded-2xl text-xs font-black tracking-widest uppercase shadow-lg shadow-orange-500/20">
                        <CheckCircle className="h-4 w-4" />
                        Best Solution
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2 bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-500 px-4 py-2 rounded-2xl border border-orange-200/50 dark:border-orange-500/20">
                      <Star className="h-5 w-5 fill-orange-500" />
                      <span className="font-black text-xl">{parseFloat(answer.avg_rating).toFixed(1)}</span>
                    </div>
                  </div>
                </div>

                <div className="text-gray-800 dark:text-gray-300 text-lg leading-relaxed mb-8 whitespace-pre-wrap font-medium">
                  {answer.body}
                </div>

                <div className="flex items-center justify-between border-t dark:border-white/5 pt-8">
                  <div className="flex items-center gap-6">
                    {isOwner && (
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                        {!answer.is_accepted && (
                          <button 
                            onClick={() => handleAcceptAnswer(answer.id)}
                            className="px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl text-sm font-black hover:scale-105 active:scale-95 transition-all shadow-xl"
                          >
                            Accept Solution
                          </button>
                        )}
                        
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-black uppercase tracking-widest text-gray-400">Rate Quality</span>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                onClick={() => handleRateAnswer(answer.id, star)}
                                className="hover:scale-125 transition-transform p-1"
                              >
                                <Star 
                                  className={`h-5 w-5 transition-colors ${
                                    star <= Math.round(answer.avg_rating) ? 'fill-orange-500 text-orange-500' : 'text-gray-300 dark:text-white/10'
                                  }`}
                                />
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-8">
                  <CommentSection type="answer" id={answer.id} />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Answer Submission Form */}
        {user ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card rounded-[3rem] p-10 border-transparent bg-white dark:bg-white/5"
          >
            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-8 flex items-center gap-4">
              <div className="p-3 bg-orange-100 dark:bg-orange-950/30 rounded-2xl">
                <MessageSquare className="h-6 w-6 text-orange-600 dark:text-orange-500" />
              </div>
              Contribute Solution
            </h3>
            <form onSubmit={handlePostAnswer}>
              <div className="relative group mb-6">
                <div className="absolute inset-0 bg-orange-600/5 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity rounded-[2rem]" />
                <textarea
                  required
                  rows={6}
                  className="relative w-full bg-gray-50 dark:bg-white/5 border-2 border-transparent focus:border-orange-500/50 rounded-[2rem] p-8 text-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none transition-all"
                  placeholder="Share your expertise and help a peer out..."
                  value={newAnswer}
                  onChange={(e) => setNewAnswer(e.target.value)}
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submittingAnswer}
                  className="btn-primary px-10 py-5"
                >
                  {submittingAnswer ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  )}
                  {submittingAnswer ? 'Broadcasting...' : 'Broadcast Solution'}
                </button>
              </div>
            </form>
          </motion.div>
        ) : (
          <div className="bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-500/20 text-orange-600 dark:text-orange-500 p-10 rounded-[3rem] text-center font-black text-xl">
            Please sign in to join the discussion.
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionDetailPage;

