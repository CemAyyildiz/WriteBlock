import { Badge } from '@/components/ui/badge';
import { Shield } from 'lucide-react';

export default function AdminHeader() {
  return (
    <div className="mb-10">
      <Badge variant="outline" className="mb-4 border-purple-200 text-purple-700 bg-purple-50">
        <Shield className="w-3 h-3 mr-1.5" />
        Admin Access
      </Badge>
      
      <h1 className="text-4xl sm:text-5xl font-serif font-bold text-gray-900 mb-4 tracking-tight">
        Author Management
      </h1>
      
      <p className="text-lg text-gray-600 leading-relaxed max-w-3xl">
        Grant write permissions to trusted addresses on the blockchain.
      </p>
    </div>
  );
}

