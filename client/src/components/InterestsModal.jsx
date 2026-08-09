import { useState, useEffect } from 'react';
import api from '../services/api';
import { Sparkles, Hash, Check, X, Loader2, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const InterestsModal = ({ isOpen, onClose, onSaveSuccess }) => {
  const [allTags, setAllTags] = useState([]);
  const [selectedTagIds, setSelectedTagIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchTagsAndInterests();
    }
  }, [isOpen]);

  const fetchTagsAndInterests = async () => {
    setLoading(true);
    setMessage('');
    try {
      const [tagsRes, interestsRes] = await Promise.all([
        api.get('/tags'),
        api.get('/user/interests')
      ]);

      setAllTags(tagsRes.data.tags || []);
      const userInterests = interestsRes.data.interests || [];
      setSelectedTagIds(userInterests.map((t) => t.id));
    } catch (err) {
      console.error('Error fetching interests:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleTag = (tagId) => {
    if (selectedTagIds.includes(tagId)) {
      setSelectedTagIds(selectedTagIds.filter((id) => id !== tagId));
    } else {
      setSelectedTagIds([...selectedTagIds, tagId]);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      await api.put('/user/interests', { tag_ids: selectedTagIds });
      setMessage('Academic interests updated successfully!');
      setTimeout(() => {
        if (onSaveSuccess) onSaveSuccess();
        onClose();
      }, 800);
    } catch (err) {
      console.error('Error saving interests:', err);
      setMessage('Failed to update interests. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-xl glass-card rounded-[2.5rem] bg-white dark:bg-gray-900 border border-gray-100 dark:border-white/10 p-8 shadow-2xl overflow-hidden"
        >
          {/* Top Decorative Banner */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100 dark:border-white/5">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-orange-100 dark:bg-orange-950/40 rounded-2xl">
                <Sparkles className="h-6 w-6 text-orange-600 dark:text-orange-500" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-gray-900 dark:text-white">Academic Topics</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Select subjects to personalize your discussion feed.</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="h-10 w-10 text-orange-500 animate-spin mb-4" />
              <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Loading Academic Tags...</p>
            </div>
          ) : (
            <div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-64 overflow-y-auto p-1 custom-scrollbar mb-6">
                {allTags.map((tag) => {
                  const isSelected = selectedTagIds.includes(tag.id);
                  return (
                    <button
                      key={tag.id}
                      onClick={() => toggleTag(tag.id)}
                      className={`flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all duration-200 ${
                        isSelected
                          ? 'bg-orange-600 text-white shadow-lg shadow-orange-500/20 scale-[1.02]'
                          : 'bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10'
                      }`}
                    >
                      <span className="flex items-center gap-2 truncate">
                        <Hash className={`h-3.5 w-3.5 ${isSelected ? 'text-white' : 'text-orange-500'}`} />
                        {tag.name}
                      </span>
                      {isSelected && <Check className="h-4 w-4 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {message && (
                <p className={`text-xs font-bold mb-4 text-center ${message.includes('success') ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>
                  {message}
                </p>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-white/5">
                <button
                  onClick={onClose}
                  className="px-6 py-3 rounded-2xl text-xs font-bold text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="btn-primary px-8 py-3 text-xs flex items-center gap-2"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  {saving ? 'Saving...' : 'Save Preferences'}
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default InterestsModal;
