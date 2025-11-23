import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ArticleContentProps {
  content: string;
}

export default function ArticleContent({ content }: ArticleContentProps) {
  return (
    <div className="prose prose-lg max-w-none mb-16">
      <div className="text-xl leading-relaxed text-gray-800 [&>h1]:text-4xl [&>h1]:font-serif [&>h1]:font-bold [&>h1]:mt-12 [&>h1]:mb-6 [&>h1]:leading-tight [&>h2]:text-3xl [&>h2]:font-serif [&>h2]:font-bold [&>h2]:mt-10 [&>h2]:mb-5 [&>h3]:text-2xl [&>h3]:font-serif [&>h3]:font-bold [&>h3]:mt-8 [&>h3]:mb-4 [&>p]:mb-8 [&>p]:leading-relaxed [&>ul]:mb-8 [&>ol]:mb-8 [&>li]:mb-2 [&>blockquote]:border-l-4 [&>blockquote]:border-gray-300 [&>blockquote]:pl-6 [&>blockquote]:italic [&>blockquote]:my-8 [&>pre]:bg-gray-50 [&>pre]:border [&>pre]:border-gray-200 [&>pre]:rounded-lg [&>pre]:p-6 [&>pre]:my-8 [&>pre]:overflow-x-auto [&>code]:bg-gray-100 [&>code]:px-2 [&>code]:py-1 [&>code]:rounded [&>code]:text-base [&>code]:font-mono">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
}

