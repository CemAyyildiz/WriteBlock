import { Separator } from '@/components/ui/separator';

interface HeaderSectionProps {
  totalPages: number;
}

export default function HeaderSection({ totalPages }: HeaderSectionProps) {
  return (
    <div className="mb-16">
      <div className="max-w-3xl mb-8">
        <h1 className="text-6xl font-serif font-bold text-gray-900 mb-4 leading-[1.1] tracking-tight">
          WriteBlock
        </h1>
        <p className="text-xl text-gray-600 leading-relaxed font-light">
          A decentralized publishing platform for the modern writer. 
          {totalPages > 0 && ` ${totalPages} ${totalPages === 1 ? 'story' : 'stories'} and counting.`}
        </p>
      </div>
      <Separator className="bg-gray-200" />
    </div>
  );
}

