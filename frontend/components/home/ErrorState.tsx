interface ErrorStateProps {
  error: string;
}

export default function ErrorState({ error }: ErrorStateProps) {
  return (
    <div className="max-w-7xl mx-auto px-6 py-24 text-center">
      <div className="text-7xl mb-6">⚠️</div>
      <h2 className="text-3xl font-bold text-navy-800 dark:text-navy-200 mb-4">
        Failed to Load Articles
      </h2>
      <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
        {error}
      </p>
      <button
        onClick={() => window.location.reload()}
        className="modern-button inline-flex items-center gap-2"
      >
        <span>🔄</span>
        <span>Retry</span>
      </button>
    </div>
  );
}

