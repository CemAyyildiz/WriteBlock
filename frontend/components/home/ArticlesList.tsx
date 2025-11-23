import Link from 'next/link';
import { Clock, User, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { PageMetadata } from '@/types';

interface ArticlesListProps {
  pages: PageMetadata[];
}

export default function ArticlesList({ pages }: ArticlesListProps) {
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  if (pages.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center">
        <FileText className="w-12 h-12 mx-auto text-gray-300 mb-6" strokeWidth={1.5} />
        <h3 className="text-2xl font-serif font-semibold text-gray-900 mb-3 tracking-tight">
          No stories yet
        </h3>
        <p className="text-base text-gray-600 mb-8 leading-relaxed">
          Be the first to share your thoughts on WriteBlock.
        </p>
        <Button asChild className="rounded-full">
          <Link href="/author">
            Start Writing
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {pages.map((page) => (
        <article key={page.page_id} className="max-w-3xl">
          <Link href={`/${page.slug}`} className="block group">
            <div className="space-y-3">
              <div className="flex items-center gap-2.5 text-sm text-gray-600">
                <User className="w-3.5 h-3.5" strokeWidth={1.5} />
                <span className="font-mono text-xs">{formatAddress(page.author)}</span>
              </div>

              <h2 className="text-3xl font-serif font-bold text-gray-900 leading-[1.2] tracking-tight group-hover:text-gray-700 transition-colors duration-200">
                {page.title}
              </h2>

              <p className="text-base text-gray-600 leading-relaxed line-clamp-3 font-light">
                {page.excerpt}
              </p>

              <div className="flex items-center gap-4 text-sm text-gray-500 pt-2">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" strokeWidth={1.5} />
                  <span className="text-xs">{formatDate(page.updated_at)}</span>
                </div>
                <Badge variant="secondary" className="text-xs font-mono">
                  v{page.version}
                </Badge>
              </div>
            </div>
          </Link>
          <Separator className="mt-12 bg-gray-200" />
        </article>
      ))}
    </div>
  );
}

