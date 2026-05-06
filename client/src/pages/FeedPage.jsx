import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import QuestionCard from '../components/QuestionCard';
import { Search, Filter, Hash, Loader2, PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

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
      let response;
      if (search) {
        response = await api.get(`/questions/search?keyword=${search}${tag ? `&tag=${tag}` : ''}`);
      } else if (tag) {
        response = await api.get(`/questions?tag=${tag}`);
      } else if (user) {
        response = await api.get('/questions/feed');
      } else {
        response = await api.get('/questions');
      }
      setQuestions(response.data.questions);
    } catch (err) {
      console.error('Error fetching questions:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTags = async () => {
    try {
      const response = await api.get('/questions/tags');
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
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar for Tags */}
      <aside className="w-64 bg-white border-r hidden lg:block sticky top-0 h-screen overflow-y-auto p-6">
        <div className="flex items-center gap-2 mb-8 text-indigo-600">
          <Filter className="h-5 w-5" />
          <h2 className="text-lg font-bold">Filter by Tags</h2>
        </div>
        
        <div className="space-y-2">
          <button
            onClick={() => handleTagClick('')}
            className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedTag === '' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            All Questions
          </button>
          {tags.map((tag) => (
            <button
              key={tag.tag_id}
              onClick={() => handleTagClick(tag.tag_name)}
              className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-colors flex justify-between items-center ${
                selectedTag === tag.tag_name ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span className="flex items-center gap-2">
                <Hash className="h-3 w-3" />
                {tag.tag_name}
              </span>
            </button>
          ))}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl mx-auto p-6 lg:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-gray-900">CampusQ Feed</h1>
            <p className="text-gray-500 mt-1">Discover questions and share your knowledge.</p>
          </div>
          
          <Link 
            to="/ask"
            className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-200"
          >
            <PlusCircle className="h-5 w-5" />
            Ask Question
          </Link>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="relative mb-8 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
          <input
            type="text"
            placeholder="Search for questions by title, description, or tags..."
            className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>

        {/* Question List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-10 w-10 text-indigo-500 animate-spin mb-4" />
            <p className="text-gray-500 font-medium">Fetching the latest questions...</p>
          </div>
        ) : questions.length > 0 ? (
          <div className="grid gap-6">
            {questions.map((q) => (
              <QuestionCard key={q.question_id} question={q} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
            <p className="text-gray-500 text-lg font-medium">No questions found matching your criteria.</p>
            <button 
              onClick={() => {setSearchQuery(''); setSelectedTag(''); fetchQuestions('', '');}}
              className="mt-4 text-indigo-600 font-bold hover:underline"
            >
              Clear all filters
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default FeedPage;
