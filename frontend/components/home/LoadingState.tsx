import { Loader2 } from 'lucide-react';

export default function LoadingState() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-32 text-center">
      <Loader2 className="w-8 h-8 mx-auto text-gray-400 animate-spin" strokeWidth={1.5} />
      <p className="mt-6 text-base text-gray-600 font-normal tracking-tight">
        Loading articles...
      </p>
    </div>
  );
}

