interface MessageProps {
  isBot: boolean;
  content: string;
  createdAt: string;
}

const Message = (props: MessageProps) => {
  console.log(props);
  return (
    <div
      className={`${
        props.isBot
          ? "bg-blue-600 left-0 text-white self-start"
          : "bg-slate-300 right-0 self-end"
      } w-auto max-w-5xl p-2 my-2 border-2 border-sky-400 rounded-lg`}
    >
      <p>{props.content}</p>
    </div>
  );
};

export default Message;
