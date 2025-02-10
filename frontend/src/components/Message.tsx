import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";

interface MessageProps {
  isBot: boolean;
  content: string;
  createdAt: string;
}

const Message = (props: MessageProps) => {
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
          children={props.content}
          remarkPlugins={[remarkGfm, remarkBreaks]}
          rehypePlugins={[rehypeRaw, rehypeSanitize]}
        />
      </div>
    </div>
  );
};

export default Message;
