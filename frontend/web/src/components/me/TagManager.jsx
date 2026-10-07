import React, { useState } from 'react';

// Reusable Tag Management Unit
export const TagManager = ({ tags = [], onAddTag, onDeleteTag }) => {
  const [isInputOpen, setIsInputOpen] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleKeyDown = async (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      try {
        setIsSubmitting(true);
        await onAddTag(tagInput.trim());
        setTagInput('');
        setIsInputOpen(false); // Disappears after submission
      } catch (err) {
        console.error('Failed to attach tag:', err);
      } finally {
        setIsSubmitting(false);
      }
    } else if (e.key === 'Escape') {
      e.stopPropagation();
      setIsInputOpen(false);
      setTagInput('');
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-[10px] text-gray-500 tracking-widest uppercase">
          // METADATA TAGS ({tags.length})
        </span>
        {!isInputOpen && (
          <button
            type="button"
            onClick={() => setIsInputOpen(true)}
            className="text-[10px] text-[#00ffaa] border border-[#00ffaa]/30 px-1.5 py-0.5 rounded bg-[#00ffaa]/10 hover:bg-[#00ffaa]/20 transition-colors"
          >
            + ADD TAG
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        {/* Existing Tags with Delete Cross (✕) */}
        {tags.map((tag, idx) => {
          const tagName = typeof tag === 'string' ? tag : tag.name;
          const tagId = typeof tag === 'object' ? tag.id : idx;

          return (
            <span
              key={tagId || idx}
              className="inline-flex items-center gap-1.5 text-[10px] bg-[#1a1a1a] border border-gray-800 text-gray-300 px-2 py-1 rounded group hover:border-gray-700 transition-colors"
            >
              <span>#{tagName}</span>
              <button
                type="button"
                onClick={() => onDeleteTag(tagName)}
                className="text-gray-500 hover:text-red-400 font-bold leading-none px-0.5 transition-colors"
                title={`Remove #${tagName}`}
              >
                ✕
              </button>
            </span>
          );
        })}

        {/* Dynamic Input Bar (Appears on click, disappears after submit/ESC) */}
        {isInputOpen && (
          <div className="inline-flex items-center gap-1">
            <input
              type="text"
              autoFocus
              value={tagInput}
              disabled={isSubmitting}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={() => {
                if (!tagInput.trim()) setIsInputOpen(false);
              }}
              placeholder="Tag name... (Enter)"
              className="text-[10px] bg-[#121212] border border-[#00ffaa] text-gray-100 px-2 py-1 rounded focus:outline-none w-32 transition-colors disabled:opacity-50"
            />
            <button
              type="button"
              onClick={() => setIsInputOpen(false)}
              className="text-gray-500 hover:text-gray-300 text-xs px-1"
            >
              ✕
            </button>
          </div>
        )}
      </div>
    </div>
  );
};