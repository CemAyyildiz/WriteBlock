import LoadingAnimation from '@/components/LoadingAnimation';

export default function LoadingState() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-32">
      <LoadingAnimation message="Loading stories..." size="lg" />
    </div>
  );
}

