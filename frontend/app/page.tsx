'use client';

import { useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import HeroSection from '@/components/home/HeroSection';
import ArticleListItem from '@/components/home/ArticleListItem';
import EmptyArticlesState from '@/components/home/EmptyArticlesState';
import FooterCTA from '@/components/home/FooterCTA';
import LoadingAnimation from '@/components/LoadingAnimation';
import { usePages } from '@/lib/hooks/usePageData';

export default function Dashboard() {
  const { pages, loading, error, fetchPages } = usePages();

  useEffect(() => {
    fetchPages();
  }, [fetchPages]);

  if (loading) {
    return (
      <>
        <Sidebar />
        <div className="flex items-center justify-center min-h-screen bg-white pt-16 lg:pt-0">
          <LoadingAnimation message="Loading stories..." size="lg" />
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Sidebar />
        <div className="flex items-center justify-center min-h-screen bg-white pt-16 lg:pt-0">
          <div className="text-center max-w-md px-4">
            <p className="text-4xl mb-4">📚</p>
            <h2 className="text-2xl font-serif font-bold text-gray-900 mb-2">Something went wrong</h2>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Sidebar />
      
      <main className="bg-white pt-16 lg:pt-0">
        <HeroSection />

        {/* Articles List */}
        {pages.length > 0 ? (
          <>
            <section className="py-16 sm:py-20">
              <div className="max-w-7xl mx-auto px-6 sm:px-8">
                <div className="space-y-12">
                  {pages.map((article) => (
                    <ArticleListItem key={article.page_id} article={article} />
                  ))}
                </div>
              </div>
            </section>
            
            <FooterCTA totalStories={pages.length} />
          </>
        ) : (
          <EmptyArticlesState />
        )}
      </main>
    </>
  );
}
