import ReactMarkdown from "react-markdown";

export function AgentOutputPanel({ markdown }: { markdown: string }) {
  return (
    <article className="max-w-none space-y-3 text-sm leading-relaxed text-nexus-text [&_code]:rounded [&_code]:bg-nexus-bg [&_code]:px-1 [&_code]:font-mono [&_code]:text-nexus-cyan [&_h1]:font-display [&_h1]:text-xl [&_h1]:text-nexus-cyan [&_h2]:font-display [&_h2]:text-lg [&_h2]:text-nexus-text [&_li]:text-nexus-muted [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:text-nexus-muted [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:border [&_pre]:border-[rgba(0,212,255,0.15)] [&_pre]:bg-nexus-bg [&_pre]:p-3 [&_pre]:font-mono [&_pre]:text-xs [&_ul]:list-disc [&_ul]:pl-5">
      <ReactMarkdown>{markdown}</ReactMarkdown>
    </article>
  );
}
