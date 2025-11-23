import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorStateProps {
  error: string;
}

export default function ErrorState({ error }: ErrorStateProps) {
  return (
    <div className="max-w-2xl mx-auto px-6 py-32 text-center">
      <AlertCircle className="w-12 h-12 mx-auto text-gray-400 mb-6" strokeWidth={1.5} />
      <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-3 tracking-tight">
        Unable to Load Articles
      </h2>
      <p className="text-base text-gray-600 mb-8 leading-relaxed max-w-md mx-auto">
        {error}
      </p>
      <Button
        onClick={() => window.location.reload()}
        variant="outline"
        size="default"
        className="rounded-full gap-2"
      >
        <RefreshCw className="w-4 h-4" />
        <span>Try Again</span>
      </Button>
    </div>
  );
}

