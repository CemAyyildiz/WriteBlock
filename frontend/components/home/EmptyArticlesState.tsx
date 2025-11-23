import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import LogoAnimation from '@/components/LogoAnimation';

export default function EmptyArticlesState() {
  return (
    <section className="py-32">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="text-center max-w-2xl mx-auto">
          <div className="flex justify-center mb-6">
            <LogoAnimation size="md" />
          </div>
          
          <h2 className="text-3xl font-serif font-bold text-gray-900 mb-4">
            No stories yet
          </h2>
          
          <p className="text-lg text-gray-600 mb-8 leading-relaxed">
            Be the first to publish on WriteBlock. Your story will live forever on the blockchain.
          </p>
          
          <Link href="/author">
            <button className="px-8 py-3.5 bg-gray-900 text-white rounded-full font-medium hover:bg-gray-800 transition-colors duration-200 inline-flex items-center gap-2">
              Write your first story
              <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}

