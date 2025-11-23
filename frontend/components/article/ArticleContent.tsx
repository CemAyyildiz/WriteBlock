import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ArticleContentProps {
  content: string;
}

export default function ArticleContent({ content }: ArticleContentProps) {
  return (
    <div className="prose prose-lg max-w-none mb-16">
      {/* Two-column academic style: wider, cleaner, more breathable */}
      <div className="text-lg leading-[1.75] text-gray-900 
        [&>h1]:text-3xl [&>h1]:font-serif [&>h1]:font-bold [&>h1]:mt-14 [&>h1]:mb-5 [&>h1]:leading-tight [&>h1]:text-gray-900
        [&>h2]:text-2xl [&>h2]:font-serif [&>h2]:font-bold [&>h2]:mt-12 [&>h2]:mb-4 [&>h2]:text-gray-900 [&>h2]:border-b [&>h2]:border-gray-200 [&>h2]:pb-2
        [&>h3]:text-xl [&>h3]:font-serif [&>h3]:font-semibold [&>h3]:mt-10 [&>h3]:mb-3 [&>h3]:text-gray-800
        [&>h4]:text-lg [&>h4]:font-serif [&>h4]:font-semibold [&>h4]:mt-8 [&>h4]:mb-3 [&>h4]:text-gray-700
        [&>p]:mb-6 [&>p]:leading-[1.75] [&>p]:text-gray-800
        [&>p:first-of-type]:text-xl [&>p:first-of-type]:leading-relaxed [&>p:first-of-type]:text-gray-900 [&>p:first-of-type]:font-normal
        [&>ul]:mb-6 [&>ul]:space-y-2 [&>ul]:pl-5
        [&>ol]:mb-6 [&>ol]:space-y-2 [&>ol]:pl-5
        [&>li]:leading-[1.7] [&>li]:text-gray-800
        [&>li]:marker:text-gray-400
        [&>blockquote]:border-l-[3px] [&>blockquote]:border-gray-900 [&>blockquote]:pl-6 [&>blockquote]:pr-4 [&>blockquote]:py-1 [&>blockquote]:italic [&>blockquote]:my-8 [&>blockquote]:text-gray-700 [&>blockquote]:text-lg
        [&>pre]:bg-gray-900 [&>pre]:text-gray-100 [&>pre]:border [&>pre]:border-gray-800 [&>pre]:rounded-lg [&>pre]:p-6 [&>pre]:my-8 [&>pre]:overflow-x-auto [&>pre]:text-sm [&>pre]:leading-relaxed
        [&>code]:bg-gray-100 [&>code]:text-gray-900 [&>code]:px-2 [&>code]:py-0.5 [&>code]:rounded [&>code]:text-[0.9em] [&>code]:font-mono [&>code]:font-normal
        [&>pre_code]:bg-transparent [&>pre_code]:text-gray-100 [&>pre_code]:p-0
        [&>a]:text-blue-600 [&>a]:underline [&>a]:decoration-blue-300 [&>a]:decoration-2 [&>a]:underline-offset-2 [&>a]:hover:decoration-blue-600 [&>a]:transition-colors
        [&>hr]:my-12 [&>hr]:border-t-2 [&>hr]:border-gray-200
        [&>strong]:font-semibold [&>strong]:text-gray-900
        [&>em]:italic [&>em]:text-gray-800
        [&>img]:rounded-lg [&>img]:my-8 [&>img]:shadow-md
        [&>table]:w-full [&>table]:my-8 [&>table]:border-collapse
        [&>table_th]:bg-gray-100 [&>table_th]:px-4 [&>table_th]:py-3 [&>table_th]:text-left [&>table_th]:font-semibold [&>table_th]:border-b-2 [&>table_th]:border-gray-300
        [&>table_td]:px-4 [&>table_td]:py-3 [&>table_td]:border-b [&>table_td]:border-gray-200">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
}

