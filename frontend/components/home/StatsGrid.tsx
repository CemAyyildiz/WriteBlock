import { Link2, Database, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function StatsGrid() {
  return (
    <div className="mb-16">
      <div className="flex flex-wrap gap-3 text-sm">
        <Badge variant="secondary" className="gap-2 py-1.5 px-3 font-normal">
          <Link2 className="w-3.5 h-3.5" strokeWidth={1.5} />
          <span>Sui Blockchain</span>
        </Badge>
        <Badge variant="secondary" className="gap-2 py-1.5 px-3 font-normal">
          <Database className="w-3.5 h-3.5" strokeWidth={1.5} />
          <span>Walrus Storage</span>
        </Badge>
        <Badge variant="secondary" className="gap-2 py-1.5 px-3 font-normal">
          <Users className="w-3.5 h-3.5" strokeWidth={1.5} />
          <span>Decentralized</span>
        </Badge>
      </div>
    </div>
  );
}

