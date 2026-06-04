import ReactMarkdown from 'react-markdown';

export default function MarkdownView({ content }) {
  if (!content) return null;
  return (
    <div className="prose-citadel font-sans text-gray-300 leading-relaxed">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
}
