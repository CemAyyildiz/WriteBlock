import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function HeroSection() {
  return (
    <section className="border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-16 sm:py-24">
        <div className="max-w-4xl">
          <Badge variant="outline" className="mb-6 text-xs font-medium border-gray-300 text-gray-700">
            <Sparkles className="w-3 h-3 mr-1.5" />
            Decentralized Publishing
          </Badge>
          
          <h1 className="text-6xl sm:text-7xl lg:text-8xl font-serif font-bold text-gray-900 mb-8 tracking-tight leading-[0.95]">
            WriteBlock
          </h1>
          
          <p className="text-xl sm:text-2xl text-gray-600 leading-relaxed mb-12 font-light max-w-3xl">
            A new kind of publishing platform where your words live forever on the blockchain. 
            Write, share, and truly own your content.
          </p>

          <div className="flex flex-wrap gap-4">
            <Link href="/author">
              <button className="px-8 py-3.5 bg-gray-900 text-white rounded-full font-medium hover:bg-gray-800 transition-colors duration-200">
                Start writing
              </button>
            </Link>
            <Link href="/admin">
              <button className="px-8 py-3.5 border border-gray-900 text-gray-900 rounded-full font-medium hover:bg-gray-50 transition-colors duration-200">
                Explore stories
              </button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

