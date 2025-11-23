import { useMemo } from 'react';
import dynamic from 'next/dynamic';
import 'easymde/dist/easymde.min.css';

const SimpleMDE = dynamic(() => import('react-simplemde-editor'), { ssr: false });

interface EditRequestModalProps {
  isOpen: boolean;
  content: string;
  isSubmitting: boolean;
  onClose: () => void;
  onContentChange: (value: string) => void;
  onSubmit: () => void;
}

import LoadingSpinner from '@/components/LoadingSpinner';

export default function EditRequestModal({
  isOpen,
  content,
  isSubmitting,
  onClose,
  onContentChange,
  onSubmit
}: EditRequestModalProps) {
  const editorOptions = useMemo(() => {
    return {
      spellChecker: false,
      placeholder: 'Edit the content...',
      status: ['lines', 'words', 'cursor'] as any,
      autofocus: true,
      toolbar: [
        'bold',
        'italic',
        'heading',
        '|',
        'quote',
        'unordered-list',
        'ordered-list',
        '|',
        'link',
        'image',
        '|',
        'preview',
        'side-by-side',
        'fullscreen',
        '|',
        'guide',
      ] as any,
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-3xl font-serif font-bold text-gray-900 mb-2">
          Suggest an Edit
        </h2>
        <p className="text-gray-600 mb-6 leading-relaxed">
          Make your changes below. The author will review your suggestion before publishing.
        </p>
        
        <div className="mb-6">
          <SimpleMDE
            value={content}
            onChange={onContentChange}
            options={editorOptions}
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 px-6 py-3 text-sm font-medium text-gray-700 border border-gray-300 hover:bg-gray-50 rounded-full transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={isSubmitting || !content.trim()}
            className="flex-1 px-6 py-3 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-full transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <LoadingSpinner size="sm" />
                <span>Submitting...</span>
              </>
            ) : (
              <span>Submit suggestion</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

