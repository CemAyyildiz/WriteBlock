export default function LoadingState() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-24 text-center">
      <div className="inline-block w-16 h-16 border-4 border-navy-600 border-t-neon-green rounded-full animate-spin"></div>
      <p className="mt-6 text-lg text-gray-600 dark:text-gray-400 font-medium">
        Loading articles from blockchain...
      </p>
    </div>
  );
}

