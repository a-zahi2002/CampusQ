import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import CommentSection from '../components/CommentSection';
import { 
  User, Clock, Tag as TagIcon, CheckCircle, 
  Star, ChevronLeft, Loader2, Send 
} from 'lucide-react';

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
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-10 w-10 text-indigo-500 animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Loading question details...</p>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="text-center py-20">
        <p className="text-xl font-bold text-gray-900">Question not found.</p>
        <button onClick={() => navigate('/feed')} className="mt-4 text-indigo-600 font-bold hover:underline">
          Back to Feed
        </button>
      </div>
    );
  }

  const isOwner = user && user.id === question.user_id;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={() => navigate('/feed')}
          className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 transition-colors mb-6 font-bold"
        >
          <ChevronLeft className="h-5 w-5" />
          Back to Feed
        </button>

        {/* Question Section */}
        <div className="bg-white rounded-3xl shadow-sm p-8 mb-8 border border-gray-100">
          <div className="flex flex-wrap gap-2 mb-4">
            {question.tags.map((tag, i) => (
              <span key={i} className="flex items-center gap-1 bg-indigo-50 text-indigo-600 text-xs font-bold px-2.5 py-1 rounded-lg">
                <TagIcon className="h-3 w-3" />
                {tag}
              </span>
            ))}
          </div>

          <h1 className="text-3xl font-black text-gray-900 mb-4">{question.title}</h1>
          
          <div className="flex items-center gap-6 text-sm text-gray-500 mb-8 pb-8 border-b">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="font-bold text-gray-900">{question.author_nickname}</span>
              <span className="bg-gray-100 px-1.5 py-0.5 rounded text-[10px] uppercase font-black">
                {question.author_role}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{new Date(question.created_at).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="prose max-w-none text-gray-800 text-lg leading-relaxed whitespace-pre-wrap">
            {question.body}
          </div>

          <CommentSection type="question" id={id} />
        </div>

        {/* Answers Section */}
        <div className="space-y-6 mb-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-gray-900">{answers.length} Answers</h2>
          </div>

          {answers.map((answer) => (
            <div 
              key={answer.id} 
              className={`bg-white rounded-3xl shadow-sm p-8 border-2 transition-all ${
                answer.is_accepted ? 'border-green-500 bg-green-50/20' : 'border-transparent'
              }`}
            >
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <div className="bg-indigo-100 p-2 rounded-xl text-indigo-600 font-black">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900 text-lg">{answer.author_nickname}</span>
                      <span className={`text-[10px] uppercase font-black px-1.5 py-0.5 rounded ${
                        answer.author_role === 'lecturer' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {answer.author_role}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400 font-medium">
                      Answered on {new Date(answer.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {answer.is_accepted && (
                    <div className="flex items-center gap-1.5 bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-sm font-black">
                      <CheckCircle className="h-4 w-4" />
                      ACCEPTED
                    </div>
                  )}
                  
                  <div className="flex items-center gap-1 bg-yellow-50 text-yellow-600 px-3 py-1 rounded-lg">
                    <Star className="h-4 w-4 fill-yellow-600" />
                    <span className="font-bold text-lg">{parseFloat(answer.avg_rating).toFixed(1)}</span>
                  </div>
                </div>
              </div>

              <div className="text-gray-800 text-lg leading-relaxed mb-6 whitespace-pre-wrap">
                {answer.body}
              </div>

              <div className="flex items-center justify-between border-t pt-6">
                <div className="flex items-center gap-4">
                  {isOwner && (
                    <div className="flex items-center gap-4">
                      {!answer.is_accepted && (
                        <button 
                          onClick={() => handleAcceptAnswer(answer.id)}
                          className="bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-green-700 transition-colors"
                        >
                          Accept Answer
                        </button>
                      )}
                      
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-500">Rate:</span>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => handleRateAnswer(answer.id, star)}
                            className="hover:scale-125 transition-transform"
                          >
                            <Star 
                              className={`h-5 w-5 ${
                                star <= Math.round(answer.avg_rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <CommentSection type="answer" id={answer.id} />
            </div>
          ))}
        </div>

        {/* Answer Submission Form */}
        {user ? (
          <div className="bg-white rounded-3xl shadow-sm p-8 border border-gray-100">
            <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
              <MessageSquare className="h-6 w-6 text-indigo-600" />
              Your Answer
            </h3>
            <form onSubmit={handlePostAnswer}>
              <textarea
                required
                rows={6}
                className="w-full bg-gray-50 border-none rounded-2xl p-6 text-lg focus:ring-2 focus:ring-indigo-500 transition-all mb-4"
                placeholder="Share your knowledge and help the community..."
                value={newAnswer}
                onChange={(e) => setNewAnswer(e.target.value)}
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submittingAnswer}
                  className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-200 disabled:opacity-50 flex items-center gap-2"
                >
                  <Send className="h-5 w-5" />
                  {submittingAnswer ? 'Posting...' : 'Post Answer'}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="bg-indigo-50 text-indigo-600 p-8 rounded-3xl text-center font-bold">
            Please sign in to provide an answer.
          </div>
        )}
      </div>
    </div>
  );
};

const MessageSquare = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
  </svg>
);

export default QuestionDetailPage;
