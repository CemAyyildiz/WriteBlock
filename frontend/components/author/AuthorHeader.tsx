import { Badge } from '@/components/ui/badge';
import { Sparkles } from 'lucide-react';

export default function AuthorHeader() {
  return (
    <div className="mb-10">
      <Badge variant="outline" className="mb-4 border-green-200 text-green-700 bg-green-50">
        <Sparkles className="w-3 h-3 mr-1.5" />
        Authorized Writer
      </Badge>
      
      <h1 className="text-4xl sm:text-5xl font-serif font-bold text-gray-900 mb-4 tracking-tight">
        Write & Publish
      </h1>
      
      <p className="text-lg text-gray-600 leading-relaxed max-w-3xl">
        Create and manage your stories on the blockchain. Your content will be permanently stored on Walrus and recorded on Sui.
      </p>
    </div>
  );
}

