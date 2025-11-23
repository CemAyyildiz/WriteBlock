import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface FooterCTAProps {
  totalStories: number;
}

export default function FooterCTA({ totalStories }: FooterCTAProps) {
  return (
    <section className="border-t border-gray-200 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-16 sm:py-20">
        <div className="max-w-4xl">
          <div>
            <h3 className="text-3xl font-serif font-bold text-gray-900 mb-4">
              Write on WriteBlock
            </h3>
            
            <p className="text-lg text-gray-600 leading-relaxed mb-8 max-w-3xl">
              Join a community of writers who believe in true ownership. 
              Your content is stored on Walrus and recorded on Sui blockchain—forever accessible, forever yours.
            </p>

            <Link href="/author">
              <button className="px-8 py-3.5 bg-gray-900 text-white rounded-full font-medium hover:bg-gray-800 transition-colors duration-200 inline-flex items-center gap-2">
                Start writing
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>

          <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div>
              <div className="text-4xl font-serif font-bold text-gray-900 mb-2">{totalStories}</div>
              <div className="text-sm text-gray-600">Stories published</div>
            </div>
            <div>
              <div className="text-4xl font-serif font-bold text-gray-900 mb-2">∞</div>
              <div className="text-sm text-gray-600">Forever stored</div>
            </div>
            <div>
              <div className="text-4xl font-serif font-bold text-gray-900 mb-2">100%</div>
              <div className="text-sm text-gray-600">You own it</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

