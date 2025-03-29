import React, { useMemo } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import rehypeRaw from "rehype-raw";

interface MessageProps {
  isBot: boolean;
  content: string;
  createdAt: string;
}

const Message = (props: MessageProps) => {
  // Pre-process content to ensure proper line breaks
  const processedContent = useMemo(() => {
    return props.content.replace(/\n\n/g, "\n\u00A0\n");
  }, [props.content]);

  return (
    <div
      className={`${
        props.isBot ? "text-white self-start" : "self-end"
      } py-2 px-4`}
    >
      <div
        className={`${
          props.isBot ? "bg-blue-600 text-white" : "bg-green-600"
        } w-auto max-w-5xl p-2 border-2 border-sky-400 rounded-lg`}
      >
        <Markdown
          children={processedContent}
          remarkPlugins={[remarkGfm, remarkBreaks]}
          rehypePlugins={[rehypeRaw]}
          components={{
            h3: ({ node, ...props }) => (
              <h3 className="text-xl font-bold mt-4" {...props} />
            ),
            h4: ({ node, ...props }) => (
              <h3 className="text-lg font-bold mt-2" {...props} />
            ),
            ul: ({ node, ...props }) => (
              <ul className="list-disc pl-10" {...props} />
            ),
            ol: ({ node, ...props }) => (
              <ol className="list-decimal pl-10" {...props} />
            ),
          }}
        />
      </div>
    </div>
  );
};

export default Message;
