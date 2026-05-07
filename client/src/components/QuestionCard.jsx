import { Link } from 'react-router-dom';
import { MessageSquare, Clock, User, Tag as TagIcon } from 'lucide-react';

const QuestionCard = ({ question }) => {
  const { 
    id, 
    title, 
    tags, 
    author_nickname, 
    author_role, 
    answer_count, 
    created_at,
    interest_score 
  } = question;

  const is_preferred = interest_score > 0;

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <Link 
      to={`/questions/${id}`}
      className={`block bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm hover:shadow-md dark:shadow-none transition-all border-l-4 ${
        is_preferred ? 'border-indigo-500 bg-indigo-50/30 dark:bg-orange-500/10' : 'border-transparent'
      }`}
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-2 hover:text-indigo-600 dark:hover:text-orange-500 transition-colors">
          {title}
        </h3>
        {is_preferred && (
          <span className="bg-indigo-100 dark:bg-orange-900/30 text-indigo-700 dark:text-orange-400 text-xs font-bold px-2.5 py-0.5 rounded-full whitespace-nowrap">
            Matches Your Interests
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {tags && tags.map((tag, index) => (
          <span 
            key={index}
            className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs px-2 py-1 rounded-md"
          >
            <TagIcon className="h-3 w-3" />
            {tag}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between mt-4 text-sm text-gray-500 dark:text-gray-400 border-t dark:border-gray-800 pt-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <User className="h-4 w-4" />
            <span className="font-medium text-gray-700 dark:text-gray-300">{author_nickname}</span>
            <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
              author_role === 'lecturer' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
            }`}>
              {author_role}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            <span>{formatDate(created_at)}</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800 px-3 py-1 rounded-full text-indigo-600 dark:text-orange-500 font-bold">
          <MessageSquare className="h-4 w-4" />
          <span>{answer_count} answers</span>
        </div>
      </div>
    </Link>
  );
};

export default QuestionCard;
