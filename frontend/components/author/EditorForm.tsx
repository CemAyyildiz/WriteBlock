import { useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import 'easymde/dist/easymde.min.css';

const SimpleMDE = dynamic(() => import('react-simplemde-editor'), { ssr: false });

interface EditorFormProps {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  slugError: string | null;
  isCheckingSlug: boolean;
  isSaving: boolean;
  saveSuccess: boolean;
  txInfo: { walrusBlobId: string; txHash: string } | null;
  editingPage: any;
  isUpdating: boolean;
  currentAccount: any;
  onTitleChange: (value: string) => void;
  onSlugChange: (value: string) => void;
  onExcerptChange: (value: string) => void;
  onContentChange: (value: string) => void;
  onPublish: () => void;
  onUpdate: () => void;
  onCancelEdit: () => void;
}

export default function EditorForm({
  title,
  slug,
  excerpt,
  content,
  slugError,
  isCheckingSlug,
  isSaving,
  saveSuccess,
  txInfo,
  editingPage,
  isUpdating,
  currentAccount,
  onTitleChange,
  onSlugChange,
  onExcerptChange,
  onContentChange,
  onPublish,
  onUpdate,
  onCancelEdit,
}: EditorFormProps) {
  const editorOptions = useMemo(() => ({
    spellChecker: false,
    placeholder: 'Start writing your story...',
    status: ['lines', 'words', 'cursor'] as any,
    autofocus: false,
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
  }), []);

  return (
    <div className="space-y-6">
      {/* User Info Card */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full flex items-center justify-center bg-gray-900 text-white">
              <span className="text-2xl">👤</span>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500 mb-1">
                Connected Address
              </div>
              <div className="font-mono text-sm font-semibold text-gray-900">
                {currentAccount
                  ? `${currentAccount.address.substring(0, 10)}...${currentAccount.address.substring(currentAccount.address.length - 8)}`
                  : 'Not connected'
                }
              </div>
            </div>
          </div>
          {editingPage && (
            <button
              onClick={onCancelEdit}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel Edit
            </button>
          )}
        </div>
      </div>

      {/* Meta Fields */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Title *
          </label>
          <Input
            type="text"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Enter article title"
            className="text-base"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Slug * {isCheckingSlug && <span className="text-xs text-gray-500">(checking...)</span>}
          </label>
          <Input
            type="text"
            value={slug}
            onChange={(e) => onSlugChange(e.target.value)}
            placeholder="article-slug"
            className={`text-base ${slugError ? 'border-red-500' : ''}`}
          />
          {slugError && (
            <p className="text-xs text-red-600 mt-1">{slugError}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            URL-friendly identifier (e.g., my-first-article)
          </p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Excerpt
          </label>
          <Textarea
            value={excerpt}
            onChange={(e) => onExcerptChange(e.target.value)}
            placeholder="Brief description of your article"
            rows={3}
            className="text-base resize-none"
          />
        </div>
      </div>

      {/* Editor */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <label className="block text-sm font-semibold text-gray-900 mb-4">
          Content (Markdown)
        </label>
        <SimpleMDE
          value={content}
          onChange={onContentChange}
          options={editorOptions}
        />
      </div>

      {/* Publish Button */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        {editingPage ? (
          <button
            onClick={onUpdate}
            disabled={isUpdating || !title.trim() || !slug.trim() || !!slugError}
            className="w-full px-6 py-4 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isUpdating ? (
              <>
                <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Updating Article...</span>
              </>
            ) : (
              <>
                <span>💾</span>
                <span>Update Article (Version {editingPage.version + 1})</span>
              </>
            )}
          </button>
        ) : (
          <button
            onClick={onPublish}
            disabled={isSaving || !title.trim() || !slug.trim() || !!slugError}
            className="w-full px-6 py-4 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <>
                <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Publishing...</span>
              </>
            ) : (
              <>
                <span>🚀</span>
                <span>Publish to Blockchain</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Success Message */}
      {saveSuccess && txInfo && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-200 flex items-center justify-center">
              <span className="text-xl">✓</span>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 mb-2">
                {editingPage ? 'Article Updated!' : 'Published Successfully!'}
              </h3>
              <p className="text-sm text-gray-700 mb-3">
                Your article has been {editingPage ? 'updated' : 'published'} to the blockchain and stored on Walrus.
              </p>
              <div className="space-y-2 text-xs">
                <div className="p-2 bg-white rounded border border-green-200">
                  <span className="font-semibold text-gray-700">Walrus Blob ID:</span>
                  <p className="font-mono text-gray-600 break-all mt-1">{txInfo.walrusBlobId}</p>
                </div>
                <div className="p-2 bg-white rounded border border-green-200">
                  <span className="font-semibold text-gray-700">Transaction Hash:</span>
                  <p className="font-mono text-gray-600 break-all mt-1">{txInfo.txHash}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

