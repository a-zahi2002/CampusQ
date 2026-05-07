import { Link } from 'react-router-dom';
import { MessageSquare, Clock, User, Tag as TagIcon, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

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
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <Link 
        to={`/questions/${id}`}
        className={`block glass-card p-8 rounded-[2rem] hover:border-orange-500/50 transition-all group relative overflow-hidden`}
      >
        {is_preferred && (
          <div className="absolute top-0 right-0 p-1">
             <div className="bg-orange-500 text-white text-[10px] font-black uppercase px-3 py-1 rounded-bl-2xl rounded-tr-xl flex items-center gap-1 shadow-lg">
                <Sparkles className="h-3 w-3" />
                Recommended
             </div>
          </div>
        )}

        <div className="flex justify-between items-start mb-4">
          <h3 className="text-2xl font-black text-gray-900 dark:text-white line-clamp-2 group-hover:text-orange-600 dark:group-hover:text-orange-500 transition-colors leading-tight">
            {title}
          </h3>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {tags && tags.map((tag, index) => (
            <span 
              key={index}
              className="flex items-center gap-1.5 bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-400 text-xs font-bold px-3 py-1.5 rounded-xl border border-gray-100 dark:border-white/5 group-hover:border-orange-200 dark:group-hover:border-orange-900/30 transition-colors"
            >
              <TagIcon className="h-3 w-3 text-orange-500" />
              {tag}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-100 dark:border-white/5">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className={`p-1.5 rounded-lg ${author_role === 'lecturer' ? 'bg-purple-100 dark:bg-purple-900/30' : 'bg-blue-100 dark:bg-blue-900/30'}`}>
                <User className={`h-4 w-4 ${author_role === 'lecturer' ? 'text-purple-600' : 'text-blue-600'}`} />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-gray-900 dark:text-white leading-none">{author_nickname}</span>
                <span className="text-[10px] uppercase font-black tracking-widest text-gray-400 mt-1">{author_role}</span>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-gray-400">
              <Clock className="h-4 w-4" />
              <span className="text-xs font-medium">{formatDate(created_at)}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-orange-600 dark:bg-orange-600 text-white px-4 py-2 rounded-xl font-black text-sm shadow-lg shadow-orange-500/20 group-hover:scale-105 transition-transform">
            <MessageSquare className="h-4 w-4" />
            <span>{answer_count}</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default QuestionCard;

