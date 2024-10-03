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
          props.isBot ? "bg-blue-600 text-white" : "bg-slate-300"
        } w-auto max-w-5xl p-2 border-2 border-sky-400 rounded-lg`}
      >
        <p>{props.content}</p>
      </div>
    </div>
  );
};

export default Message;
